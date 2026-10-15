const RAW_QUESTIONS = [
  {
    "theme": 1,
    "text": "Main.java compila, mas o único método declarado é public static void main2(String[] args). O que acontece ao tentar iniciar Main?",
    "options": [
      "Falta o ponto de entrada main usado nesta apostila, apesar de a declaração de main2 ser válida.",
      "O compilador renomeia main2 automaticamente.",
      "main2 é executado porque recebe String[].",
      "O nome do método só importa quando ele não é static."
    ],
    "correct": 0,
    "hint": "Separe declarar um método de fornecer o ponto de entrada.",
    "explanation": "Um método comum pode se chamar main2. O inicializador dos exemplos procura main com a assinatura apropriada. Tema 1."
  },
  {
    "theme": 1,
    "text": "Um .class foi compilado para uma versão de Java mais nova do que a JVM instalada. Qual conclusão é adequada?",
    "options": [
      "A JVM antiga pode recusar a versão do bytecode; é preciso alinhar o alvo da compilação e o ambiente.",
      "A portabilidade elimina qualquer limite entre versões.",
      "Trocar a extensão .class por .java resolve a execução.",
      "Uma IDE permite ignorar a versão da JVM."
    ],
    "correct": 0,
    "hint": "Portabilidade pressupõe um ambiente compatível.",
    "explanation": "Bytecode tem uma versão. Uma JVM antiga não necessariamente executa o formato produzido para versões posteriores. Tema 1."
  },
  {
    "theme": 1,
    "text": "Qual percurso representa a execução usual estudada para um programa Java?",
    "options": [
      "Fonte .java → compilador → bytecode .class → JVM.",
      "Fonte .java → navegador interpreta como JavaScript → .class.",
      "JVM → fonte HTML → compilador CSS → programa.",
      "Fonte .class → editor → JDK converte texto em .java."
    ],
    "correct": 0,
    "hint": "Identifique o arquivo que contém texto e o que contém bytecode.",
    "explanation": "O compilador transforma o fonte em bytecode, e a JVM executa as classes compatíveis. A IDE pode acionar essas etapas. Tema 1."
  },
  {
    "theme": 1,
    "text": "O projeto mostra uma média errada sem mensagens de compilação ou exceções. Qual investigação é mais útil?",
    "options": [
      "Comparar a expressão e os casos de teste com a regra do enunciado.",
      "Concluir que compilar prova que o cálculo está correto.",
      "Reinstalar a IDE antes de ler a expressão.",
      "Trocar public por private em todas as classes."
    ],
    "correct": 0,
    "hint": "Um programa pode executar uma regra diferente da desejada.",
    "explanation": "Erro de lógica pode produzir saída sem falha técnica. Precedência e limites precisam ser conferidos com resultados esperados. Tema 1."
  },
  {
    "theme": 2,
    "text": "Qual valor recebe double resultado = 10 / 4;?",
    "options": [
      "2.0",
      "2.5",
      "4.0",
      "Erro de compilação por dividir dois int."
    ],
    "correct": 0,
    "hint": "A operação é avaliada antes da atribuição.",
    "explanation": "10 e 4 são inteiros; a divisão produz 2. Depois esse valor é convertido para double. Use 10.0 / 4 para obter 2.5. Tema 2."
  },
  {
    "theme": 2,
    "text": "Após int idade = entrada.nextInt(), o programa precisa ler um nome na linha seguinte. Qual organização evita ler apenas o restante vazio da linha numérica?",
    "options": [
      "Consumir o restante da linha com nextLine antes de ler o nome, ou ler todas as linhas e converter os números.",
      "Criar um novo Scanner para cada palavra.",
      "Usar close e reabrir System.in a cada leitura.",
      "Trocar a variável de idade para String sem mudar a leitura."
    ],
    "correct": 0,
    "hint": "Métodos de token e de linha avançam de formas diferentes.",
    "explanation": "nextInt lê o token numérico. O fim daquela linha pode ficar para nextLine. Coordenar a leitura evita pular a entrada de texto. Tema 2."
  },
  {
    "theme": 2,
    "text": "Qual expressão protege uma divisão inteira por divisor zero usando curto-circuito?",
    "options": [
      "divisor != 0 && total / divisor > 2",
      "divisor != 0 & total / divisor > 2",
      "total / divisor > 2 && divisor != 0",
      "divisor == 0 && total / divisor > 2"
    ],
    "correct": 0,
    "hint": "Considere qual lado é avaliado primeiro e se o segundo pode ser dispensado.",
    "explanation": "Com &&, a segunda expressão não é avaliada quando a primeira é falsa. A verificação do divisor precisa vir antes da divisão. Tema 2."
  },
  {
    "theme": 2,
    "text": "Para Random r, qual expressão gera um inteiro de 1 a 6, e quais são ceil(-2.3) e floor(-2.3)?",
    "options": [
      "r.nextInt(6) + 1; -2.0 e -3.0.",
      "r.nextInt(6); -3.0 e -2.0.",
      "r.nextInt(5) + 1; -2.0 e -2.0.",
      "r.nextInt(7) + 1; -3.0 e -3.0."
    ],
    "correct": 0,
    "hint": "O limite de nextInt é excluído. Teto e piso seguem direções diferentes.",
    "explanation": "nextInt(6) gera 0 a 5. ceil vai em direção de mais infinito; floor vai em direção de menos infinito. Tema 2."
  },
  {
    "theme": 3,
    "text": "String a = \"Java\"; String b = new String(\"Java\"); Qual par descreve a == b e a.equals(b)?",
    "options": [
      "false e true.",
      "true e true.",
      "false e false.",
      "true e false."
    ],
    "correct": 0,
    "hint": "A construção explícita cria outro objeto.",
    "explanation": "== compara as referências; equals de String compara conteúdo. Os objetos são distintos e os conteúdos coincidem. Tema 3."
  },
  {
    "theme": 3,
    "text": "Depois de String s = \"java\"; s.toUpperCase();, qual é o valor de s?",
    "options": [
      "\"java\", pois o resultado retornado foi descartado.",
      "\"JAVA\", pois o método altera o mesmo objeto.",
      "null, pois uma String usada perde a referência.",
      "Erro de compilação, pois Strings não possuem métodos."
    ],
    "correct": 0,
    "hint": "Considere a imutabilidade e a atribuição.",
    "explanation": "String é imutável. Para usar o retorno, atribua s = s.toUpperCase() ou guarde em outra variável. Tema 3."
  },
  {
    "theme": 3,
    "text": "Para String s = \"Java\", o que devolvem s.substring(1, 3) e s.indexOf(\"z\")?",
    "options": [
      "\"av\" e -1.",
      "\"ava\" e 0.",
      "\"Ja\" e 4.",
      "\"va\" e null."
    ],
    "correct": 0,
    "hint": "O limite final da extração é excluído; a busca sinaliza ausência.",
    "explanation": "Os índices 1 e 2 contêm a e v. indexOf devolve -1 quando o trecho não é encontrado. Tema 3."
  },
  {
    "theme": 3,
    "text": "usuario pode ser null. Qual validação de conteúdo para o login didático evita chamar um método sobre essa referência nula?",
    "options": [
      "\"admin\".equals(usuario)",
      "usuario.equals(\"admin\")",
      "usuario == \"admin\" como regra geral de conteúdo",
      "usuario.toString().equals(\"admin\")"
    ],
    "correct": 0,
    "hint": "O objeto que recebe a chamada precisa existir.",
    "explanation": "A string literal é um receptor não nulo. equals retorna falso para argumento null; chamar usuario.equals quando usuario é null falha. Tema 3."
  },
  {
    "theme": 4,
    "text": "Uma cadeia testa horas > 40 antes de testar horas > 71 && horas <= 119. Qual problema aparece?",
    "options": [
      "A faixa de 72 a 119 já entra no primeiro ramo; o segundo teste não é alcançado para ela.",
      "else if sempre executa depois de um if verdadeiro.",
      "O primeiro teste considera apenas horas de 41 a 71.",
      "&& converte horas em boolean automaticamente."
    ],
    "correct": 0,
    "hint": "Uma cadeia escolhe o primeiro caminho verdadeiro.",
    "explanation": "A condição ampla captura todos os valores acima de 40. Reordene ou defina intervalos quando precisar de uma faixa específica. Tema 4."
  },
  {
    "theme": 4,
    "text": "Qual é o salário do exercício para 41 horas, com R$ 600 até 40 horas e R$ 21 por hora excedente?",
    "options": [
      "R$ 621.",
      "R$ 615.",
      "R$ 861.",
      "R$ 1.221."
    ],
    "correct": 0,
    "hint": "A taxa excedente incide somente sobre horas - 40.",
    "explanation": "Há uma hora excedente: 600 + (41 - 40) × 21 = 621. São valores do enunciado didático. Tema 4."
  },
  {
    "theme": 4,
    "text": "Em switch tradicional com case 1 sem break seguido por case 2, o que pode acontecer quando o seletor vale 1?",
    "options": [
      "O bloco do case 2 também pode executar por continuação do fluxo.",
      "default executa antes de case 1.",
      "O compilador inclui break em todos os casos.",
      "O switch volta obrigatoriamente ao início."
    ],
    "correct": 0,
    "hint": "Considere fall-through na forma com dois-pontos.",
    "explanation": "Na forma tradicional, rótulos marcam pontos de entrada. Sem interrupção, a execução pode continuar nos blocos seguintes. Tema 4."
  },
  {
    "theme": 4,
    "text": "Qual afirmação vale para a expressão switch de Java 17 nos exemplos?",
    "options": [
      "Os ramos precisam cobrir as possibilidades; um bloco pode usar yield para fornecer o valor.",
      "Cada ramo com seta precisa de break para evitar fall-through.",
      "return e yield sempre encerram apenas o switch.",
      "Um seletor double é aceito em qualquer switch dessa versão."
    ],
    "correct": 0,
    "hint": "Separe produzir um valor de sair do método.",
    "explanation": "Uma expressão switch deve fornecer um resultado para os caminhos aplicáveis. yield fornece o valor; return encerra o método. Tema 4."
  },
  {
    "theme": 5,
    "text": "Quantas linhas imprime for (int i = 0; i < 5; i++) e qual é o último valor impresso de i?",
    "options": [
      "5 linhas; último valor 4.",
      "6 linhas; último valor 5.",
      "4 linhas; último valor 4.",
      "5 linhas; último valor 5."
    ],
    "correct": 0,
    "hint": "O limite da condição é excluído.",
    "explanation": "Os valores são 0, 1, 2, 3 e 4. Após o incremento para 5, a condição é falsa. Tema 5."
  },
  {
    "theme": 5,
    "text": "Um while inicia com condição falsa; um do/while equivalente também a testa como falsa. Qual é a diferença na primeira passagem?",
    "options": [
      "while executa zero vezes; do/while executa o corpo uma vez.",
      "Ambos executam zero vezes.",
      "while executa uma vez; do/while não executa.",
      "Ambos repetem até a condição virar verdadeira."
    ],
    "correct": 0,
    "hint": "Observe quando ocorre a verificação.",
    "explanation": "while testa antes; do/while testa depois do corpo. A atualização ainda precisa permitir o término quando houver repetição. Tema 5."
  },
  {
    "theme": 5,
    "text": "No código int soma=0; for(int i=1;i<=5;i++){ if(i==3) continue; soma+=i; }, qual é soma?",
    "options": [
      "12.",
      "15.",
      "3.",
      "6."
    ],
    "correct": 0,
    "hint": "A iteração com i igual a 3 não alcança o acumulador.",
    "explanation": "O laço soma 1, 2, 4 e 5. continue pula o restante do corpo atual e o for segue sua atualização. Tema 5."
  },
  {
    "theme": 5,
    "text": "Um break está dentro de um switch, que está dentro de um while. Qual estrutura esse break sem rótulo encerra?",
    "options": [
      "O switch mais próximo.",
      "Toda a JVM.",
      "O while externo em qualquer situação.",
      "O método main automaticamente."
    ],
    "correct": 0,
    "hint": "A estrutura envolvente mais próxima determina o alcance.",
    "explanation": "Um break sem rótulo encerra o switch ou laço mais próximo. Para terminar o menu externo, altere sua condição ou organize outro fluxo explícito. Tema 5."
  },
  {
    "theme": 6,
    "text": "Um array int[] a = new int[3] foi criado. Qual acesso e consulta de comprimento estão corretos?",
    "options": [
      "a[2] e a.length.",
      "a[3] e a.length().",
      "a.get(2) e a.size().",
      "a[-1] e a.length."
    ],
    "correct": 0,
    "hint": "Três posições começam no índice zero.",
    "explanation": "Os índices válidos são 0 a 2. length é campo de array; não é método. Tema 6."
  },
  {
    "theme": 6,
    "text": "int[] a={1,2}; int[] b=a; b[0]=9; Qual é a[0]?",
    "options": [
      "9, pois as variáveis compartilham o mesmo array.",
      "1, pois toda atribuição copia os elementos.",
      "0, pois b substitui o primeiro elemento por padrão.",
      "Erro, pois arrays não aceitam duas referências."
    ],
    "correct": 0,
    "hint": "A atribuição copia o valor da referência.",
    "explanation": "a e b apontam para o mesmo array. Uma cópia de elementos precisa de uma operação como Arrays.copyOf. Tema 6."
  },
  {
    "theme": 6,
    "text": "Uma matriz tem linhas de comprimentos diferentes. Qual é o limite correto do laço interno ao percorrer uma linha?",
    "options": [
      "coluna < matriz[linha].length",
      "coluna <= matriz.length",
      "coluna < matriz[0].length em todos os casos",
      "coluna <= matriz[linha].length"
    ],
    "correct": 0,
    "hint": "O comprimento relevante pertence à linha atual.",
    "explanation": "Matrizes Java são arrays de arrays. O limite de cada linha pode variar, e a posição igual ao comprimento está fora dela. Tema 6."
  },
  {
    "theme": 6,
    "text": "Para encontrar o menor valor de um array não vazio com elementos {8, 5, 9}, qual inicialização é apropriada?",
    "options": [
      "Começar com o primeiro elemento e comparar os seguintes.",
      "Começar sempre em zero.",
      "Usar o comprimento do array como menor obrigatório.",
      "Comparar apenas o primeiro com o último."
    ],
    "correct": 0,
    "hint": "O candidato inicial precisa pertencer ao conjunto ou respeitar uma regra de limite correta.",
    "explanation": "Usar o primeiro elemento evita o falso menor zero em um conjunto positivo. Para array vazio, defina outro resultado ou rejeite a operação. Tema 6."
  },
  {
    "theme": 7,
    "text": "Um método recebe int n e int[] dados. Ele faz n=99 e dados[0]=99. O chamador passou uma variável com 1 e um array {1}. O que muda no chamador?",
    "options": [
      "A variável inteira continua 1; o primeiro elemento do array passa a 99.",
      "Ambos permanecem 1.",
      "Ambos passam a 99.",
      "O array é substituído por outro automaticamente."
    ],
    "correct": 0,
    "hint": "Java copia o valor primitivo ou o valor da referência para o parâmetro.",
    "explanation": "A cópia do inteiro é local. A referência copiada ainda aponta para o array do chamador, que pode ser alterado por ela. Tema 7."
  },
  {
    "theme": 7,
    "text": "Uma classe tem int saldo e static int contasCriadas. Qual afirmação descreve esses campos?",
    "options": [
      "Cada objeto tem seu saldo; contasCriadas é compartilhado pela classe.",
      "Ambos são independentes por objeto.",
      "Ambos são compartilhados sempre.",
      "static torna contasCriadas uma constante imutável."
    ],
    "correct": 0,
    "hint": "Associação à classe e restrição de alteração são conceitos diferentes.",
    "explanation": "Campos de instância pertencem aos objetos; campos static pertencem à classe. final é a restrição de reatribuição, quando aplicável. Tema 7."
  },
  {
    "theme": 7,
    "text": "Qual par de métodos constitui sobrecarga válida?",
    "options": [
      "int somar(int a, int b) e double somar(double a, double b).",
      "int somar(int a) e double somar(int a).",
      "void somar(int a) e int somar(int a).",
      "Dois métodos somar com nomes de parâmetros diferentes e os mesmos tipos."
    ],
    "correct": 0,
    "hint": "O retorno isolado não distingue assinaturas.",
    "explanation": "Listas de tipos de parâmetros diferentes permitem sobrecarga. Apenas mudar o retorno ou o nome do parâmetro não cria outra assinatura. Tema 7."
  },
  {
    "theme": 7,
    "text": "Animal a = new Cachorro(); a.emitirSom(); O método de instância foi sobrescrito em Cachorro. Qual implementação é chamada?",
    "options": [
      "A de Cachorro, conforme o objeto em execução.",
      "Sempre a de Animal, por ser o tipo da variável.",
      "As duas em ordem alfabética.",
      "Nenhuma, pois referências de superclasse não apontam para subclasses."
    ],
    "correct": 0,
    "hint": "O tipo da referência e o tipo do objeto têm papéis diferentes.",
    "explanation": "A chamada de método de instância sobrescrito usa despacho conforme o objeto. Isso demonstra polimorfismo. Tema 7."
  },
  {
    "theme": 8,
    "text": "Uma classe declara apenas Produto(String nome). O que ocorre com new Produto()?",
    "options": [
      "Não há construtor sem argumentos fornecido automaticamente; a chamada não compila sem outra declaração.",
      "A JVM cria um construtor vazio mesmo assim.",
      "O parâmetro recebe string vazia automaticamente.",
      "O compilador ignora todos os construtores declarados."
    ],
    "correct": 0,
    "hint": "O construtor padrão só é fornecido quando nenhum construtor é declarado.",
    "explanation": "Declarar um construtor impede a inclusão automática daquele padrão sem argumentos. Você pode escrever uma sobrecarga vazia explicitamente. Tema 8."
  },
  {
    "theme": 8,
    "text": "Dentro do construtor Pessoa(String nome), o que faz this.nome = nome?",
    "options": [
      "Atribui ao campo do objeto o valor do parâmetro.",
      "Cria outro objeto Pessoa.",
      "Atribui ao parâmetro o campo, na direção oposta.",
      "Transforma nome em static."
    ],
    "correct": 0,
    "hint": "O lado esquerdo identifica o destino da atribuição.",
    "explanation": "this se refere ao objeto atual. O parâmetro nome esconde o nome simples do campo nesse escopo. Tema 8."
  },
  {
    "theme": 8,
    "text": "Qual declaração é um construtor de Circulo?",
    "options": [
      "Circulo(double raio) { this.raio = raio; }",
      "void Circulo(double raio) { this.raio = raio; }",
      "double Circulo() { return 1; }",
      "static int Circulo(int raio) { return raio; }"
    ],
    "correct": 0,
    "hint": "Construtores não declaram tipo de retorno.",
    "explanation": "O nome coincide com a classe e não há retorno declarado. Com void ou outro tipo, a declaração é de método comum. Tema 8."
  },
  {
    "theme": 8,
    "text": "Qual afirmação distingue valores padrão de campos e variáveis locais?",
    "options": [
      "Campos numéricos começam em zero; uma variável local precisa de atribuição antes da leitura.",
      "Toda variável local int começa em zero e pode ser lida sem atribuição.",
      "Campos String começam sempre em texto vazio.",
      "Campos char começam com duas aspas vazias."
    ],
    "correct": 0,
    "hint": "Inicialização automática de campos não se aplica da mesma forma às variáveis locais.",
    "explanation": "Campos recebem padrões da linguagem: números zero, boolean false, char nulo e referências null. Locais precisam de atribuição definida. Tema 8."
  },
  {
    "theme": 9,
    "text": "Um setter imprime “inválido” para um valor fora da faixa e depois executa this.valor = valor incondicionalmente. Qual é o defeito?",
    "options": [
      "O valor inválido ainda é armazenado; a recusa precisa impedir a atribuição.",
      "A impressão impede a atribuição automaticamente.",
      "Setters não podem receber parâmetros.",
      "private impede o próprio setter de modificar o campo."
    ],
    "correct": 0,
    "hint": "A mensagem não muda o fluxo por si só.",
    "explanation": "Use uma política que interrompa a alteração inválida, como lançar exceção ou retornar antes da atribuição. Tema 9."
  },
  {
    "theme": 9,
    "text": "Uma conta tem 10000 centavos, recebe 2500, saca 3000 e recusa um saque de 99999. Qual saldo deve permanecer?",
    "options": [
      "9500 centavos.",
      "0 centavos.",
      "-90499 centavos.",
      "12500 centavos."
    ],
    "correct": 0,
    "hint": "Um saque recusado precisa preservar o estado.",
    "explanation": "10000 + 2500 - 3000 = 9500. A tentativa superior ao saldo não altera esse valor. Tema 9."
  },
  {
    "theme": 9,
    "text": "Qual interface melhor mantém as regras de uma conta encapsulada?",
    "options": [
      "Saldo privado com consulta e operações de depósito e saque que validam seus argumentos.",
      "Saldo público com recomendação para ninguém alterar errado.",
      "setSaldo público que aceita qualquer número e imprime um aviso.",
      "Um saldo static compartilhado por todas as contas sem distinguir titulares."
    ],
    "correct": 0,
    "hint": "A regra precisa valer para todos os caminhos de alteração.",
    "explanation": "Operações com significado de negócio concentram validação. Um setter irrestrito permite ignorar essas operações. Tema 9."
  },
  {
    "theme": 9,
    "text": "Um getter retorna o próprio int[] privado interno. Que consequência deve ser considerada?",
    "options": [
      "O chamador pode modificar os elementos pelo array retornado, mesmo que o campo seja privado.",
      "private torna o array retornado automaticamente imutável.",
      "Arrays retornados por método são sempre cópias profundas.",
      "Métodos não podem retornar referências."
    ],
    "correct": 0,
    "hint": "Acesso ao campo e acesso ao objeto referenciado são questões diferentes.",
    "explanation": "Uma referência retornada pode expor um objeto mutável interno. Uma cópia pode ser necessária para preservar o contrato. Tema 9."
  },
  {
    "theme": 10,
    "text": "Um campo sem modificador está em escola.Aluno. Uma subclasse em outro pacote pode acessá-lo diretamente só por herança?",
    "options": [
      "Não. Acesso de pacote continua limitado ao mesmo pacote.",
      "Sim, herança torna todos os campos públicos.",
      "Sim, desde que escreva import.",
      "Sim, se o nome do campo começar com minúscula."
    ],
    "correct": 0,
    "hint": "Importação e herança não removem a regra de acesso de pacote.",
    "explanation": "Sem modificador de acesso, membros comuns têm acesso de pacote. Uma subclasse fora dele não recebe acesso direto por esse motivo. Tema 10."
  },
  {
    "theme": 10,
    "text": "Carro possui um objeto Motor; Esportivo herda de Carro. O que determina o acesso de Esportivo a um membro protected de Motor?",
    "options": [
      "As regras de pacote e herança referentes a Motor; possuir um motor não torna Esportivo uma subclasse de Motor.",
      "Esportivo pode acessar tudo de Motor porque herda de Carro.",
      "protected é igual a public sempre que houver composição.",
      "Um import transforma Esportivo em herdeiro de Motor."
    ],
    "correct": 0,
    "hint": "Separe a relação “possui” da relação “é um subtipo”.",
    "explanation": "A herança de Carro não transfere direitos de subclasse de Motor. No mesmo pacote de Motor pode haver acesso por pacote; fora dele, outras restrições se aplicam. Tema 10."
  },
  {
    "theme": 10,
    "text": "Qual afirmação sobre modificadores está correta?",
    "options": [
      "private controla acesso; static associa à classe; final pode impedir reatribuição.",
      "private transforma o campo em constante.",
      "static impede qualquer alteração no valor.",
      "final sempre torna imutável o objeto referenciado."
    ],
    "correct": 0,
    "hint": "Cada palavra resolve uma questão diferente.",
    "explanation": "Uma referência final não pode ser reatribuída após inicialização, mas o objeto pode continuar mutável. Acesso e associação à classe são decisões separadas. Tema 10."
  },
  {
    "theme": 10,
    "text": "A classe Main precisa consultar um estoque privado de Produto. Qual mudança preserva melhor o contrato de consulta?",
    "options": [
      "Oferecer getEstoque acessível, mantendo o campo privado.",
      "Tornar todos os atributos públicos.",
      "Colocar import private Produto.",
      "Declarar o campo default int estoque para torná-lo privado."
    ],
    "correct": 0,
    "hint": "Disponibilize a operação necessária sem abrir alteração irrestrita.",
    "explanation": "Um getter acessível permite consulta. default não é o modificador escrito para acesso de pacote, e import não contorna private. Tema 10."
  },
  {
    "theme": 1,
    "text": "Depois de compilar Main.java, você altera seu texto e executa apenas java Main, no fluxo tradicional usado na apostila. Qual versão é executada?",
    "options": [
      "A classe já compilada; é preciso recompilar para incluir a alteração do fonte.",
      "O comando compara e recompila o fonte automaticamente em toda execução.",
      "O editor modifica o arquivo .class ao salvar qualquer texto.",
      "O comando executa simultaneamente o fonte antigo e o novo."
    ],
    "correct": 0,
    "hint": "Separe os arquivos fonte e bytecode.",
    "explanation": "No comando java Main, a JVM carrega a classe compilada disponível. No fluxo mostrado, javac precisa ser chamado novamente após mudar Main.java. Tema 1."
  },
  {
    "theme": 1,
    "text": "Um arquivo Exemplo.java contém public class Main. Qual é a correção apropriada para o modelo dos exercícios?",
    "options": [
      "Salvar a classe pública Main em Main.java, preservando a correspondência exata de nomes.",
      "Trocar apenas o nome do método main para Exemplo.",
      "Renomear o arquivo para Main.class sem compilar.",
      "Remover todos os imports, pois eles definem o nome do arquivo."
    ],
    "correct": 0,
    "hint": "O nome do arquivo corresponde ao tipo público de topo.",
    "explanation": "Nesse modelo com javac, a classe pública Main deve estar em Main.java. O nome do método de entrada continua main. Tema 1."
  },
  {
    "theme": 2,
    "text": "Após int x=3; int anterior=x++; int atualizado=++x;, quais são anterior, atualizado e x?",
    "options": [
      "3, 5 e 5.",
      "4, 4 e 5.",
      "3, 4 e 4.",
      "4, 5 e 6."
    ],
    "correct": 0,
    "hint": "A primeira operação usa o valor anterior e depois incrementa.",
    "explanation": "x++ fornece 3 e deixa x em 4. ++x passa x para 5 e fornece 5 à segunda variável. Tema 2."
  },
  {
    "theme": 2,
    "text": "Qual par descreve (int) 7.9 e Math.round(7.9)?",
    "options": [
      "7 e 8; o cast trunca e round arredonda, retornando long nessa sobrecarga.",
      "8 e 8; ambos sempre arredondam para cima.",
      "7 e 7; ambos apenas descartam a fração.",
      "Erro de compilação nos dois casos."
    ],
    "correct": 0,
    "hint": "Conversão de tipo e arredondamento são operações distintas.",
    "explanation": "O cast de double para int descarta a parte fracionária em direção a zero nesse valor. Math.round(double) devolve o long mais próximo conforme sua regra. Tema 2."
  },
  {
    "theme": 3,
    "text": "Um texto começa com Java. Qual teste reconhece corretamente a presença da palavra usando indexOf?",
    "options": [
      "texto.indexOf(\"Java\") >= 0",
      "texto.indexOf(\"Java\") > 0",
      "texto.indexOf(\"Java\") == -1",
      "texto.indexOf(\"Java\") > texto.length()"
    ],
    "correct": 0,
    "hint": "O índice zero é uma posição válida.",
    "explanation": "indexOf devolve zero quando o trecho começa no início e -1 quando não é encontrado. Testar somente maior que zero perderia a ocorrência inicial. Tema 3."
  },
  {
    "theme": 3,
    "text": "String s=\"A\"; StringBuilder b=new StringBuilder(s); b.append(\"B\"); Qual é o valor de s e de b.toString()?",
    "options": [
      "\"A\" e \"AB\".",
      "\"AB\" e \"AB\".",
      "\"B\" e \"AB\".",
      "\"A\" e \"B\"."
    ],
    "correct": 0,
    "hint": "A montagem ocorre no builder, sem reatribuir s.",
    "explanation": "String permanece imutável. O StringBuilder tem estado mutável e acrescenta B à sua própria sequência. Tema 3."
  },
  {
    "theme": 4,
    "text": "Com int nota=8, dois if independentes testam nota>=7 e nota>=5 e imprimem A e B, respectivamente. Qual é a saída?",
    "options": [
      "A e B, pois as duas condições são avaliadas e são verdadeiras.",
      "Somente A, pois o segundo if se torna else automaticamente.",
      "Somente B, pois a condição menor apaga a anterior.",
      "Nenhuma saída, pois condições sobrepostas não compilam."
    ],
    "correct": 0,
    "hint": "Dois if independentes não formam uma cadeia exclusiva.",
    "explanation": "Sem else ligando as condições, cada if é avaliado. Ambos os blocos executam para nota 8. Tema 4."
  },
  {
    "theme": 4,
    "text": "O código if (saldo > 0); { System.out.println(\"Consulta\"); } usa saldo igual a 0. O que acontece?",
    "options": [
      "Consulta é impressa, pois o ponto e vírgula encerra uma instrução vazia controlada pelo if.",
      "Nada é impresso, pois o bloco está protegido pelo if.",
      "Saldo é alterado para 1 antes da impressão.",
      "O ponto e vírgula transforma o if em um laço."
    ],
    "correct": 0,
    "hint": "Observe a instrução imediatamente após a condição.",
    "explanation": "O if controla a instrução vazia. O bloco seguinte executa independentemente da condição, apesar de a indentação poder sugerir outra intenção. Tema 4."
  },
  {
    "theme": 5,
    "text": "Um for externo repete 3 vezes. Em cada passagem, um for interno usa j=0 até j<4, mas faz break quando j==2, antes de incrementar total. Qual será total, iniciado em zero?",
    "options": [
      "6.",
      "12.",
      "2.",
      "3."
    ],
    "correct": 0,
    "hint": "O break encerra somente o laço interno atual.",
    "explanation": "Em cada passagem externa, total é incrementado para j igual a 0 e 1. São duas vezes por passagem, totalizando 3 × 2 = 6. Tema 5."
  },
  {
    "theme": 5,
    "text": "No código for(int i=1;i<=3;i++){ int soma=0; soma+=i; System.out.print(soma); }, o que é impresso?",
    "options": [
      "123, pois soma é reinicializada em cada iteração.",
      "136, pois soma acumula todas as iterações.",
      "000, pois variáveis locais não podem ser alteradas.",
      "333, pois i só muda após o laço inteiro."
    ],
    "correct": 0,
    "hint": "A posição da declaração determina quando a inicialização acontece.",
    "explanation": "A cada passagem soma começa em zero e recebe apenas i. Para acumular entre passagens, a declaração deve ficar antes do laço. Tema 5."
  },
  {
    "theme": 6,
    "text": "int[] a={1,2}; for(int valor:a){ valor*=2; } Qual é o conteúdo final de a?",
    "options": [
      "[1, 2].",
      "[2, 4].",
      "[4, 8].",
      "[0, 0]."
    ],
    "correct": 0,
    "hint": "A variável de iteração recebe um valor primitivo.",
    "explanation": "Alterar valor modifica apenas a variável local da iteração. Para modificar posições do array, use os índices, como a[i] *= 2. Tema 6."
  },
  {
    "theme": 6,
    "text": "Um método faz int menor=a[0]; antes de testar if(a.length==0). Qual problema ocorre com um array vazio?",
    "options": [
      "O acesso já falha antes de a validação ser alcançada.",
      "O teste posterior desfaz o acesso inválido.",
      "a[0] devolve automaticamente zero em qualquer array vazio.",
      "length se torna 1 quando a primeira posição é lida."
    ],
    "correct": 0,
    "hint": "Uma validação protege somente operações executadas depois dela.",
    "explanation": "Um array de comprimento zero não possui índice zero. A verificação precisa ocorrer antes de ler o primeiro elemento. Tema 6."
  },
  {
    "theme": 7,
    "text": "Existem mostrar(Animal) e mostrar(Cachorro). Animal a=new Cachorro(); é passado a mostrar(a). Qual sobrecarga é escolhida?",
    "options": [
      "mostrar(Animal), considerando o tipo declarado do argumento na compilação.",
      "mostrar(Cachorro), pois sobrecarga sempre usa o tipo do objeto em execução.",
      "As duas sobrecargas são chamadas.",
      "A chamada é proibida, pois a referência aponta para uma subclasse."
    ],
    "correct": 0,
    "hint": "Diferencie seleção de sobrecarga e despacho de um método sobrescrito.",
    "explanation": "A sobrecarga considera os tipos na compilação. A seleção de uma implementação sobrescrita de método de instância é outra etapa, baseada no objeto. Tema 7."
  },
  {
    "theme": 7,
    "text": "Um método void recebe Caixa c, altera c.valor para 9 e depois faz c=new Caixa(100). O chamador mantinha uma Caixa com valor 1. Qual valor permanece naquele objeto original?",
    "options": [
      "9.",
      "100.",
      "1.",
      "0."
    ],
    "correct": 0,
    "hint": "Mutação do objeto e reatribuição do parâmetro têm efeitos diferentes.",
    "explanation": "A primeira instrução muda o objeto compartilhado. A segunda troca apenas a referência local do parâmetro; a variável do chamador continua apontando para o objeto com valor 9. Tema 7."
  },
  {
    "theme": 8,
    "text": "A superclasse declara apenas Base(int valor). Uma subclasse declara Derivada() sem this(...) nem super(...). O que falta para compilar nesse caso?",
    "options": [
      "Uma chamada explícita a um construtor acessível da superclasse, como super(1), ou outra cadeia de construção válida.",
      "Trocar extends por import para herdar o construtor.",
      "Adicionar void antes de Derivada().",
      "Tornar todos os atributos static para evitar construtores."
    ],
    "correct": 0,
    "hint": "Sem outra chamada, tenta-se usar o construtor sem argumentos da superclasse.",
    "explanation": "Na referência Java 17, a chamada implícita super() falha se não houver aquele construtor acessível. A subclasse deve organizar uma chamada válida. Tema 8."
  },
  {
    "theme": 8,
    "text": "Um construtor rejeita somente raio<=0. Por que acrescentar !Double.isFinite(raio) pode ser necessário?",
    "options": [
      "NaN e infinito não representam um raio finito válido, e a comparação isolada não rejeita todos esses casos.",
      "Double.isFinite converte todo número negativo em positivo.",
      "O operador <= só aceita variáveis int.",
      "Qualquer double positivo é automaticamente uma medida finita."
    ],
    "correct": 0,
    "hint": "Há valores especiais no ponto flutuante.",
    "explanation": "Para uma medida positiva e finita, valide as duas propriedades. NaN não satisfaz comparações ordenadas comuns e infinito positivo passa no teste isolado de positividade. Tema 8."
  },
  {
    "theme": 9,
    "text": "saldo tem Long.MAX_VALUE e a atribuição saldo=Math.addExact(saldo,1) é tentada. O que ocorre?",
    "options": [
      "Uma ArithmeticException é lançada e a atribuição não acontece.",
      "saldo passa silenciosamente a um valor negativo, como na soma comum.",
      "saldo se torna zero antes de a exceção ser lançada.",
      "addExact converte o campo para BigDecimal automaticamente."
    ],
    "correct": 0,
    "hint": "O lado direito precisa ser calculado antes da atribuição.",
    "explanation": "Math.addExact detecta transbordamento. Como a chamada lança a exceção, não produz o novo valor que seria atribuído ao campo. Tema 9."
  },
  {
    "theme": 9,
    "text": "Uma classe guarda um double[] privado, mas retorna diretamente esse array no getter. Qual alternativa preserva melhor o conteúdo interno contra alterações pelo resultado dessa consulta?",
    "options": [
      "Retornar uma cópia do array e também avaliar se o array recebido no construtor precisa ser copiado.",
      "Adicionar final ao campo e continuar compartilhando a mesma referência.",
      "Renomear o getter para consultarSemAlterar sem mudar seu retorno.",
      "Imprimir um aviso e devolver o mesmo array."
    ],
    "correct": 0,
    "hint": "Considere tanto a entrada quanto a saída de referências mutáveis.",
    "explanation": "private restringe o acesso ao campo, não elimina referências compartilhadas ao objeto. Uma cópia de elementos primitivos permite consultar sem expor aquele array interno. Tema 9."
  },
  {
    "theme": 10,
    "text": "Uma classe de topo não pública está no pacote estoque e possui um método public. Outra classe sem relação, em pacote diferente, consegue usar diretamente esse tipo só porque o método é público?",
    "options": [
      "Não. O próprio tipo também precisa estar acessível.",
      "Sim. Um método public torna automaticamente pública sua classe.",
      "Sim, bastando trocar o nome da variável para começar com maiúscula.",
      "Sim. Acessibilidade de tipos só é verificada na execução."
    ],
    "correct": 0,
    "hint": "Verifique o acesso ao tipo antes de verificar o membro.",
    "explanation": "Um método público não abre o acesso de uma classe de topo que tem acesso de pacote. Tipo e membro têm regras que precisam ser atendidas. Tema 10."
  },
  {
    "theme": 10,
    "text": "Dentro de uma classe, final int[] valores={1,2}; é um campo. Qual operação pode ser permitida depois da inicialização?",
    "options": [
      "Alterar valores[0], pois final impede reatribuir a referência, não torna o array imutável.",
      "Reatribuir valores a outro array, mas nunca alterar elementos.",
      "Remover final durante a execução com uma atribuição comum.",
      "Ler somente o comprimento, pois nenhum elemento de um array final pode ser lido."
    ],
    "correct": 0,
    "hint": "A restrição se aplica à variável que guarda a referência.",
    "explanation": "O campo final não pode receber outro array depois de inicializado. Os elementos do array continuam mutáveis, respeitadas as demais regras de acesso. Tema 10."
  }
];
const STORAGE_KEY = "java_quiz_progress_v1";
const contentDiv = document.getElementById("dynamicContent");
let QUIZ_DATA = [];
let currentIndex = 0;
let userAnswers = [];
let answerStatus = [];
let quizFinished = false;

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildShuffledQuiz() {
    return RAW_QUESTIONS.map((q) => {
        const indexed = q.options.map((text, i) => ({ text, i }));
        const shuffled = shuffle(indexed);
        return {
            text: q.text,
            hint: q.hint,
            explanation: q.explanation,
            theme: q.theme,
            options: shuffled.map((o) => o.text),
            correct: shuffled.findIndex((o) => o.i === q.correct)
        };
    });
}

