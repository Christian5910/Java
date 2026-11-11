"""Check the distributed module lab (theme 15), not a developer's unzipped copy.

The commands are read from the LEIA-ME inside the ZIP and run as written, so a
documented command that stops working fails here. Messages that the roteiro
promises are compared with what the JDK really prints. Compiler wording varies
between JDK versions, so those checks look for stable fragments.
"""
from pathlib import Path
import os, re, shlex, shutil, subprocess, tempfile, time, zipfile

root = Path(__file__).resolve().parents[1]
work = root.parent / '.work/lab-modulos-tests'
work.mkdir(parents=True, exist_ok=True)
java_bin = Path(os.environ['JAVA_HOME']) / 'bin' if os.environ.get('JAVA_HOME') else None


def tool(name):
    # JAVA_HOME wins when it really holds the tool; otherwise fall back to the PATH.
    if java_bin:
        for candidate in (java_bin / (name + '.exe'), java_bin / name):
            if candidate.is_file():
                return str(candidate)
    return name


# English messages and UTF-8 output regardless of the machine that runs the test.
ENV = dict(os.environ, JAVA_TOOL_OPTIONS='-Duser.language=en -Duser.country=US -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -Dsun.stdout.encoding=UTF-8 -Dstderr.encoding=UTF-8 -Dsun.stderr.encoding=UTF-8')


def run(command, folder, ok=True, timeout=90, env=ENV):
    argv = shlex.split(command)
    argv[0] = tool(argv[0])
    result = subprocess.run(argv, cwd=folder, capture_output=True, encoding='utf-8', errors='replace', timeout=timeout, env=env)
    if ok is True and result.returncode:
        raise AssertionError(command + '\n' + result.stdout[-4000:] + '\n' + result.stderr[-3000:])
    if ok is False and not result.returncode:
        raise AssertionError('should have failed: ' + command + '\n' + result.stdout[-2000:])
    return result.stdout.replace('\r', ''), result.stderr.replace('\r', '')


archive = root / 'assets/extras/laboratorio-modulos.zip'
extracted = Path(tempfile.mkdtemp(prefix='extraido-', dir=work)).resolve()
assert extracted.is_relative_to(work.resolve())
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    names = z.namelist()
    for item in names:
        assert not item.startswith('/') and '..' not in Path(item).parts and (extracted / item).resolve().is_relative_to(extracted)
    z.extractall(extracted)

# ---- distributed layout: a starting point that is not already solved, and a separate solution
expected_files = {
    'LEIA-ME.txt',
    'inicio/src/estudo.core/module-info.java',
    'inicio/src/estudo.core/br/estudo/core/Saudacao.java',
    'inicio/src/estudo.testes/module-info.java',
    'inicio/src/estudo.testes/br/estudo/testes/Testes.java',
    'solucao/src/estudo.core/module-info.java',
    'solucao/src/estudo.core/br/estudo/core/Saudacao.java',
    'solucao/src/estudo.core/br/estudo/core/Nota.java',
    'solucao/src/estudo.testes/module-info.java',
    'solucao/src/estudo.testes/br/estudo/testes/Testes.java',
    'solucao/respostas-modelo.txt',
}
assert {n for n in names if not n.endswith('/')} == expected_files, sorted({n for n in names if not n.endswith('/')} ^ expected_files)
assert not any(Path(n).name in ('Nota.java', 'respostas-modelo.txt') for n in names if n.startswith('inicio/')), 'starting point must not contain the solution'
for item in expected_files:
    data = (extracted / item).read_bytes()
    assert not data.startswith(b'\xef\xbb\xbf') and b'\r' not in data, item + ': UTF-8 without BOM and LF only'
    data.decode('utf-8')

readme = (extracted / 'LEIA-ME.txt').read_text(encoding='utf-8')
commands = [line[2:] for line in readme.split('\n') if line.startswith('> ')]
assert 'NÃO executa no Playground de console' in readme
for needed in ['javac --release 17 -encoding UTF-8 -d mods --module-source-path src -m estudo.core,estudo.testes',
               'java --module-path mods -m estudo.core/br.estudo.core.Saudacao',
               'java --module-path mods -m estudo.testes/br.estudo.testes.Testes',
               'mkdir artefatos',
               'jar --create --file artefatos/estudo.core.jar -C mods/estudo.core .',
               'jar --create --file artefatos/estudo.testes.jar --main-class br.estudo.testes.Testes -C mods/estudo.testes .',
               'java --module-path artefatos -m estudo.testes',
               'jar --describe-module --file artefatos/estudo.core.jar',
               'jdeps --module-path artefatos -s artefatos/estudo.testes.jar']:
    assert needed in commands, 'documented command missing: ' + needed
