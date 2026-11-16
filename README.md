# HORSE DASH! 🏇

Jogo arcade de corrida desenvolvido como projeto acadêmico com **React, JavaScript e Vite**. A pessoa jogadora escolhe um cavalo e acompanha uma corrida curta contra os outros competidores.

> **Importante:** o jogo é apenas recreativo. Não existem apostas, dinheiro real, prêmios financeiros ou compras.

## Demonstração

A aplicação pode ser publicada na Vercel conectando este repositório e mantendo as configurações padrão do Vite:
- Build command: `npm run build`
- Output directory: `dist`

## Executar localmente

1. Instale uma versão LTS do [Node.js](https://nodejs.org/).
2. Clone o repositório:
   ```bash
   git clone https://github.com/DogShown/HorseRacing.git
   cd HorseRacing
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Abra o endereço local exibido pelo Vite no terminal.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera os arquivos otimizados em `dist/`. |
| `npm run preview` | Executa uma prévia local da versão de produção. |

## Funcionalidades

- Seleção entre três competidores: Comet, Blaze e Pixel.
- Corrida animada com avanço aleatório dos cavalos.
- Identificação do vencedor considerando o instante em que cada cavalo cruza a chegada.
- Ganho de 100 pontos quando o cavalo escolhido vence.
- Pontuação acumulada salva no `localStorage` do navegador.
- Possibilidade de iniciar novas corridas sem perder a pontuação.
- Interface responsiva para celular e computador.
- Estados e controles acessíveis por teclado e tecnologias assistivas.

## Organização do código

```text
src/
├── data/
│   └── horses.js          # Dados dos competidores
├── hooks/
│   └── useRaceGame.js     # Estado, lógica da corrida e pontuação
├── styles/
│   ├── tokens.css         # Cores, fontes e variáveis globais
│   ├── layout.css         # Estrutura e cabeçalho
│   ├── horses.css         # Cartões de seleção
│   ├── track.css          # Pista e competidores
│   ├── panels.css         # Pontuação, controles e resultado
│   ├── animations.css    # Animações
│   └── responsive.css    # Adaptação a diferentes telas
├── App.jsx                # Composição da interface
├── App.css                # Entrada dos estilos
└── main.jsx               # Inicialização do React
```

## Tecnologias e conceitos

- **React:** componentes reutilizáveis e renderização declarativa.
- **JavaScript:** regras da corrida, cálculo de progresso e seleção do vencedor.
- **useState:** estado da interface, pontuação e competidores.
- **useEffect:** ciclo da corrida, persistência local e limpeza dos temporizadores.
- **useRef:** referência ao progresso atual sem depender de renderizações intermediárias.
- **localStorage:** armazenamento local da pontuação.
- **CSS:** identidade visual, animações, responsividade e estados de foco.

## Limitações conhecidas

A pontuação fica salva apenas no navegador e dispositivo utilizados. Limpar os dados do navegador ou trocar de dispositivo pode apagar esse progresso. O jogo não possui contas, ranking online, servidor ou sincronização entre dispositivos.

## Projeto acadêmico

Desenvolvido para fins educacionais e demonstração de conceitos de desenvolvimento front-end.
