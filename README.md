# Charadas Arcade  Arcade

> Um jogo interativo de charadas com temática estilo Arcade 80s, visual de máquina CRT, sistema de similaridade inteligente e rankings locais imersivos.

![Banner do Projeto](https://img.shields.io/badge/Status-Ativo-emerald?style=for-the-badge&logo=appveyor)

Charadas Arcade é uma aplicação Web Front-end hiper imersiva onde os jogadores recebem riddles (charadas) progressivas consumindo uma API em tempo real. O jogo simula um terminal de fliperama clássico (retro) e introduz progressão com penalidades, algoritmos de verificação flexível (aceita erros de digitação leves) e rankeamento destacando os avatares.
## 🚀 Quick Start

O projeto utiliza o Vite como ferramenta de build ultra-rápida. Para rodá-lo localmente:

1. Clone o repositório.
2. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
3. Instale as dependências e inicie o ambiente de desenvolvimento:

```bash
# 1. Instalar pacotes necessários (Vite, Tailwind, Firebase)
npm install

# 2. Iniciar o servidor dev do Vite
npm run dev
```

Abra a porta local que o terminal indicar (geralmente `http://localhost:5173`).

## ✨ Features

- **Algoritmo de Similaridade (Levenshtein):** A resposta não precisa ser 100% exata na grafia, suportando erros simples e pontuação. Similaridade de base em 70% para acertos.
- **Integração com Backend API / Firebase:** Estrutura pronta localmente via dependência e requisições nativas de charadas rodando de uma API do Vercel.
- **Rankings Locais (LocalStorage):** Preservação do Top 10 Highscores de diferentes players na mesma máquina. Persistência de acertos, pontos acumulados baseados em score dinâmico.
- **Interface Premium (Retro Arcade / Tailwind v4):** Temática imersiva inspirada nos anos 80, com efeitos nativos de monitor CRT (flicker/scanlines), tela de *Start Screen* animada, gerador de partículas em neon e micro-interações fluidas adaptadas para Mobile e Desktop.
- **Gestão Tática (Skip Penalty):** Pular uma charada deduz 5 pontos da reserva do jogador, exigindo o gerenciamento de pontos.

## 🛠️ Tecnologias Principais

| Ferramenta | Propósito |
|----------|-------------|
| **HTML5 & Vanilla JavaScript** | Estrutura semântica e toda a lógica assíncrona (promises) e DOM Manipulation sem Framework JS. |
| **TailwindCSS** | Configuração via CDN e pacotes Dev (PostCSS + Autoprefixer) para estilização de baixo nível baseada em utilitários e variáveis de CSS modernas. |
| **Vite** | Bundler da aplicação e Hot Module Replacement dev server. |
| **Firebase** (SDK 12+) | Dependência alocada no `package.json` para eventual substituição/extensão de banco de dados, storage e analytics. |

## 🎮 Como Jogar (Mecânicas de Jogo)

1. **Autenticação:** Ao entrar, o player visualiza a gloriosa *Start Screen*. Nela, deve inserir um "INSERT COIN", ou seja, informar o seu codinome de Player Name e escolher um **Avatar** Retrô!
2. **Rodadas:** São 10 rodadas máximas por partida.
3. **Respostas e Pontos:** 
   - Ao acertar (≥70% proximidade) você ganha pontos proporcionais à dificuldade de percentual (max ≈50 pontos por rodada).
   - Ao pular ("Pular esta rodada"), o sistema passa pra frente mas aplica `-5 pts` na conta do jogador.
4. **Fim de Partida & Scoreboard:** Será ranqueado no "Top 10 Local". Quem tiver o maior índice de precisão e de pontos lidera a tabela.

## 📁 Estrutura de Arquivos Principal

- `index.html`: Shell da aplicação e UI do Game/Endgame Screen.
- `script.js`: Lógica funcional (Inicialização de Rodadas, Score Manager, Fetch API).
- `package.json` / `vite.config` (Implícito): Ferramentas de CI, building e dev environment.
- `wireframe.excalidraw`: Esboço conceitual/protótipo base da Interface do projeto.

## 📄 Licença

Distribuído sob a licença **ISC**. Consulte o arquivo de licença respectivo para mais detalhes.

---
> Desenvolvido para entregar a melhor experiência de UI/UX em desafios rápidos de texto.

TESTE MEU SITE NA VERCEL
https://projeto-charada-1-0.vercel.app/
