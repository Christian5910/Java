"""Check the distributed Swing lab (theme 16), not a developer's unzipped copy.

Commands are read from the LEIA-ME inside the ZIP and run as written. The UI verifier runs without a window,
so this test also proves that it catches real defects: each broken variant of the solution must be reported
with the matching line. What needs a real window (focus, Tab, Alt+key, the look on a display) is NOT checked
here, and the LEIA-ME hands it to the student as a manual list.
"""
from pathlib import Path
import os, re, shlex, shutil, subprocess, tempfile, zipfile

root = Path(__file__).resolve().parents[1]
work = root.parent / '.work/lab-swing-tests'
work.mkdir(parents=True, exist_ok=True)
java_bin = Path(os.environ['JAVA_HOME']) / 'bin' if os.environ.get('JAVA_HOME') else None


def tool(name):
    # JAVA_HOME wins when it really holds the tool; otherwise fall back to the PATH.
    if java_bin:
        for candidate in (java_bin / (name + '.exe'), java_bin / name):
            if candidate.is_file():
                return str(candidate)
    return name


ENV = dict(os.environ, JAVA_TOOL_OPTIONS='-Duser.language=en -Duser.country=US -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -Dsun.stdout.encoding=UTF-8 -Dstderr.encoding=UTF-8 -Dsun.stderr.encoding=UTF-8')


def run(command, folder, ok=True, timeout=120, env=ENV):
    argv = shlex.split(command)
    argv[0] = tool(argv[0])
    result = subprocess.run(argv, cwd=folder, capture_output=True, encoding='utf-8', errors='replace', timeout=timeout, env=env)
    out, err = result.stdout.replace('\r', ''), result.stderr.replace('\r', '')
    if ok is True and result.returncode:
        raise AssertionError(command + '\n' + out[-3000:] + '\n' + err[-3000:])
    if ok is False and not result.returncode:
        raise AssertionError('should have failed: ' + command + '\n' + out[-2000:])
    return out, err


archive = root / 'assets/extras/laboratorio-swing-formulario.zip'
extracted = Path(tempfile.mkdtemp(prefix='extraido-', dir=work)).resolve()
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    names = z.namelist()
    for item in names:
        assert not item.startswith('/') and '..' not in Path(item).parts and (extracted / item).resolve().is_relative_to(extracted)
    z.extractall(extracted)

# ---- layout: a starting point that is not already solved, a separate solution
SRC = 'src/br/estudo/'
common = ['Nota', 'Main', 'VerificarFormulario', 'FormularioNotas', 'Testes']
expected_files = {'LEIA-ME.txt', 'inicio/fontes.txt', 'solucao/fontes.txt'}
expected_files |= {f'inicio/{SRC}{n}.java' for n in common}
expected_files |= {f'solucao/{SRC}{n}.java' for n in common + ['Nome']}
assert {n for n in names if not n.endswith('/')} == expected_files, sorted({n for n in names if not n.endswith('/')} ^ expected_files)
assert not (extracted / f'inicio/{SRC}Nome.java').exists(), 'the starting point must not contain the name rule'
start_form = (extracted / f'inicio/{SRC}FormularioNotas.java').read_text(encoding='utf-8')
assert 'Limpar' not in start_form and 'Nome' not in start_form, 'the starting point must not contain the work to be done'
for shared in ('VerificarFormulario', 'Nota', 'Main'):
    assert (extracted / f'inicio/{SRC}{shared}.java').read_bytes() == (extracted / f'solucao/{SRC}{shared}.java').read_bytes(), shared + ' must be identical in both projects'
for item in expected_files:
    data = (extracted / item).read_bytes()
    assert not data.startswith(b'\xef\xbb\xbf') and b'\r' not in data, item
    data.decode('utf-8')
assert (extracted / 'inicio/fontes.txt').read_text().split() == [f'{SRC}{n}.java' for n in ('Nota', 'FormularioNotas', 'Main', 'Testes', 'VerificarFormulario')]

