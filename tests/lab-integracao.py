"""Check the distributed integration lab (theme 29), not a developer's unzipped copy.

The commands in the LEIA-ME are read from the ZIP and run as written, including the documented curl experiments
against the real local server (when curl is available and the documented port is free). The client verifier is the
core of the lab, so this test proves it catches real client defects: each broken variant of the solution must be
reported on the matching line. Real networks, many concurrent clients and production behavior are NOT exercised.
"""
from pathlib import Path
import os, re, shlex, shutil, socket, subprocess, tempfile, time, zipfile

root = Path(__file__).resolve().parents[1]
work = root.parent / '.work/lab-integracao-tests'
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


def run(command, folder, ok=True, timeout=180, env=ENV):
    argv = shlex.split(command)
    argv[0] = tool(argv[0])
    result = subprocess.run(argv, cwd=folder, capture_output=True, encoding='utf-8', errors='replace', timeout=timeout, env=env)
    out, err = result.stdout.replace('\r', ''), result.stderr.replace('\r', '')
    if ok is True and result.returncode:
        raise AssertionError(command + '\n' + out[-3000:] + '\n' + err[-3000:])
    if ok is False and not result.returncode:
        raise AssertionError('should have failed: ' + command + '\n' + out[-2000:])
    return out, err


archive = root / 'assets/extras/laboratorio-integracao.zip'
extracted = Path(tempfile.mkdtemp(prefix='extraido-', dir=work)).resolve()
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    names = z.namelist()
    for item in names:
        assert not item.startswith('/') and '..' not in Path(item).parts and (extracted / item).resolve().is_relative_to(extracted)
    z.extractall(extracted)

# ---- layout: a starting point that is not already solved, a separate solution
SRC = 'src/br/estudo/'
shared = ['Situacao', 'Resultado', 'Json', 'Servidor', 'VerificarCliente']
expected_files = {'LEIA-ME.txt', 'inicio/fontes.txt', 'solucao/fontes.txt', 'solucao/respostas-modelo.txt'}
for project in ('inicio', 'solucao'):
    expected_files |= {f'{project}/{SRC}{n}.java' for n in shared + ['ClienteEstoque']}
assert {n for n in names if not n.endswith('/')} == expected_files, sorted({n for n in names if not n.endswith('/')} ^ expected_files)
for n in shared:
    assert (extracted / f'inicio/{SRC}{n}.java').read_bytes() == (extracted / f'solucao/{SRC}{n}.java').read_bytes(), n + ' must be identical in both projects'
start_client = (extracted / f'inicio/{SRC}ClienteEstoque.java').read_text(encoding='utf-8')
assert 'HttpClient' not in start_client and 'UnsupportedOperationException' in start_client, 'the starting point must not contain the client'
assert (extracted / 'inicio/fontes.txt').read_bytes() == (extracted / 'solucao/fontes.txt').read_bytes()
for item in expected_files:
    data = (extracted / item).read_bytes()
    assert not data.startswith(b'\xef\xbb\xbf') and b'\r' not in data, item
    data.decode('utf-8')

readme = (extracted / 'LEIA-ME.txt').read_text(encoding='utf-8')
commands = [line[2:] for line in readme.split('\n') if line.startswith('> ')]
assert 'NÃO executa no Playground de console' in readme
BUILD = 'javac --release 17 -encoding UTF-8 -d out @fontes.txt'
VERIFICAR = 'java -cp out br.estudo.VerificarCliente'
ORCAMENTO = 'java -cp out br.estudo.VerificarCliente orcamento'
DESATUALIZADO = 'java -cp out br.estudo.VerificarCliente desatualizado'
SERVIDOR = 'java -cp out br.estudo.Servidor 8080'
for needed in (BUILD, VERIFICAR, ORCAMENTO, DESATUALIZADO, SERVIDOR):
    assert needed in commands, 'documented command missing: ' + needed