BUILD, SAUDACAO, TESTES = commands[2], commands[3], commands[4]
assert BUILD.startswith('javac ') and SAUDACAO.endswith('Saudacao') and TESTES.endswith('Testes')


def touch_newer(path):
    # javac -m recompiles only sources newer than the classes in mods; make that independent of clock granularity
    later = time.time() + 5
    os.utime(path, (later, later))


def copy_of(name, label):
    target = Path(tempfile.mkdtemp(prefix=label + '-', dir=work)).resolve()
    shutil.copytree(extracted / name, target, dirs_exist_ok=True)
    return target


# ---- step 1: the starting point compiles and runs, with no scenarios yet
inicio = copy_of('inicio', 'inicio')
run(BUILD, inicio)
assert run(SAUDACAO, inicio)[0].strip() == 'Módulo pronto'
assert run(TESTES, inicio)[0].strip() == '0 verificações passaram.'
# accents without the environment variable: the documented -D line must be enough
plain = {k: v for k, v in os.environ.items() if k != 'JAVA_TOOL_OPTIONS'}
dline = next(c for c in commands if c.startswith('java -Dfile.encoding=UTF-8'))
assert run(dline, inicio, env=plain)[0].strip() == '0 verificações passaram.'

# ---- steps 2 and 3: the possible solution
solucao = copy_of('solucao', 'solucao')
run(BUILD, solucao)
assert run(SAUDACAO, solucao)[0].strip() == 'Módulo pronto'
assert run(TESTES, solucao)[0].strip() == '15 verificações passaram.'
assert 'a solução usa 15' in readme
assert 'RECOMPILAR COM SEGURANÇA' in readme and 'apague mods' in readme

# the tests must protect the rule: >= 7 becomes > 7
broken = copy_of('solucao', 'quebrada')
nota = broken / 'src/estudo.core/br/estudo/core/Nota.java'
text = nota.read_text(encoding='utf-8')
assert 'valor >= APROVACAO' in text
nota.write_text(text.replace('valor >= APROVACAO', 'valor > APROVACAO'), encoding='utf-8')
run(BUILD, broken)
out, err = run(TESTES, broken, ok=False)
assert 'AssertionError' in err and '7 deveria dar Aprovado' in err, err

# ---- step 4: three deliberate failures, following the documented order
# A) renamed package. On top of an old mods folder the compiler can finish without any error...
a = copy_of('solucao', 'falha-a')
run(BUILD, a)
path = a / 'src/estudo.core/br/estudo/core/Nota.java'
path.write_text(path.read_text(encoding='utf-8').replace('package br.estudo.core;', 'package br.estudo.nucleo;', 1), encoding='utf-8')
touch_newer(path)
run(BUILD, a)  # stale mods: only Nota.java is newer, Testes.java is not revalidated
# ...which is why the roteiro tells the student to delete mods first. With a clean folder it must fail.
shutil.rmtree(a / 'mods')
_, err = run(BUILD, a, ok=False)
assert 'Nota' in err, err

# B) module without its dependency
b = copy_of('solucao', 'falha-b')
run(BUILD, b)
descriptor = b / 'src/estudo.testes/module-info.java'
descriptor.write_text('module estudo.testes {\n}\n', encoding='utf-8')
touch_newer(descriptor)
run(BUILD, b)  # stale mods again: silent
shutil.rmtree(b / 'mods')
_, err = run(BUILD, b, ok=False)
assert 'package br.estudo.core is not visible' in err and 'does not read it' in err, err

c = copy_of('solucao', 'falha-c')
run(BUILD, c)
shutil.rmtree(c / 'mods/estudo.core')
out, err = run(TESTES, c, ok=False)
# the JVM reports boot-layer failures on stdout, so look at both streams; main() must not have run
assert 'Module estudo.core not found, required by estudo.testes' in out + err and 'verificações' not in out + err, out + err

# ---- challenge 1: an internal package that is not exported
d1 = copy_of('solucao', 'desafio1')
core = d1 / 'src/estudo.core/br/estudo/core'
(core / 'interno').mkdir()
(core / 'interno/Limites.java').write_text(
    'package br.estudo.core.interno;\n\npublic final class Limites {\n'
    '    public static final double MINIMA = 0;\n    public static final double MAXIMA = 10;\n'
    '    public static final double APROVACAO = 7;\n    private Limites() {}\n}\n', encoding='utf-8')
text = (core / 'Nota.java').read_text(encoding='utf-8')
text = text.replace('package br.estudo.core;\n', 'package br.estudo.core;\n\nimport br.estudo.core.interno.Limites;\n', 1)
text = re.sub(r'    private static final double \w+ = \d+;\n', '', text)
for name in ('MINIMA', 'MAXIMA', 'APROVACAO'):
    text = re.sub(r'(?<![\w.])' + name + r'\b', 'Limites.' + name, text)