readme = (extracted / 'LEIA-ME.txt').read_text(encoding='utf-8')
commands = [line[2:] for line in readme.split('\n') if line.startswith('> ')]
assert 'NÃO executa no Playground de console' in readme and 'NÃO abrem janela' in readme
BUILD = 'javac --release 17 -encoding UTF-8 -d out @fontes.txt'
TESTES = 'java -cp out br.estudo.Testes'
VERIFICAR = 'java -cp out br.estudo.VerificarFormulario'
CONSULTA = 'java -cp out br.estudo.VerificarFormulario consulta'
MAIN = 'java -cp out br.estudo.Main'
for needed in (BUILD, TESTES, VERIFICAR, CONSULTA, MAIN):
    assert needed in commands, 'documented command missing: ' + needed
dline = next(c for c in commands if c.startswith('java -Dfile.encoding=UTF-8'))
for promised in ('3 de 18', '18 de 18', '19 de 19', '12 verificações de domínio', 'a solução usa 30'):
    assert promised in readme, promised


def copy_of(name, label):
    target = Path(tempfile.mkdtemp(prefix=label + '-', dir=work)).resolve()
    shutil.copytree(extracted / name, target, dirs_exist_ok=True)
    return target


def clean(text):
    # javac/java may print the JAVA_TOOL_OPTIONS notice on stderr; it is not part of the program output
    return '\n'.join(l for l in text.split('\n') if not l.startswith('Picked up'))


def edit(folder, relative, old, new, count=1):
    path = folder / relative
    text = path.read_text(encoding='utf-8')
    assert text.count(old) == count, f'{relative}: pattern not found {count}x: {old[:60]!r} (found {text.count(old)})'
    path.write_text(text.replace(old, new), encoding='utf-8')


# ---- step 1: the starting point
inicio = copy_of('inicio', 'inicio')
run(BUILD, inicio)
assert run(TESTES, inicio)[0].strip() == '12 verificações de domínio passaram.'
out, err = run(VERIFICAR, inicio, ok=False)
assert '3 de 18 verificações de interface passaram.' in out, out
assert 'FALHA  campo do nome' in out and 'FALHA  botão Limpar' in out and 'MANUAL' in out
assert 'mesma causa da falha anterior' in out, 'repeated causes must be collapsed'
assert 'Exception in thread' not in clean(err) and 'Exception in thread' not in out, err
assert run(dline, inicio, env={k: v for k, v in os.environ.items() if k != 'JAVA_TOOL_OPTIONS'})[0].strip() == '12 verificações de domínio passaram.'

# ---- the possible solution
SOL_BUILD_OK = {}
solucao = copy_of('solucao', 'solucao')
run(BUILD, solucao)
assert (solucao / 'out/br/estudo/Main.class').is_file(), 'Main must compile (it is not opened here: the JRE has no display)'
assert run(TESTES, solucao)[0].strip() == '30 verificações de domínio passaram.'
out, err = run(VERIFICAR, solucao)
assert out.split('\n')[0] == '18 de 18 verificações de interface passaram.', out
assert 'FALHA' not in out and 'Exception in thread' not in clean(err), err
assert out.count('  - ') == 3, 'three MANUAL items'
out, _ = run(CONSULTA, solucao, ok=False)  # the synchronous solution does not satisfy challenge D1
assert 'FALHA  D1:' in out and '18 de 19' in out, out