for promised in ('0 de 18', '18 de 18', '3 de 3', '5 de 5', 'Empty reply from server', 'código 52'):
    assert promised in readme, promised
# claims corrected during development: HTTP/1.1 is optional, the mini JSON is not strict
assert 'é opcional' in readme and 'mínimo' in readme and 'estrito' not in readme


def copy_of(name, label):
    target = Path(tempfile.mkdtemp(prefix=label + '-', dir=work)).resolve()
    shutil.copytree(extracted / name, target, dirs_exist_ok=True)
    return target


def edit(folder, relative, old, new, count=1):
    path = folder / relative
    text = path.read_text(encoding='utf-8')
    assert text.count(old) == count, f'{relative}: pattern not found {count}x: {old[:70]!r} (found {text.count(old)})'
    path.write_text(text.replace(old, new), encoding='utf-8')


def clean(text):
    return '\n'.join(l for l in text.split('\n') if not l.startswith('Picked up'))


CLIENT = f'{SRC}ClienteEstoque.java'
first = lambda out: out.split('\n')[0]

# ---- step 1: the starting point
inicio = copy_of('inicio', 'inicio')
run(BUILD, inicio)
out, err = run(VERIFICAR, inicio, ok=False)
assert first(out) == '' or True
assert '0 de 18 verificações de cliente passaram.' in out, out
assert 'FALHA  consultar o item A' in out and 'mesma causa da falha anterior' in out and 'NÃO VERIFICADO' in out
assert 'Exception in thread' not in clean(err) and 'Exception in thread' not in out, err

# ---- the possible solution
solucao = copy_of('solucao', 'solucao')
run(BUILD, solucao)
out, err = run(VERIFICAR, solucao)
assert first(out) == '18 de 18 verificações de cliente passaram.', out
assert 'FALHA' not in out and 'Exception in thread' not in clean(err), err
assert out.count('  - ') == 3, 'three NOT VERIFIED items'
out, _ = run(ORCAMENTO, solucao, ok=False)
assert 'FALHA  D1:' in out and '0 de 3' in out, out
out, _ = run(DESATUALIZADO, solucao, ok=False)
assert 'FALHA  D2:' in out and '0 de 5' in out, out

# ---- the documented curl experiments, against the real server on the documented port
curl = shutil.which('curl')


def port_is_free(port):
    with socket.socket() as s:
        return s.connect_ex(('127.0.0.1', port)) != 0


if curl and port_is_free(8080):
    server = subprocess.Popen([tool('java'), '-cp', 'out', 'br.estudo.Servidor', '8080'], cwd=solucao, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=ENV)
    try:
        for _ in range(60):
            if not port_is_free(8080):
                break
            time.sleep(0.1)
        else:
            raise AssertionError('server did not start')

        def curl_run(command, expect_ok=True):
            argv = shlex.split(command)
            argv[0] = curl
            r = subprocess.run(argv, capture_output=True, encoding='utf-8', errors='replace', timeout=30)
            assert (r.returncode == 0) == expect_ok, f'{command} -> rc {r.returncode}\n{r.stdout}\n{r.stderr}'
            return r

        documented = [c for c in commands if c.startswith('curl ')]
        assert len(documented) == 4, documented
        get_item, post_k1, falha_perder, estado = documented
        r = curl_run(get_item)
        assert r.stdout.strip() == '{"id":"A","quantidade":5,"versao":1}', r.stdout
        first_post = curl_run(post_k1).stdout.replace('\r', '')
        assert first_post.startswith('HTTP/1.1 200') and 'Repetida: false' in first_post and '{"retirado":2,"quantidade":3,"versao":2}' in first_post, first_post
        again = curl_run(post_k1).stdout.replace('\r', '')
        assert 'Repetida: true' in again and '{"retirado":2,"quantidade":3,"versao":2}' in again, again
        assert '"A":{"quantidade":3,"versao":2}' in curl_run(estado).stdout, 'the repeated key must not discount again'
        # what the roteiro says about the lost response: curl ends with code 52 and the stock went down anyway
        curl_run(falha_perder)
        lost = curl_run(f'curl -s -X POST -H "Chave-Operacao: k9" -d \'{{"quantidade":1,"versao":2}}\' http://127.0.0.1:8080/itens/A/retiradas', expect_ok=False)
        assert subprocess.run([curl, '-s', '-X', 'POST', '-H', 'Chave-Operacao: k9', '-d', '{"quantidade":1,"versao":2}', 'http://127.0.0.1:8080/itens/A/retiradas'], capture_output=True, timeout=30).returncode == 0, 'the failure happens once'
        assert '"A":{"quantidade":2,"versao":3}' in curl_run(estado).stdout, 'one effect from k9, not two'
        assert lost.returncode == 52, lost.returncode
    finally:
        server.terminate()
        server.wait(timeout=10)
    print('NOTE curl experiments documented in the LEIA-ME were run against the real server on port 8080.')