function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentIndex, userAnswers, answerStatus, quizFinished, quizData: QUIZ_DATA
    })); } catch { document.getElementById("quizNotice").textContent = "O navegador não permitiu salvar. Você pode continuar, mas o progresso será perdido ao fechar."; }
}

function loadProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(saved?.quizData)) saved.quizData = saved.quizData.map((q,i) => ({...q,
            options: Array.isArray(q.options) ? q.options.map(o => typeof o === 'string' ? o.replace(/(\d)[–—](?=\d)/g, '$1-') : o) : q.options,
            hint: RAW_QUESTIONS[i]?.hint, explanation: RAW_QUESTIONS[i]?.explanation}));
        if (saved && Array.isArray(saved.quizData) && saved.quizData.length > 0 && saved.quizData.length <= RAW_QUESTIONS.length
            && Array.isArray(saved.userAnswers) && saved.userAnswers.length === saved.quizData.length
            && typeof saved.quizFinished === 'boolean'
            && Number.isInteger(saved.currentIndex) && saved.currentIndex >= 0 && saved.currentIndex < saved.quizData.length
            && saved.quizData.every((q, i) => q.text === RAW_QUESTIONS[i].text && q.theme === RAW_QUESTIONS[i].theme && q.explanation === RAW_QUESTIONS[i].explanation && q.hint === RAW_QUESTIONS[i].hint
              && Array.isArray(q.options) && q.options.length === 4 && new Set(q.options).size === 4 && q.options.every(o => RAW_QUESTIONS[i].options.includes(o))
              && Number.isInteger(q.correct) && q.options[q.correct] === RAW_QUESTIONS[i].options[RAW_QUESTIONS[i].correct])
            && saved.userAnswers.every(a => a === null || Number.isInteger(a) && a >= 0 && a < 4)
            && saved.userAnswers.every((a,i) => i < saved.currentIndex ? a !== null : i > saved.currentIndex ? a === null : true)
            && (!saved.quizFinished || saved.currentIndex === saved.quizData.length-1 && saved.userAnswers.every(a => a !== null))) {
            currentIndex = saved.currentIndex;
            userAnswers = saved.userAnswers;
            answerStatus = saved.userAnswers.map((a,i) => a === null ? null : a === saved.quizData[i].correct);
            quizFinished = saved.quizFinished;
            QUIZ_DATA = saved.quizData;
            const added = buildShuffledQuiz().slice(QUIZ_DATA.length);
            if (added.length) {
                if (quizFinished) currentIndex = QUIZ_DATA.length;
                QUIZ_DATA.push(...added);
                userAnswers.push(...new Array(added.length).fill(null));
                answerStatus.push(...new Array(added.length).fill(null));
                quizFinished = false;
                document.getElementById('quizNotice').textContent = added.length + ' questões novas foram acrescentadas. Suas respostas anteriores foram preservadas.';
                saveProgress();
            }
            return true;
        }
    } catch (e) {}
    return false;
}

