# Java · Guia de estudo

## Amostras em avaliação

`amostras.html` reúne as três demonstrações usadas para aprovação: agrupamento dos temas com cabeçalho e ícone à direita, capítulo `amostra-tema-03.html` ampliado e `amostra-atividade.html` com editor inicialmente vazio. O modelo foi aplicado oficialmente aos temas 1 a 8 em 29/10/2026; as amostras permanecem disponíveis como referência.

O rascunho da atividade de demonstração usa `java_playground_amostra_v1`, separado de `java_playground_v1`. Abrir “Possível solução para o problema” não preenche o editor. “Limpar meu código” pede confirmação antes de descartar o rascunho da amostra. Estas páginas ainda não estão no manifesto de pré-cache offline.

`node tests/samples.cjs` compila os 12 programas completos do capítulo e a solução da atividade para Java 17, confere saídas, limites de entrada e literais de caractere partidos em linhas. `node tests/samples-browser.cjs` usa Playwright/Edge para testar as amostras em 1440/390px; acrescente `--runtime` para compilar e executar a solução no CheerpJ real. O endereço padrão é `http://127.0.0.1:4189/`, ajustável por `JAVA_SITE_URL`. Capturas em `.work/sample-shots`.

Site estático baseado nos materiais de Desenvolvimento de aplicações e nos exercícios fornecidos pelo grupo. A base visual foi preservada: Bootstrap local, paleta azul escura e laranja, navegação, agrupamentos com ícones e temas numerados.

- `cont.html`: índice dos trinta temas, busca por assunto e impressão da apostila. Os temas 1 a 8 abrem páginas próprias; os temas 9 a 30 mantêm as janelas de leitura. Os pares de temas ficam em containers com título e ícone à direita; os antigos botões intermediários de categoria foram removidos.
- `tema-01.html` a `tema-08.html`: capítulos ampliados com sumário, exemplos completos, exercícios resolvidos, referências e impressão individual. O conteúdo original foi preservado e aprofundado.
- `playground.html`: 53 atividades com código Java editável, entrada para Scanner, desafios e saídas de referência.
- `quiz.html`: 60 questões de nível médio/avançado, dicas, comentários, retomada e resultado por tema.
- `faq.html`: 80 perguntas com busca.
- `assets/materiais/`: sete PDFs com links de abertura e download no conteúdo.
- `extra.html`: vinte seções com fontes, ferramentas, pesquisa original, programas, roteiro de testes e recursos de continuidade.
- `avaliacao.html`: endereço antigo que direciona para o Playground.

## Executar e publicar

Publique o conteúdo da pasta `java` em hospedagem estática, na raiz ou em uma subpasta. Não são necessárias chaves de API, servidor de compilação, Node ou Java na hospedagem. Use HTTP ou HTTPS; o Playground não funciona por `file://`. Para preview local, um servidor estático é suficiente, por exemplo `python -m http.server 8000` iniciado na pasta `java`.

Após o primeiro carregamento completo, os arquivos locais listados em `sw-version.txt` ficam disponíveis offline. A execução de Java exige conexão para obter recursos do CDN do CheerpJ; não se promete uma JVM totalmente offline. Documentação externa também depende de internet.

O Playground abre um aviso somente quando `navigator.onLine` informa que está offline, tanto na abertura da página quanto na perda de conexão. A reconexão fecha o aviso. É possível dispensá-lo para editar e exportar; uma tentativa de executar offline o apresenta novamente. Se a conexão cair durante a preparação ou execução, a JVM é interrompida e o rascunho é preservado. O estado online do navegador não garante que o CDN esteja acessível; as mensagens e os limites de carregamento continuam tratando essa situação.

Ao atualizar conteúdo ou scripts, altere a primeira linha de `sw-version.txt` e `SW_BUILD` em `service-worker.js` para o mesmo novo valor. O cache deste site usa seu próprio prefixo e escopo.

## Execução real no Playground

O compilador Eclipse ECJ 3.33.0 roda em uma JVM CheerpJ 4.3 no próprio navegador. O código não é simulado, nem enviado a uma IA ou a um servidor remoto de compilação.