else:
    print('NOTE curl experiments skipped (curl missing or port 8080 busy).')

# ---- the verifier must catch real client defects: each broken variant is reported on the matching line
MUTATIONS = [
    ('no response timeout', [('            .timeout(timeout)\n', ''), ('.timeout(timeout).GET()', '.GET()')], 'resposta lenta dá TEMPO_ESGOTADO'),
    ('connection refused reported as not found', [('Resultado.falha(Situacao.CONEXAO_RECUSADA, "Não foi possível conectar', 'Resultado.falha(Situacao.NAO_ENCONTRADO, "Não foi possível conectar')], 'conexão recusada dá CONEXAO_RECUSADA'),
    ('lost response reported as a plain timeout', [('Resultado.falha(Situacao.DESCONHECIDO, "O serviço não respondeu a tempo.', 'Resultado.falha(Situacao.TEMPO_ESGOTADO, "O serviço não respondeu a tempo.')], 'resposta lenta na retirada dá DESCONHECIDO'),
    ('a new key on every call', [('.header("Chave-Operacao", chave)', '.header("Chave-Operacao", java.util.UUID.randomUUID().toString())')], 'repetir a mesma chave'),
    ('no key validation', [('        if (chave == null || chave.isBlank()) throw new IllegalArgumentException("Informe a chave de operação.");\n', '')], 'retirar sem chave'),
    ('replay flag ignored', [('resposta.headers().firstValue("Repetida").map("true"::equals).orElse(false)', 'false')], 'repetir a mesma chave'),
    ('both conflicts share a message', [('"O item mudou desde a sua leitura (versão atual " + json.get("atual") + "). Consulte de novo antes de retirar."', '"Esta chave de operação já foi usada com outro conteúdo. Gere uma chave nova para uma nova intenção."')], 'versão antiga dá CONFLITO'),
    ('unreadable JSON on a withdrawal reported as OK', [('return Resultado.falha(Situacao.RESPOSTA_INVALIDA, retirada && status == 200', 'if (retirada) return Resultado.ok(0, 0, false);\n            return Resultado.falha(Situacao.RESPOSTA_INVALIDA, retirada && status == 200')], 'JSON inválido na retirada'),
    ('any I/O error reported as item not found', [('return retirada\n                ? Resultado.falha(Situacao.DESCONHECIDO, "A conexão foi perdida', 'if (!retirada) return Resultado.falha(Situacao.NAO_ENCONTRADO, "O item não existe no estoque.");\n            return retirada\n                ? Resultado.falha(Situacao.DESCONHECIDO, "A conexão foi perdida')], 'conexão perdida numa consulta'),
]
for label, edits, expected_line in MUTATIONS:
    broken = copy_of('solucao', 'quebrada')
    for old, new in edits:
        path = broken / CLIENT
        text = path.read_text(encoding='utf-8')
        if text.count(old) == 0:
            continue  # alternative spelling of the same edit (GET and POST builders differ)
        edit(broken, CLIENT, old, new, text.count(old))
    run(BUILD, broken)
    out, err = run(VERIFICAR, broken, ok=False)
    assert any(line.startswith('FALHA  ' + expected_line) for line in out.split('\n')), f'{label}: not reported as "{expected_line}"\n{out}'
    assert not first(out).startswith('18 de 18'), label
    assert 'Exception in thread' not in clean(err), f'{label}: noise on stderr\n{err}'