(core / 'Nota.java').write_text(text, encoding='utf-8')
run(BUILD, d1)
assert run(TESTES, d1)[0].strip() == '15 verificações passaram.'
testes = d1 / 'src/estudo.testes/br/estudo/testes/Testes.java'
original = testes.read_text(encoding='utf-8')
testes.write_text(original.replace('import br.estudo.core.Nota;', 'import br.estudo.core.Nota;\nimport br.estudo.core.interno.Limites;'), encoding='utf-8')
touch_newer(testes)
stale_out, stale_err = run(BUILD, d1, ok=None)  # old mods: either silent or the misleading "does not exist"
assert 'is not visible' not in stale_err, stale_err
shutil.rmtree(d1 / 'mods')
_, err = run(BUILD, d1, ok=False)
assert 'package br.estudo.core.interno is not visible' in err and 'does not export it' in err, err
testes.write_text(original, encoding='utf-8')
shutil.rmtree(d1 / 'mods', ignore_errors=True)

# ---- challenge 2: modular JARs, run, describe and inspect (built on the challenge 1 variant)
run(BUILD, d1)
for command in commands:
    if command.startswith(('mkdir artefatos', 'jar --create')):
        run(command, d1)
assert run('java --module-path artefatos -m estudo.testes', d1)[0].strip() == '15 verificações passaram.'
described = run('jar --describe-module --file artefatos/estudo.core.jar', d1)[0]
assert re.search(r'^exports br\.estudo\.core$', described, re.M) and 'requires java.base mandated' in described
assert 'contains br.estudo.core.interno' in described and 'exports br.estudo.core.interno' not in described
deps = run('jdeps --module-path artefatos -s artefatos/estudo.testes.jar', d1)[0]
assert 'estudo.testes -> estudo.core' in deps and 'estudo.testes -> java.base' in deps

# ---- challenge 3: today's rule accepts the forms the roteiro lists; a strict rule satisfies the new requirement
PROBE = '''import br.estudo.core.Nota;
public class Sonda {
    public static void main(String[] args) {
        for (String texto : args) {
            String resposta;
            try { resposta = Nota.avaliar(texto); } catch (IllegalArgumentException e) { resposta = "RECUSA"; }
            System.out.println(texto.trim() + " -> " + resposta);
        }
    }
}
'''


def probe(folder, values):
    sonda = folder / 'sonda'
    sonda.mkdir(exist_ok=True)
    (sonda / 'Sonda.java').write_text(PROBE, encoding='utf-8')
    run(f'javac --release 17 -encoding UTF-8 -p mods --add-modules estudo.core -d {sonda}/out {sonda}/Sonda.java', folder)
    argv = ['java', '-p', 'mods', '--add-modules', 'estudo.core', '-cp', str(sonda / 'out'), 'Sonda', *values]
    argv[0] = tool('java')
    result = subprocess.run(argv, cwd=folder, capture_output=True, encoding='utf-8', env=ENV, timeout=60)
    assert result.returncode == 0, result.stderr
    return dict(line.split(' -> ') for line in result.stdout.replace('\r', '').strip().split('\n'))


base = copy_of('solucao', 'base-d3')
run(BUILD, base)
accepted_today = probe(base, ['1e1', '7d', '0x1p3', '7.', '+7'])
assert all(v == 'Aprovado' for v in accepted_today.values()), accepted_today

strict = copy_of('solucao', 'estrito-d3')
nota = strict / 'src/estudo.core/br/estudo/core/Nota.java'
text = nota.read_text(encoding='utf-8')
assert 'final double valor;' in text
text = text.replace('        final double valor;', '        if (!texto.trim().matches("\\\\d+([.,]\\\\d+)?")) throw new IllegalArgumentException("Use um número de 0 a 10.");\n        final double valor;', 1)
nota.write_text(text, encoding='utf-8')
run(BUILD, strict)
assert run(TESTES, strict)[0].strip() == '15 verificações passaram.', 'the old scenarios must keep passing'
result = probe(strict, ['7', '7,5', '7.5', '10', '0', '  7  ', '1e1', '7d', '0x1p3', '7.', '.5', '+7'])
for good in ['7', '7,5', '7.5', '10', '0']:
    assert result[good] != 'RECUSA', good
assert result['7'] == 'Aprovado'
for bad in ['1e1', '7d', '0x1p3', '7.', '.5', '+7']:
    assert result[bad] == 'RECUSA', bad

print('PASS downloadable lab: modules (theme 15)')
print('NOTE: compiler wording was checked on the installed JDK only; --release 17 requires its JDK 17+ signature data.')
