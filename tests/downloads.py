from pathlib import Path
import json, subprocess, tempfile, zipfile

root=Path(__file__).resolve().parents[1]
work=root.parent/'.work/local-lab-tests'
work.mkdir(parents=True,exist_ok=True)
java_options=['-Dfile.encoding=UTF-8','-Dstdout.encoding=UTF-8','-Dstderr.encoding=UTF-8','-Dsun.stdout.encoding=UTF-8','-Dsun.stderr.encoding=UTF-8']
def run(command,directory,input=''):
    result=subprocess.run(command,cwd=directory,input=input,encoding='utf-8',capture_output=True,timeout=30)
    assert result.returncode==0, result.stderr+'\n'+result.stdout
    return result.stdout.replace('\r','').strip()
with zipfile.ZipFile(root/'assets/extras/programas-java.zip') as z:
    assert z.testzip() is None
    for e in json.loads((root/'assets/data/exercises.json').read_text(encoding='utf-8')):
        assert z.read(f'tema-{e["theme"]:02d}/{e["id"]}/Main.java').decode('utf-8')==e['source']
for name in ['projeto-integrador','laboratorio-arquivos','laboratorio-http']:
    directory=Path(tempfile.mkdtemp(prefix=name+'-',dir=work))
    with zipfile.ZipFile(root/'assets/extras'/(name+'.zip')) as z:
        assert z.testzip() is None
        for member in z.namelist():
            target=(directory/member).resolve()
            assert target.is_relative_to(directory.resolve())
        z.extractall(directory)
    sources=['src/Estoque.java','src/Main.java','src/Testes.java'] if name=='projeto-integrador' else ['Main.java']
    run(['javac','--release','17','-encoding','UTF-8','-d','out',*sources],directory)
    if name=='projeto-integrador':
        assert run(['java',*java_options,'-cp','out','Testes'],directory)=='11 cenários verificados'
    input=(directory/'entrada-exemplo.txt').read_text(encoding='utf-8') if name=='projeto-integrador' else ''
    expected=(directory/'saida-esperada.txt').read_text(encoding='utf-8').strip()
    assert run(['java',*java_options,'-cp','out','Main'],directory,input)==expected,name
    if name=='laboratorio-arquivos':
        assert run(['java',*java_options,'-cp','out','Main'],directory)==expected,'replacement must also work'
    print('PASS downloadable laboratory:',name)
print('PASS 53 downloadable examples and all local laboratory outputs, including project contract tests.')