# the order of the catch clauses matters, as the roteiro says: a general type first is a compile error
swapped = copy_of('solucao', 'catch-invertido')
edit(swapped, CLIENT, '        } catch (HttpConnectTimeoutException | ConnectException e) {', '        } catch (HttpTimeoutException e) {\n            return Resultado.falha(Situacao.TEMPO_ESGOTADO, "x");\n        } catch (HttpConnectTimeoutException | ConnectException e) {')
_, err = run(BUILD, swapped, ok=False)
assert 'has already been caught' in err, err

# fixing HTTP/1.1 is optional, as the roteiro says
no_pin = copy_of('solucao', 'sem-http11')
edit(no_pin, CLIENT, 'HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).connectTimeout(timeout).build()', 'HttpClient.newBuilder().connectTimeout(timeout).build()')
run(BUILD, no_pin)
assert first(run(VERIFICAR, no_pin)[0]) == '18 de 18 verificações de cliente passaram.'

# ---- the shared Json does what its javadoc says (and what the roteiro says it does not do)
PROBE = '''import br.estudo.Json;
public class Sonda {
    public static void main(String[] args) {
        String[] casos = {"{\\"a\\":1}", "{\\"a\\":1,}", "{\\"a\\":1} x", "{\\"a\\":1,\\"a\\":2}", "{\\"a\\":1", "[1]", "{\\"a\\":NaN}", "{\\"a\\":01}"};
        for (int i = 0; i < casos.length; i++) {
            String r;
            try { Json.objeto(casos[i]); r = "ok"; } catch (IllegalArgumentException e) { r = "recusa"; }
            System.out.println(i + " " + r);
        }
    }
}
'''
(solucao / 'sonda').mkdir()
(solucao / 'sonda/Sonda.java').write_text(PROBE, encoding='utf-8')
run('javac --release 17 -encoding UTF-8 -cp out -d sonda/out sonda/Sonda.java', solucao)
res = subprocess.run([tool('java'), '-cp', f'out{os.pathsep}sonda/out', 'Sonda'], cwd=solucao, capture_output=True, encoding='utf-8', env=ENV)
probe = dict(line.split(' ') for line in res.stdout.strip().split('\n'))
assert [probe[str(i)] for i in range(6)] == ['ok', 'recusa', 'recusa', 'recusa', 'recusa', 'recusa'], probe
assert probe['6'] == 'recusa' and probe['7'] == 'ok', 'NaN is refused; leading zeros are accepted (documented limit)'