function resetQuiz() {
    QUIZ_DATA = buildShuffledQuiz();
    currentIndex = 0;
    userAnswers = new Array(QUIZ_DATA.length).fill(null);
    answerStatus = new Array(QUIZ_DATA.length).fill(null);
    quizFinished = false;
    saveProgress();
    renderCurrentQuestion();
}

function getScore() { return answerStatus.filter((s) => s === true).length; }
function getErrors() { return answerStatus.filter((s) => s === false).length; }

function escapeHtml(str) {
    return String(str).replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
}

function renderProgressAndStats() {
    const stepsHtml = QUIZ_DATA.map((_, idx) => {
        let className = "step-dot";
        if (answerStatus[idx] === true) className += " completed";
        else if (answerStatus[idx] === false) className += " incorrect";
        if (idx === currentIndex) className += " active";
        return '<div class="' + className + '"></div>';
    }).join("");
    return '<div class="progress-row">'
        + '<div class="steps-container">' + stepsHtml + '</div>'
        + '<div class="stats-row">'
        + '<div class="question-counter">' + (currentIndex + 1) + ' / ' + QUIZ_DATA.length + '</div>'
        + '<div class="score-badges">'
        + '<div class="badge-correct"><span class="visually-hidden">Acertos: </span>✓ ' + getScore() + '</div>'
        + '<div class="badge-incorrect"><span class="visually-hidden">Erros: </span>✗ ' + getErrors() + '</div>'
        + '</div></div></div>';
}