A JVM é Java 17. O compilador aceita sintaxe Java 17 e usa as assinaturas da biblioteca Java 8 disponíveis no runtime para os fundamentos da apostila. Isso permite os switches modernos presentes nos rascunhos. APIs posteriores a Java 8 e records não estão incluídos nesse ambiente de compilação. Para esses recursos, use um JDK local.

O editor usa um arquivo `Main.java`, sem pacote, com `public class Main` e o método principal. Classes auxiliares sem `public` podem estar no mesmo arquivo. Não há projeto de múltiplos arquivos, instalação de dependências, terminal com entrada interativa durante a execução ou acesso ao disco real. Os exercícios são de console; aplicações gráficas, servidores, bancos reais e programas completos com dependências devem ser executados em uma IDE.

O usuário fornece os dados de `System.in` antes de iniciar. O catálogo pode ser filtrado por tema e mantém um rascunho por atividade. Anterior e próxima seguem a ordem mostrada na lista e respeitam o filtro, sem voltar automaticamente ao início. A navegação fica desabilitada durante execução. Uma edição marca a saída como desatualizada; falhas de compilação abrem os diagnósticos. Cada execução compila em um diretório virtual novo para evitar usar classes antigas. Compilação e execução têm até 60 segundos por etapa; inicialização tem até 120 segundos; saída tem limite de 50 mil caracteres. Interromper descarta a JVM do iframe e preserva código e entrada. O primeiro carregamento pode ser lento, sobretudo em celular.

`assets/java/StudyCompiler.java` adapta a configuração de classpath do ECJ para a biblioteca de fundamentos disponível. O `.class` já está incluído. Para recompilar esse adaptador com um JDK 17 ou posterior:

```text
javac --release 17 -encoding UTF-8 -cp assets/vendor/ecj-3.33.0.jar assets/java/StudyCompiler.java
javac --release 17 -encoding UTF-8 assets/java/StudyRunner.java
```

## Dados e exportação

Cada atividade tem rascunho próprio em `java_playground_v1`, no armazenamento local. O quiz usa `java_quiz_progress_v1`. Apagar os dados do navegador remove esses registros. Nenhum dado dos diagnósticos antigos é migrado para uma atividade Java.

A ampliação mantém as quarenta questões anteriores na mesma sequência e acrescenta vinte ao fim. Tentativas válidas da versão anterior preservam suas respostas e alternativas embaralhadas. Quem concluiu as quarenta continua a partir da primeira nova; quem estava respondendo mantém a posição. O quiz completo passa a ter seis questões por tema.

O Playground exporta `Main.java`, JSON, TXT e HTML. PDF usa a impressão do navegador. O registro inclui a última execução apenas enquanto código e entrada continuam correspondendo a ela. A saída inicial indicada nas atividades é uma referência didática, não uma avaliação automática de todas as soluções.

`StudyRunner` configura a entrada dentro do mesmo contexto de aplicação do método principal. Os diagnósticos do compilador são capturados separadamente, sem depender da saída da aplicação.

## Materiais e revisão

Os dez temas iniciais acompanham `07DesenvolvimentodeAplicaes.pdf`. Os quatro temas avançados dão continuidade com contratos de coleções, persistência, concorrência e projeto integrado, usando as referências oficiais indicadas no texto. Os cinco conjuntos de slides possuem outra numeração e complementam temas diferentes. O guia de primeiros passos e os programas do grupo foram usados como apoio. Os arquivos de origem em `util`, `projetos` e `svg` não foram alterados.

Foram identificadas correções sobre versões e applets, divisão inteira, valores iniciais, ceil/floor, índices, entrada com Scanner, construtor padrão, setters que preservam validação e acesso de pacote/protected. Os capítulos indicam essas diferenças e referências oficiais. As taxas e credenciais dos exercícios são fictícias ou dadas pelos enunciados; não representam regras trabalhistas, produtos financeiros ou autenticação de produção.

### Pesquisa “Aula 1 - Conhecendo o Java”

Os textos de `../projetos/Aula 1 - Conhecendo o Java/pages/` foram usados como material de pesquisa, sem executar as instruções contidas neles ou alterar os originais. O conteúdo foi intercalado por conceito na sequência principal da apostila, da busca e da impressão. Cada tema termina com prática ou revisão, sem separar a pesquisa em blocos adicionais:

