"""Gera assets/extras/programas-java.zip a partir de assets/data/exercises.json.

O catálogo é a fonte única: Main.java, entrada.txt, saida-esperada.txt e atividade.txt de cada pasta saem dele, para o
download nunca ficar atrás do Playground. Uso, na raiz do site:

    python tools/gerar-programas-java.py          # reescreve o ZIP
    python tools/gerar-programas-java.py --check  # só confere; sai com 1 se o ZIP estiver desatualizado
"""
from pathlib import Path
import json, sys, zipfile

RAIZ = Path(__file__).resolve().parents[1]
CATALOGO = RAIZ / 'assets/data/exercises.json'
DESTINO = RAIZ / 'assets/extras/programas-java.zip'
DATA = (2026, 11, 9, 12, 0, 0)

LEIA_ME = """PROGRAMAS JAVA DO GUIA

Cada pasta é uma atividade independente: tema-NN/<atividade>/.
Main.java é UMA POSSÍVEL SOLUÇÃO de referência, não um ponto de partida. Tente escrever a sua antes de abri-lo. No
Playground do site o editor começa vazio e a possível solução fica recolhida.
Leia atividade.txt (enunciado, critérios de conferência, dica e desafio), entrada.txt e saida-esperada.txt. Os
passos foram escritos para o Playground; fora dele, o "editor" é o seu editor de texto.
A saída esperada vale apenas para este Main.java e para esta entrada: coincidir com ela não prova que o algoritmo
está certo, e nenhum destes arquivos atribui nota.

Para executar no computador é preciso o JDK 17 ou superior, em uma pasta por atividade.
Compile: javac -encoding UTF-8 Main.java
Execute: java Main
Com entrada (entrada.txt não vazio), no Linux e no macOS: java Main < entrada.txt
No PowerShell: Get-Content entrada.txt | java Main
"""


def atividade(e):
    passos = '\n'.join(f'{n}. {texto}' for n, texto in enumerate(e['instructions'], 1))
    entrada = ('Os dados de referência estão em entrada.txt.' if e['input']
               else 'Esta atividade não traz dados de entrada de referência (entrada.txt está vazio).')
    return (f"{e['title']}\n\nTema {e['theme']}\n\nObjetivo\n{e['goal']}\n\nO que fazer\n{passos}\n\n"
            f"Entrada\n{entrada}\n\nComo conferir\n{e['checks']}\n\nDica\n{e['hint']}\n\nDesafio\n{e['challenge']}")


def arquivos(catalogo):
    """Nome dentro do ZIP -> bytes, na ordem do catálogo."""
    saida = {'LEIA-ME.txt': LEIA_ME.encode('utf-8')}
    for e in catalogo:
        pasta = f"tema-{e['theme']:02d}/{e['id']}/"
        saida[pasta + 'Main.java'] = e['source'].encode('utf-8')
        saida[pasta + 'entrada.txt'] = e['input'].encode('utf-8')
        saida[pasta + 'saida-esperada.txt'] = e['expected'].encode('utf-8')
        saida[pasta + 'atividade.txt'] = atividade(e).encode('utf-8')
    return saida


def escrever(catalogo, destino=DESTINO):
    with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED) as z:
        for nome, dados in arquivos(catalogo).items():
            info = zipfile.ZipInfo(nome, DATA)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            z.writestr(info, dados)


def desatualizado(catalogo, destino=DESTINO):
    """Lista o que difere entre o ZIP e o que o catálogo produziria."""
    esperado = arquivos(catalogo)
    with zipfile.ZipFile(destino) as z:
        atual = {n: z.read(n) for n in z.namelist()}
    return sorted(n for n in set(esperado) | set(atual) if esperado.get(n) != atual.get(n))


if __name__ == '__main__':
    catalogo = json.loads(CATALOGO.read_text(encoding='utf-8'))
    if '--check' in sys.argv:
        diferentes = desatualizado(catalogo)
        print(f'{len(diferentes)} arquivo(s) diferente(s) do catálogo' + (': ' + ', '.join(diferentes[:5]) if diferentes else ''))
        sys.exit(1 if diferentes else 0)
    escrever(catalogo)
    print(f'{DESTINO.relative_to(RAIZ)}: {len(arquivos(catalogo))} arquivos, {len(catalogo)} atividades')