function renderCurrentQuestion() {
    if (quizFinished || currentIndex >= QUIZ_DATA.length) { showResultScreen(); return; }
    const q = QUIZ_DATA[currentIndex];
    const alreadyAnswered = userAnswers[currentIndex] !== null;
    const selectedIdx = userAnswers[currentIndex];
    const letters = ["A", "B", "C", "D"];
    let optionsHtml = "";
    q.options.forEach((opt, idx) => {
        let extraClass = "";
        let disabled = "";
        if (alreadyAnswered) {
            if (idx === q.correct) extraClass = " correct-highlight";
            else if (idx === selectedIdx && idx !== q.correct) extraClass = " wrong-highlight";
            disabled = "disabled";
        }
        optionsHtml += '<button type="button" class="option-card' + extraClass + '" data-opt-index="' + idx + '" ' + disabled + '>'
            + '<span class="option-prefix">' + letters[idx] + '.</span><span>' + escapeHtml(opt) + '</span></button>';
    });
    let explanationHtml = "";
    if (alreadyAnswered) {
        const isCorrect = selectedIdx === q.correct;
        const prefix = isCorrect
            ? "✓ Correto! "
            : "✗ Resposta incorreta. A alternativa correta é \"" + escapeHtml(q.options[q.correct]) + "\". ";
        explanationHtml = '<div class="explanation-box" role="status">' + prefix + escapeHtml(q.explanation) + '</div>';
    }
    const hintId = "hint_" + currentIndex;
    const hintHtml = '<div class="hint-wrapper"><button type="button" class="hint-trigger" aria-expanded="false" aria-controls="' + hintId + '" data-hint-id="' + hintId + '">Mostrar dica</button><div id="' + hintId + '" class="hint-text">' + escapeHtml(q.hint) + '</div></div>';
    const nextDisabled = alreadyAnswered ? "" : "disabled";
    const nextHtml = '<div class="next-container"><button type="button" class="next-button" id="nextQuestionBtn" ' + nextDisabled + '>Avançar</button></div>';
    contentDiv.innerHTML = renderProgressAndStats() + '<h2 class="question-text" id="questionTitle" tabindex="-1">' + escapeHtml(q.text) + '</h2>'
        + '<div class="options-grid">' + optionsHtml + '</div>'
        + explanationHtml + hintHtml + nextHtml;

    document.querySelectorAll(".option-card:not([disabled])").forEach((btn) => {
        btn.addEventListener("click", () => {
            const chosenIdx = parseInt(btn.dataset.optIndex, 10);
            userAnswers[currentIndex] = chosenIdx;
            answerStatus[currentIndex] = chosenIdx === q.correct;
            saveProgress();
            renderCurrentQuestion();
            document.getElementById("nextQuestionBtn").focus();
        });
    });
    document.querySelector(".hint-trigger")?.addEventListener("click", () => {
        const shown = document.getElementById(hintId)?.classList.toggle("show");
        document.querySelector(".hint-trigger").setAttribute("aria-expanded", String(shown));
    });
    document.getElementById("nextQuestionBtn")?.addEventListener("click", () => {
        if (!alreadyAnswered) return;
        if (currentIndex + 1 < QUIZ_DATA.length) {
            currentIndex++;
            saveProgress();
            renderCurrentQuestion();
            document.getElementById("questionTitle").focus();
        } else {
            quizFinished = true;
            saveProgress();
            showResultScreen();
        }
    });
}