# ---- the verifier must catch real defects: each broken variant is reported with the matching line
MUTATIONS = [
    ('Limpar without mnemonic', 'FormularioNotas', 'limpar.setMnemonic(KeyEvent.VK_L);\n', '', 'botão Limpar com mnemônico L'),
    ('Conferir without mnemonic', 'FormularioNotas', 'conferir.setMnemonic(KeyEvent.VK_C);\n', '', 'botão Conferir com mnemônico C'),
    ('default button is Limpar', 'FormularioNotas', 'return conferir;\n    }', 'return limpar;\n    }', 'botão Conferir com mnemônico C'),
    ('name label not linked to the field', 'FormularioNotas', 'rotuloNome.setLabelFor(campoNome);\n', '', 'campo do nome com nome acessível'),
    ('rows swapped (nota above nome)', 'FormularioNotas', [('linha(0, rotuloNome, campoNome);', 'linha(2, rotuloNome, campoNome);'), ('linha(2, rotuloNota, campoNota);', 'linha(0, rotuloNota, campoNota);')], None, 'ordem visual'),
    ('name error below the wrong field', 'FormularioNotas', 'linha(1, null, erroNome);', 'linha(3, null, erroNome);', 'mensagem de erro do nome fica entre'),
    ('result without accessible name', 'FormularioNotas', 'resultado.getAccessibleContext().setAccessibleName("Resultado da avaliação");\n', '', 'mensagem inicial'),
    ('window too narrow: texts are cut', 'FormularioNotas', 'setPreferredSize(new java.awt.Dimension(Math.max(getPreferredSize().width, LARGURA_MINIMA), getPreferredSize().height));\n', '', 'as mensagens cabem na janela'),
    ('Limpar forgets the error messages', 'FormularioNotas', '        erroNome.setText(SEM_ERRO);\n        erroNota.setText(SEM_ERRO);\n        resultado.setText(INICIAL);\n        campoNome.requestFocusInWindow();', '        resultado.setText(INICIAL);\n        campoNome.requestFocusInWindow();', 'Limpar esvazia campos'),
    ('success keeps the typed name (no normalization)', 'FormularioNotas', 'resultado.setText(nome + ": " + situacao);', 'resultado.setText(campoNome.getText() + ": " + situacao);', 'aprovação'),
    ('errors not cleared after correction', 'FormularioNotas', '        erroNome.setText(problemaNome == null ? SEM_ERRO : problemaNome);\n        erroNota.setText(problemaNota == null ? SEM_ERRO : problemaNota);', '        if (problemaNome != null) erroNome.setText(problemaNome);\n        if (problemaNota != null) erroNota.setText(problemaNota);', 'corrigir os campos apaga'),
    ('name rule without trim', 'Nome', 'texto.trim().replaceAll', 'texto.replaceAll', 'aprovação'),
]
for label, source, old, new, expected_line in MUTATIONS:
    broken = copy_of('solucao', 'quebrada')
    for antigo, novo in (old if isinstance(old, list) else [(old, new)]):
        edit(broken, f'{SRC}{source}.java', antigo, novo)
    run(BUILD, broken)
    out, err = run(VERIFICAR, broken, ok=False)
    assert any(line.startswith('FALHA  ' + expected_line) for line in out.split('\n')), f'{label}: not reported as "{expected_line}"\n{out}'
    assert 'Exception in thread' not in clean(err), f'{label}: noise on stderr\n{err}'
    assert not out.startswith('18 de 18'), label

# Responsibilities are separate: the UI verifier checks the screen against the rule, the domain tests check the rule.
# A broken Nota (accepts NaN) leaves the screen consistent with it, so only Testes may report it.
broken = copy_of('solucao', 'nota-quebrada')
edit(broken, f'{SRC}Nota.java', '!Double.isFinite(nota) || ', '')
run(BUILD, broken)
_, err = run(TESTES, broken, ok=False)
assert 'AssertionError' in err and 'NaN' in err, err
assert run(VERIFICAR, broken)[0].split('\n')[0] == '18 de 18 verificações de interface passaram.'

# the domain tests protect the name rule too
broken = copy_of('solucao', 'sem-trim')
edit(broken, f'{SRC}Nome.java', 'texto.trim().replaceAll', 'texto.replaceAll')
run(BUILD, broken)
out, err = run(TESTES, broken, ok=False)
# the roteiro promises "terminates with an error instead of printing 'passaram'": here the leading space survives and
# Nome refuses it, so the program dies with an exception rather than an AssertionError
assert 'passaram' not in out and 'Exception in thread' in err, out + err
assert 'terminar com erro (AssertionError ou uma exceção)' in readme

# ---- challenge D1: asynchronous consultation satisfies both the base and the "consulta" contract
d1 = copy_of('solucao', 'desafio1')
edit(d1, f'{SRC}FormularioNotas.java', '        resultado.setText(nome + ": " + situacao);\n    }', '''        conferir.setEnabled(false);
        resultado.setText("Consultando...");
        final String texto = nome + ": " + situacao;
        new javax.swing.SwingWorker<String, Void>() {
            @Override protected String doInBackground() throws Exception {
                Thread.sleep(1500);
                return texto;
            }

            @Override protected void done() {
                try {
                    resultado.setText(get());
                } catch (Exception falha) {
                    resultado.setText("Falha na consulta.");
                }
                conferir.setEnabled(true);
            }
        }.execute();
    }''')