| Origem | Incorporação |
| --- | --- |
| `estrutura.html`, `download.html` | Tema 1: instalação, ferramentas do JDK, carregamento, memória e JVM. |
| `sintaxe.html` | Temas 3 e 4: igualdade de textos como chaves e enumerações. |
| `fundamentos.html` | Tema 6: List, Set, Map e generics; tema 7: lambdas e streams; temas 9 e 10: exceções, arquivos e concorrência. |
| `poo.html` | Temas 7, 8 e 9: interfaces, abstração, composição, cópia de objetos e princípios de projeto. |
| `conexoes.html`, `recursos.html`, `certificacoes.html` | Tema 10: build, testes, persistência, ecossistema e roteiro de continuidade. |
| `historia.html` | Contexto comparado à história já presente no tema 1. |

Os exemplos incorporados da pesquisa aos temas 1 a 10 usam Java 17 com APIs disponíveis ao compilador do site. Recursos externos e posteriores são indicados para JDK local. Os 66 arquivos originais estão disponíveis em um ZIP identificado como pesquisa histórica. Os 53 programas atuais possuem outro ZIP, separado por atividade, com entradas e saídas. O roteiro de testes e o catálogo de fontes também podem ser baixados. Esses quatro arquivos e extra.html integram o cache offline.

A revisão evita reproduzir estatísticas sem fonte, garantias de desempenho, detalhes comerciais de certificações e a simulação por IA do runner antigo. Corrige também simplificações sobre imutabilidade de streams, custo de inserção em listas, construtor de cópia automático e a identificação de fábrica simples como Factory Method. A execução atual continua real e local no navegador.

## Créditos e dependências