function showResultScreen() {
    const score = getScore();
    const review = Array.from({length:10}, (_,i) => {
        const indexes = QUIZ_DATA.map((q,j) => q.theme === i+1 ? j : -1).filter(j => j >= 0);
        const correct = indexes.filter(j => answerStatus[j] === true).length;
        return '<li>Tema '+(i+1)+': '+correct+' / '+indexes.length+' · <a href="cont.html#modal'+(i+1)+'">Revisar conteúdo</a></li>';
    }).join('');
    const answers = QUIZ_DATA.map((q,i) => '<details class="mb-3"><summary>'+ (i+1)+'. '+escapeHtml(q.text)+' ('+(answerStatus[i] ? 'Correta' : 'Revisar')+')</summary><p>Sua resposta: '+escapeHtml(q.options[userAnswers[i]])+'</p><p>Resposta correta: '+escapeHtml(q.options[q.correct])+'</p><p>'+escapeHtml(q.explanation)+'</p></details>').join('');
    contentDiv.innerHTML = '<div class="result-container"><h2 tabindex="-1" id="resultTitle">Resultado do quiz</h2><div class="final-score-text">'+score+' / '+QUIZ_DATA.length+'</div><p>'+Math.round(score/QUIZ_DATA.length*100)+'% de acertos. Use os temas abaixo para orientar a revisão.</p><ul class="text-start">'+review+'</ul><h3 class="h5 mt-4 text-start">Gabarito comentado</h3><div class="text-start">'+answers+'</div><button type="button" class="restart-quiz" id="restartQuizBtn">Tentar novamente</button></div>';
    document.getElementById('restartQuizBtn').addEventListener('click', () => {
        if (confirm('Reiniciar o quiz e substituir o progresso desta tentativa?')) resetQuiz();
    });
    document.getElementById('resultTitle').focus();
}

const loaded = loadProgress();
if (loaded && QUIZ_DATA && QUIZ_DATA.length === RAW_QUESTIONS.length && !quizFinished) renderCurrentQuestion();
else if (loaded && quizFinished) showResultScreen();
else resetQuiz();