run(BUILD, d1)
assert run(VERIFICAR, d1)[0].split('\n')[0] == '18 de 18 verificações de interface passaram.'
assert run(CONSULTA, d1)[0].split('\n')[0] == '19 de 19 verificações de interface passaram.'
# a lazy variant that sleeps on the event thread must be caught by the D1 check
lazy = copy_of('solucao', 'desafio1-travado')
edit(lazy, f'{SRC}FormularioNotas.java', '        resultado.setText(nome + ": " + situacao);\n    }', '''        conferir.setEnabled(false);
        resultado.setText("Consultando...");
        try {
            Thread.sleep(1500);
        } catch (InterruptedException ignorada) {
            Thread.currentThread().interrupt();
        }
        resultado.setText(nome + ": " + situacao);
        conferir.setEnabled(true);
    }''')
run(BUILD, lazy)
out, _ = run(CONSULTA, lazy, ok=False)
assert 'FALHA  D1:' in out, out

# ---- challenge D2: non-breaking space. The solution refuses it today; the reference fix satisfies the new requirement
PROBE = '''import br.estudo.Nome;
public class Sonda {
    public static void main(String[] args) {
        String[] casos = {"Ana\\u00A0Silva", "\\u00A0Ana\\u00A0", "\\u00A0\\u00A0", "Ana Silva", "Ana\\u200BSilva"};
        for (int i = 0; i < casos.length; i++) {
            String resposta;
            try { resposta = "[" + Nome.normalizar(casos[i]) + "]"; } catch (Throwable t) { resposta = t.getClass().getSimpleName() + ": " + t.getMessage(); }
            System.out.println(i + " -> " + resposta);
        }
    }
}
'''


def probe(folder):
    sonda = folder / 'sonda'
    sonda.mkdir(exist_ok=True)
    (sonda / 'Sonda.java').write_text(PROBE, encoding='utf-8')
    run(f'javac --release 17 -encoding UTF-8 -cp out -d {sonda}/out {sonda}/Sonda.java', folder)
    result = subprocess.run([tool('java'), '-cp', f'out{os.pathsep}{sonda}/out', 'Sonda'], cwd=folder, capture_output=True, encoding='utf-8', env=ENV, timeout=60)
    assert result.returncode == 0, result.stderr
    return dict(line.split(' -> ') for line in result.stdout.replace('\r', '').strip().split('\n'))


MENSAGEM_2 = 'IllegalArgumentException: Use apenas letras, espaços, hífen e apóstrofo.'
today = probe(solucao)
assert today['0'] == today['1'] == today['2'] == MENSAGEM_2, today  # what the roteiro says: "Hoje esses textos recebem a mensagem 2"
assert today['3'] == '[Ana Silva]'

OLD = '        if (texto == null || texto.isBlank()) throw new IllegalArgumentException("Informe o nome.");\n        String nome = texto.trim().replaceAll("\\\\s+", " ");'
d2 = copy_of('solucao', 'desafio2')
edit(d2, f'{SRC}Nome.java', OLD, '''        if (texto == null) throw new IllegalArgumentException("Informe o nome.");
        String nome = texto.replace('\\u00A0', ' ').trim().replaceAll("\\\\s+", " ");
        if (nome.isEmpty()) throw new IllegalArgumentException("Informe o nome.");''')
run(BUILD, d2)
fixed = probe(d2)
assert fixed['0'] == '[Ana Silva]' and fixed['1'] == '[Ana]' and fixed['2'] == 'IllegalArgumentException: Informe o nome.', fixed
assert fixed['4'] == MENSAGEM_2, 'zero-width space is still refused'
assert run(TESTES, d2)[0].strip() == '30 verificações de domínio passaram.', 'the old scenarios keep passing'
assert run(VERIFICAR, d2)[0].split('\n')[0] == '18 de 18 verificações de interface passaram.'
# the hint in the roteiro: without the empty check, a text made only of U+00A0 breaks
naive = copy_of('solucao', 'desafio2-ingenuo')
edit(naive, f'{SRC}Nome.java', OLD, '''        if (texto == null) throw new IllegalArgumentException("Informe o nome.");
        String nome = texto.replace('\\u00A0', ' ').trim().replaceAll("\\\\s+", " ");''')
run(BUILD, naive)
assert 'StringIndexOutOfBoundsException' in probe(naive)['2']
assert 'StringIndexOutOfBoundsException' in readme

print('PASS downloadable lab: Swing form (theme 16)')
print('NOT CHECKED HERE: opening a real window, focus, Tab/Enter/Alt+key in a window, the look on a display. The JRE used has no display support.')