- CheerpJ, da Leaning Technologies: [documentação](https://cheerpj.com/docs/overview.html) e [licenciamento](https://cheerpj.com/docs/licensing.html). O loader e o runtime são carregados do CDN oficial; não são redistribuídos localmente. A Community License abrange projetos pessoais com os créditos apropriados. Uso por empresas, instituições e outras situações deve ser conferido nas condições do fornecedor.
- Eclipse ECJ 3.33.0: [projeto Eclipse JDT](https://projects.eclipse.org/projects/eclipse.jdt), EPL 2.0. Binário e código-fonte correspondentes estão em `assets/vendor/`, junto de `ECJ-LICENSE.txt` e `ECJ-about.html`. O binário do ECJ não foi modificado.
- Bootstrap e Bootstrap Icons: licenças locais em `assets/vendor/LICENCAS.txt`.
- Símbolo Java: SVG fornecido na pasta `svg`, aplicado como logo e origem dos ícones do app. Java é uma marca da Oracle e/ou suas afiliadas. O material não declara afiliação oficial.

## Verificações

`node tests/topics.cjs` compila os programas completos marcados dos temas 1 a 8 para Java 17, compara suas saídas e verifica entradas inválidas, valores de fronteira, argumentos, pacotes e JAR. Requer um JDK completo no PATH, incluindo `jar`.

`node tests/topic-pages.cjs` usa Playwright e Edge para conferir os oito capítulos, transição 8/9, links antigos, busca, impressão, sumário, resoluções, telas de 1440/390 px e leitura offline. Aceita `JAVA_SITE_URL` (padrão: `http://127.0.0.1:4188/organizar/`). As capturas ficam em `.work/topic-shots` e `.work/first-eight/shots`.

`node tests/first-eight-activities.cjs` verifica as 53 atividades dos temas 1 a 14 (o nome do arquivo é histórico: os oito primeiros temas foram os primeiros a usar o fluxo): editor vazio e entrada de referência na primeira visita, passos e critérios de conferência, destino do link de revisão, solução que não preenche o editor, limpeza com confirmação e recuperação dos rascunhos antigos, inclusive os de temas 9 a 14 e os idênticos à solução. Usa `JAVA_SITE_URL`, com padrão `http://127.0.0.1:4189/`.

Para busca e impressão reunidas, o índice carrega os oito capítulos por `fetch`, usando os HTMLs como fonte única. Use HTTP/HTTPS; a leitura direta de cada capítulo também funciona por `file://`, mas a reunião no índice requer servidor. Os capítulos e seu CSS estão no cache offline. Links antigos `cont.html#modal1` a `#modal8` são redirecionados para as páginas novas; `#cat1` a `#cat15` localizam o grupo correspondente.

Em todas as atividades do catálogo, o código de referência permanece no catálogo e nos downloads, mas só aparece na interface ao abrir “Possível solução para o problema”. Os rascunhos existentes em `java_playground_v1` são preservados, mesmo quando coincidem com um exemplo antigo; não é possível distinguir com segurança um rascunho próprio de uma cópia não editada. “Limpar meu código” permite recomeçar e pede confirmação se houver código ou entrada. Novas visitas a uma atividade sem rascunho começam com código vazio. Os dados de entrada de referência continuam disponíveis para leitura e testes. Toda atividade precisa de `instructions` (ao menos seis passos distintos) e `checks`, que `node tests/static.cjs` exige; o fluxo é decidido pelo catálogo, não pelo número do tema. O link de revisão abre `tema-NN.html` até o capítulo 8 (`STANDALONE_CHAPTERS` em `assets/js/playground.js`) e a janela de leitura `cont.html#modalN` nos demais, até que esses capítulos virem páginas próprias.

`node tests/static.cjs` verifica links e arquivos locais, capítulos, quiz, atividades, sintaxe dos scripts, cache e tamanhos dos ícones.

`node tests/research.cjs` compila os cinco programas completos incorporados da pesquisa e confere suas saídas. `node tests/offline.cjs` também verifica que o pop-up não aparece online, surge na perda de conexão e na abertura offline, preserva o rascunho e fecha na reconexão.

`node tests/quiz-progress.cjs` verifica a migração de tentativas antigas para sessenta questões, preservando respostas, alternativas e posição, e rejeita dados inconsistentes. `node tests/examples.cjs` requer JDK 17 ou posterior no PATH e confere as saídas dos 53 programas, incluindo entradas inválidas e valores de fronteira.

`node tests/browser.cjs` usa Playwright e Microsoft Edge instalados no ambiente de teste. Inicie o site em `http://127.0.0.1:4177/java/`, ou defina `JAVA_SITE_URL`. A verificação executa os 53 programas, erros de compilação e execução, interrupção, retomada, rascunhos, downloads, quiz completo, buscas e navegação. O ambiente de teste precisa de internet para a JVM.

`node tests/offline.cjs` confere conteúdo, quiz, carregamento das atividades e PDF sem conexão, além da mensagem que informa a necessidade de conexão para executar Java. A revisão visual foi feita em Microsoft Edge, com telas de computador e emulação de celular; não equivale a testar todos os navegadores ou aparelhos físicos.

`node tests/public-site.cjs` confere navegação filtrada, rascunhos, acesso à página Extra, seus quatro downloads, busca, FAQ, contraste do texto visível e ausência de transbordamento em computador e emulação de celular. As capturas ficam em `.work/site-shots`, fora da pasta de publicação.

## Expansão avançada e impressão

Os temas 11 a 14 dão continuidade a coleções e contratos, persistência, concorrência e arquitetura com testes. Os oito programas novos são compatíveis com o recorte do Playground. O quiz de 60 questões continua explicitamente focado nos fundamentos dos temas 1 a 10; os capítulos avançados oferecem práticas e questões comentadas próprias.

Extra tem vinte seções, com projeto integrador, arquivos locais, SQL, laboratório HTTP local, build, diagnóstico e laboratórios sequenciais. Os três novos ZIPs incluem fontes, instruções e referências de saída. O código de arquivos e HTTP exige JDK local e não é anunciado como executável no compilador do navegador.

A impressão usa o mesmo tema visual em papel, capa, roteiro e paginação. Links recebem URLs absolutas calculadas pelo endereço atual da página. Tanto o botão quanto Ctrl+P imprimem todos os capítulos e abrem detalhes temporariamente; o estado é restaurado em afterprint. A lista dos PDFs também participa da impressão.

`python tests/downloads.py` usa apenas a biblioteca padrão e o JDK para conferir os ZIPs, compilar os três laboratórios locais e reproduzir suas saídas. `node tests/print.cjs` verifica o ciclo de impressão, as URLs das referências e a inclusão dos 30 temas e 20 extras; os PDFs de conferência ficam em `.work/print-qa`, fora da publicação.


## Trilha de plataformas e Spring Boot

Os temas 15 a 30 continuam em ordem: módulos; Swing; JavaFX; desktop avançado; distribuição; Android básico e avançado; Spring Boot, REST, JPA, segurança, testes, operação, cache/mensagens; integração e projeto final. Cada capítulo tem mais de 1.100 palavras, exemplos e prática comentada. As seções 13 a 20 do Extra acompanham os ambientes e os testes. O catálogo de 53 atividades permanece nos temas 1 a 14, e o quiz de 60 questões nos temas 1 a 10. As chaves de rascunho e de progresso foram preservadas.

Downloads novos, incluídos no cache do site:

- `laboratorio-modulos.zip`: laboratório do tema 15, executado no computador, com JDK 17 ou superior e sem Maven, Gradle ou internet. A pasta `inicio/` é o ponto de partida (compila, executa e não contém a regra) e `solucao/` traz uma possível solução das etapas 1 a 3 com respostas-modelo; os desafios D1 a D3 não têm solução distribuída. O `LEIA-ME.txt` traz enunciado, comandos, resultados esperados e critérios de conclusão, e avisa que `javac -m` só recompila arquivos mais novos que as classes geradas: sobre uma pasta `mods` antiga as falhas controladas podem terminar sem erro. Não executa no Playground.
- `laboratorio-swing-formulario.zip`: laboratório do tema 16, executado no computador, com JDK 17 ou superior. `inicio/` é o ponto de partida (o formulário do capítulo, já separado em painel e janela, com a regra `Nota` e 12 testes; sem Limpar, nome nem mensagens) e `solucao/` traz uma possível solução das etapas 2 a 4. A ferramenta `VerificarFormulario`, igual nos dois projetos, confere o contrato da tela sem abrir janela; ela não é uma nota e imprime a lista do que só se confere à mão (foco, Tab, Alt+letra, aparência numa janela real). Os desafios D1 (consulta lenta) e D2 (espaço não separável) não têm solução distribuída. Não executa no Playground.
- `laboratorio-swing.zip` (projeto de referência já resolvido, não um exercício): JDK 17, janela e doze verificações da regra, sem dependências externas.
- `laboratorio-javafx.zip`: JavaFX 21.0.10, JDK 17 e Maven; doze verificações do domínio sem abrir janela.
- `laboratorio-android.zip`: Activity Java e Views XML, JDK 17, Gradle 8.9, plugin Android 8.7.3 e SDK 35; nove verificações da regra. Sem Gradle Wrapper; o LEIA-ME explica a distribuição local. APK e emulador exigem SDK e ambiente Android.
- `laboratorio-spring.zip`: Spring Boot 3.5.16, JDK 17 e Maven; REST, validação, JPA/H2, versão otimista, Basic local com CSRF, saúde e dezessete testes. Endereço de loopback, dados fictícios e banco descartável. Quantidades decimais são recusadas, sem truncamento.
- `laboratorio-integracao.zip`: laboratório do tema 29, executado no computador, com JDK 17 ou superior, só em 127.0.0.1 e sem bibliotecas (servidor e cliente HTTP do JDK). `inicio/` é o ponto de partida (serviço de estoque com falhas injetáveis, tipos, JSON mínimo e a ferramenta; o `ClienteEstoque` é só a estrutura) e `solucao/` traz uma possível solução das etapas 2 a 4. `VerificarCliente` sobe um servidor de verdade, provoca conexão recusada, conexão perdida, resposta lenta, JSON inválido e resposta perdida depois da confirmação, mede o tempo e confere o estado do servidor; não é uma nota e lista o que não verifica (rede real, concorrência, retenção das chaves). Os desafios D1 (orçamento de tempo) e D2 (dado desatualizado identificado) têm modos próprios da ferramenta e não têm solução distribuída. `laboratorio-http.zip` é uma demonstração já resolvida, não um exercício. Não executa no Playground.
- `roteiro-avancado.html`: práticas dos temas 15 a 30, imprimíveis com links absolutos.
- `fontes-avancadas.txt`: referências oficiais da continuação.

As versões são fixadas para reprodução didática. Nenhum pacote é anunciado como configuração pública pronta. Os exemplos de cache, mensageria, OAuth2 e integração entre os clientes são evoluções guiadas; esses serviços não estão habilitados no catálogo inicial. Aplicações gráficas, APKs e servidor Spring executam fora do Playground.

`python tests/platform-downloads.py` verifica ZIPs, XML e regras de Swing/Android. Com `--maven caminho-do-maven`, compila JavaFX, executa seus testes de domínio, roda os dezessete testes Spring e produz o JAR a partir dos arquivos distribuídos. Use JDK 17 em JAVA_HOME. A verificação não abre as janelas nem executa um emulador.

`python tests/lab-modulos.py` extrai o ZIP do laboratório de módulos e executa, como estão escritos no `LEIA-ME.txt`, os comandos de compilar, executar, empacotar e inspecionar os JARs. Confere que o ponto de partida compila, executa e não traz a solução, que a solução imprime 15 verificações, que os testes falham quando a regra é quebrada, as três falhas controladas (com e sem pasta `mods` antiga), os desafios D1 a D3 e que a regra estrita do D3 é satisfazível. Usa `JAVA_HOME` quando ele contém a ferramenta; caso contrário, o `PATH`. As mensagens do compilador foram observadas no JDK 21 e variam entre versões; `--release 17` exige o JDK 17 ou superior com seus dados de assinatura.

`python tests/lab-swing.py` extrai o ZIP do laboratório de Swing e executa, como estão no `LEIA-ME.txt`, os comandos de compilar, testar e verificar a interface. Confere que o ponto de partida não traz o trabalho a fazer, que a solução passa 30 verificações de domínio e 18 de interface, e que a ferramenta detecta defeitos reais: doze variantes quebradas da solução (mnemônico, botão padrão, rótulo sem ligação, ordem, posição das mensagens, texto cortado, limpeza incompleta e outras) precisam ser apontadas na linha correspondente, sem ruído no erro padrão. Cobre também o D1 (versão assíncrona aprovada, versão que trava a janela reprovada) e o D2. Não abre janela: o JRE usado aqui não tem suporte a tela. Abrir a janela, foco, Tab e a aparência continuam por conta da conferência manual do roteiro.

`python tests/lab-integracao.py` extrai o ZIP do laboratório de integração e executa, como estão no `LEIA-ME.txt`, os comandos de compilar e verificar, além dos experimentos com `curl` documentados contra o servidor real (se houver `curl` e a porta 8080 estiver livre). Confere que o ponto de partida não traz o cliente (0 de 18), que a solução passa 18 de 18 e que a ferramenta detecta defeitos reais: nove variantes quebradas do cliente (sem limite de resposta, conexão recusada confundida com item inexistente, resposta perdida tratada como tempo esgotado, chave nova a cada chamada, sem validação da chave, repetição ignorada, mensagens iguais, JSON ilegível aceito, erro de rede como item inexistente) precisam ser apontadas na linha correspondente. Cobre também a ordem dos `catch`, que fixar HTTP/1.1 é opcional, os limites do JSON mínimo e os dois desafios (uma variante correta passa e uma ingênua é reprovada em cada um). Tudo corre em loopback com falhas determinísticas; rede real, vários clientes ao mesmo tempo e produção não são exercitados.

`node tests/platform-navigation.cjs` verifica os novos endereços, a transição 14/15, os agrupamentos, a busca, os quatro novos ZIPs e o caderno. `tests/offline.cjs` também cobre o tema 30, o Extra 20 e os novos arquivos no cache. A impressão adapta o sumário longo em duas colunas, mantendo todos os capítulos, as URLs e a restauração dos detalhes após imprimir.

`assets/js/code-blocks.js` colore blocos Java (palavras reservadas, tipos, textos, números, comentários e anotações) e acrescenta o botão **Copiar** nos capítulos, em Conteúdo, Extra e na página inicial. Ele só monta nós de DOM e não altera o texto do código: comandos de terminal, saídas, XML, JSON e SQL ficam sem cores, e a cópia entrega o texto original (com alternativa quando a área de transferência não está disponível). Capítulos carregados depois pela página Conteúdo também são tratados. Na impressão os botões e as cores somem. `node tests/code-blocks.cjs` verifica que o texto dos blocos permanece idêntico, as cores só em Java, a cópia por clique e teclado, a mensagem de falha, a impressão e o alvo de 44 px em 390 px; usa `JAVA_SITE_URL` (padrão `http://127.0.0.1:4189/`).
