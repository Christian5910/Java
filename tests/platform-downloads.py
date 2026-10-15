"""Check the distributed sources, not a developer's unzipped copy."""
from pathlib import Path
import argparse, os, subprocess, tempfile, zipfile, xml.etree.ElementTree as ET

args=argparse.ArgumentParser()
args.add_argument('--maven', help='Path to Maven; also compile JavaFX and run the Spring tests')
options=args.parse_args()
root=Path(__file__).resolve().parents[1]
work=root.parent/'.work/platform-download-tests'
work.mkdir(parents=True,exist_ok=True)
java_bin=Path(os.environ['JAVA_HOME'])/'bin' if os.environ.get('JAVA_HOME') else None
def tool(name):return str(java_bin/(name+'.exe')) if java_bin else name
def run(command,folder,timeout=60):
    result=subprocess.run(command,cwd=folder,capture_output=True,encoding='utf-8',errors='replace',timeout=timeout)
    if result.returncode:
        raise AssertionError(result.stdout[-7000:]+'\n'+result.stderr[-3000:])
    return result.stdout.replace('\r','')
flags=['-Dfile.encoding=UTF-8','-Dstdout.encoding=UTF-8','-Dstderr.encoding=UTF-8','-Dsun.stdout.encoding=UTF-8','-Dsun.stderr.encoding=UTF-8']
for name in ['swing','javafx','android','spring']:
    folder=Path(tempfile.mkdtemp(prefix=name+'-',dir=work)).resolve()
    assert folder.is_relative_to(work.resolve())
    with zipfile.ZipFile(root/f'assets/extras/laboratorio-{name}.zip') as z:
        assert z.testzip() is None
        assert 'LEIA-ME.txt' in z.namelist()
        for item in z.namelist():assert (folder/item).resolve().is_relative_to(folder)
        z.extractall(folder)
    for xml in folder.rglob('*.xml'):ET.parse(xml)
    if name=='swing':
        sources=[str(p.relative_to(folder)) for p in folder.rglob('*.java')]
        run([tool('javac'),'--release','17','-encoding','UTF-8','-d','out',*sources],folder)
        assert '12 verificações' in run([tool('java'),*flags,'-cp','out','br.estudo.Testes'],folder)
    elif name=='android':
        run([tool('javac'),'--release','17','-encoding','UTF-8','-d','out','app/src/main/java/br/estudo/notas/Regra.java','TestesRegra.java'],folder)
        assert '9 verificações' in run([tool('java'),*flags,'-cp','out','TestesRegra'],folder)
        ns='{http://schemas.android.com/apk/res/android}'
        manifest=ET.parse(folder/'app/src/main/AndroidManifest.xml')
        assert not manifest.findall('.//uses-permission')
        assert manifest.find('.//activity').get(ns+'exported')=='true'
        assert '8.7.3' in (folder/'build.gradle').read_text()
        print('PASS Android domain and XML; APK build and emulator are not exercised by this check.')
    elif options.maven:
        if name=='javafx':
            run([options.maven,'-B','compile'],folder,240)
            assert '12 verificações' in run([tool('java'),*flags,'-cp','target/classes','br.estudo.Testes'],folder)
        else:
            # The distributed test intentionally authenticates the public, fictional lab credential.
            previous=os.environ.pop('LAB_PASSWORD',None)
            try:output=run([options.maven,'-B','clean','package','-Dfile.encoding=UTF-8'],folder,240)
            finally:
                if previous is not None:os.environ['LAB_PASSWORD']=previous
            assert 'Tests run: 17, Failures: 0, Errors: 0, Skipped: 0' in output
            assert (folder/'target/catalogo-1.0.0.jar').is_file()
    else:print('SKIP Maven verification for',name,'(pass --maven to exercise dependencies).')
    print('PASS downloadable project:',name)