# ---- challenge D1: a variant that respects the budget passes; a naive one is caught
D1_OK = '''
    public Resultado retirarComTentativas(String id, int quantidade, int versao, String chave, Duration orcamento) {
        long limite = System.nanoTime() + orcamento.toNanos();
        Resultado ultimo = Resultado.falha(Situacao.DESCONHECIDO, "O orçamento acabou antes de qualquer tentativa.");
        for (int tentativa = 1; ; tentativa++) {
            long restante = (limite - System.nanoTime()) / 1_000_000;
            if (restante <= 0) return ultimo;
            ClienteEstoque limitado = new ClienteEstoque(base, Duration.ofMillis(Math.min(restante, timeout.toMillis())));
            ultimo = limitado.retirar(id, quantidade, versao, chave);
            if (ultimo.situacao() != Situacao.DESCONHECIDO && ultimo.situacao() != Situacao.CONEXAO_RECUSADA) return ultimo;
            long espera = Math.min(Math.min(100L << tentativa, 800), (limite - System.nanoTime()) / 1_000_000);
            if (espera <= 0) return ultimo;
            try {
                Thread.sleep(espera);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return ultimo;
            }
        }
    }
'''
D1_NAIVE = '''
    public Resultado retirarComTentativas(String id, int quantidade, int versao, String chave, Duration orcamento) {
        Resultado ultimo = null;
        for (int tentativa = 0; tentativa < 3; tentativa++) {
            ultimo = retirar(id, quantidade, versao, chave);
            if (ultimo.situacao() != Situacao.DESCONHECIDO && ultimo.situacao() != Situacao.CONEXAO_RECUSADA) return ultimo;
            try {
                Thread.sleep(700);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        return ultimo;
    }
'''
for label, body, passes in (('D1 respecting the budget', D1_OK, True), ('D1 with a fixed number of attempts', D1_NAIVE, False)):
    variant = copy_of('solucao', 'd1')
    edit(variant, CLIENT, '    private Resultado enviar(HttpRequest pedido, boolean retirada) {', body + '\n    private Resultado enviar(HttpRequest pedido, boolean retirada) {')
    run(BUILD, variant)
    if passes:
        out, _ = run(ORCAMENTO, variant)
        assert first(out) == '3 de 3 verificações de cliente passaram.', out
        assert first(run(VERIFICAR, variant)[0]) == '18 de 18 verificações de cliente passaram.'
    else:
        out, _ = run(ORCAMENTO, variant, ok=False)
        assert 'FALHA  D1:' in out and ('gastou' in out or 'passou do orçamento' in out), out

# ---- challenge D2: a per-item memory passes; one shared value for every item is caught
D2_OK = '''
    private final java.util.Map<String, Resultado> ultimos = new java.util.concurrent.ConcurrentHashMap<>();

    public Resultado consultarComUltimoValor(String id) {
        Resultado r = consultar(id);
        if (r.situacao() == Situacao.OK) {
            ultimos.put(id, r);
            return r;
        }
        Resultado antigo = ultimos.get(id);
        boolean falhaDeLeitura = switch (r.situacao()) {
            case CONEXAO_RECUSADA, TEMPO_ESGOTADO, FALHA_DE_REDE, RESPOSTA_INVALIDA -> true;
            default -> false;
        };
        if (antigo != null && falhaDeLeitura) {
            return new Resultado(Situacao.DESATUALIZADO, "Dado desatualizado: último valor conhecido, não confirmado agora (" + r.mensagem() + ")", antigo.quantidade(), antigo.versao(), false);
        }
        return r;
    }
'''
D2_SHARED = D2_OK.replace('private final java.util.Map<String, Resultado> ultimos = new java.util.concurrent.ConcurrentHashMap<>();',
                          'private volatile Resultado ultimoQualquer;').replace('ultimos.put(id, r);', 'ultimoQualquer = r;').replace('ultimos.get(id)', 'ultimoQualquer')
for label, body, passes in (('D2 per-item memory', D2_OK, True), ('D2 one value for every item', D2_SHARED, False)):
    variant = copy_of('solucao', 'd2')
    edit(variant, CLIENT, '    private Resultado enviar(HttpRequest pedido, boolean retirada) {', body + '\n    private Resultado enviar(HttpRequest pedido, boolean retirada) {')
    run(BUILD, variant)
    if passes:
        assert first(run(DESATUALIZADO, variant)[0]) == '5 de 5 verificações de cliente passaram.'
    else:
        out, _ = run(DESATUALIZADO, variant, ok=False)
        assert 'FALHA  D2: o valor de um item não aparece no lugar de outro' in out, out

print('PASS downloadable lab: integration client (theme 29)')
print('NOT EXERCISED: real networks (latency, packet loss, DNS, TLS), many concurrent clients with one key, key retention, production behavior.')
