# Sistema de Venda de Ingressos - Programação Orientada a Eventos

Este projeto foi desenvolvido para a disciplina de **Linguagem de Programação e Paradigmas**. Trata-se de uma aplicação web que simula, em tempo real, a venda de ingressos para um jogo de futebol.

O sistema possui duas interfaces com papéis distintos, conforme solicitado nos requisitos do trabalho:
* **Página do Torcedor**: A visão principal onde os usuários podem ver o status da venda, a quantidade de ingressos disponíveis e realizar a reserva e confirmação de compra.
* **Página do Administrador**: Um painel de controle simples que permite ao administrador iniciar e encerrar o processo de venda.

<img width="1916" height="831" alt="image" src="https://github.com/user-attachments/assets/e3e9a799-51c2-4156-9f3a-d97db22feb37" />

---

## Desenvolvedores

| Foto                                                                             | Desenvolvedor      | GitHub                                             |
| :------------------------------------------------------------------------------- | :----------------- | :------------------------------------------------- |
| [<img src="https://github.com/gabste8831.png?size=75" width="75px;"/>](https://github.com/gabste8831) | Gabriel Steffens   | [@gabste8831](https://github.com/gabste8831)       |
| [<img src="https://github.com/Lucas1063.png?size=75" width="75px;"/>](https://github.com/Lucas1063)   | Lucas Weigel       | [@Lucas1063](https://github.com/Lucas1063)         |

---

## Tecnologias Utilizadas

* **Backend:** Node.js, Express, TypeScript, Socket.IO
* **Frontend:** React, TypeScript, Socket.IO Client, React Router DOM

---

## Como Instalar e Executar a Aplicação

Siga os passos abaixo para clonar, configurar e executar o projeto em seu ambiente de desenvolvimento local.

### Pré-requisitos
Antes de começar, certifique-se de que você tem o **Node.js** e o **NPM** instalados. Você pode verificar as versões executando os seguintes comandos no seu terminal:
```bash
node -v
npm -v
```
Recomenda-se Node.js v16 ou superior.

### Passo a Passo

**1. Clonar o Repositório**

Primeiro, clone este repositório para a sua máquina local usando o seguinte comando:
```bash
git clone [https://github.com/gabste8831/App-venda-ingressos.git](https://github.com/gabste8831/App-venda-ingressos.git)
```
Depois, navegue para a pasta do projeto:
```bash
cd App-venda-ingressos
```

**2. Configurar e Iniciar o Backend (Servidor)**

O backend é responsável por toda a lógica de eventos e o controle dos ingressos.

Abra um **primeiro terminal** e execute os seguintes comandos:
```bash
# Navegue para a pasta do backend
cd backend

# Instale todas as dependências necessárias
npm install

# Inicie o servidor em modo de desenvolvimento
npm start
```
Após executar `npm start`, você deverá ver a seguinte mensagem, indicando que o servidor está pronto para receber conexões:
`Servidor da bilheteria rodando na porta 4000`

**Mantenha este terminal aberto e rodando.**

**3. Configurar e Iniciar o Frontend (Cliente)**

O frontend é a interface visual com a qual os usuários (torcedor e administrador) irão interagir.

Abra um **segundo terminal** (mantenha o terminal do backend rodando) e execute os seguintes comandos:
```bash
# A partir da pasta raiz do projeto, navegue para a pasta do frontend
cd frontend/bilheteria-app

# Instale todas as dependências necessárias
npm install

# Inicie a aplicação React
npm start
```
Este comando abrirá automaticamente uma nova aba no seu navegador padrão.

**4. Acessar a Aplicação**

Para ver a aplicação funcionando e testar a interação em tempo real, abra as seguintes URLs em abas separadas do seu navegador:

* **Página do Torcedor:** `http://localhost:3000`
* **Página do Administrador:** `http://localhost:3000/admin`

Agora, você pode realizar ações na página do administrador (como "Abrir Vendas") e ver os resultados refletidos instantaneamente na página do torcedor.

---

## Análise do Paradigma Orientado a Eventos

Esta seção responde às perguntas propostas no documento do trabalho, detalhando como os conceitos do paradigma orientado a eventos foram aplicados.

### Quais eventos o seu sistema emite e escuta?

O sistema utiliza um conjunto de eventos para gerenciar o fluxo de venda de ingressos. Os nomes seguem uma estrutura `contexto.acao` para maior clareza.

**Eventos Emitidos pelo Cliente (Frontend):**
* `admin.iniciar-vendas`: Emitido pela página `/admin` para solicitar ao servidor o início das vendas.
* `admin.encerrar-vendas`: Emitido pela página `/admin` para finalizar o processo de vendas.
* `ingresso.reservar`: Emitido pela página do torcedor (`/`) quando ele clica no botão para reservar um ingresso.
* `compra.confirmar`: Emitido pelo torcedor para confirmar uma reserva ativa antes que o tempo de expiração se esgote.

**Eventos Emitidos pelo Servidor (Backend) e Escutados pelo Cliente:**
* `estado.atualizado`: Evento genérico emitido sempre que há uma mudança no estado da partida (ex: contagem de ingressos). É o principal evento para manter a sincronia entre todos os clientes.
* `partida.aberta`: Evento de broadcast que notifica todos os usuários que as vendas foram oficialmente iniciadas.
* `partida.encerrada`: Evento de broadcast que notifica todos que as vendas terminaram.
* `ingresso.reservado`: Emitido de volta para o cliente específico que fez a reserva, confirmando o sucesso e enviando o tempo de expiração para o contador.
* `compra.confirmada`: Emitido para o cliente que confirmou a compra, com uma mensagem de sucesso.
* `reserva.expirada`: Emitido para todos quando o timer de uma reserva se esgota, permitindo que a interface do cliente se atualize e mostre o ingresso devolvido ao estoque.
* `reserva.falhou`: Emitido para o cliente caso sua tentativa de reserva não possa ser completada (ex: ingressos esgotados).

### Como o sistema sabe quando deve atualizar os outros usuários?

O sistema utiliza o método `io.emit('nome-do-evento', dados)` no lado do servidor (backend). Este método realiza um **broadcast**, ou seja, envia a mensagem e os dados associados para **todos os clientes conectados** simultaneamente.

Isso é usado em momentos cruciais que afetam a visão de todos, como:
* Quando o administrador abre ou encerra as vendas.
* Quando um ingresso é reservado, devolvido (por expiração ou desconexão) ou comprado.

A responsabilidade de notificar a todos é centralizada no servidor, que detém o "estado da verdade". Isso garante a consistência dos dados para todos os participantes em tempo real, sem que ninguém precise recarregar a página.

### Que parte do código mostra o uso do paradigma orientado a eventos? 

O uso do paradigma é mais evidente no arquivo do servidor, **`backend/src/index.ts`**, dentro do bloco `io.on('connection', (socket) => { ... })`.

Nesta seção, o código não segue um fluxo de execução linear. Em vez disso, ele é estruturado como um conjunto de **"ouvintes" de eventos (`socket.on(...)`)**. O servidor fica em estado de espera e apenas **reage** quando um evento específico chega de um cliente.

**Exemplo de encadeamento de eventos presente no projeto:** 

1.  **Ação no Cliente:** O torcedor clica no botão "Reservar Ingresso".
2.  **Emissão (`emit`):** A interface emite o evento `ingresso.reservar` para o servidor.
3.  **Escuta (`on`):** O servidor, que está ouvindo com `socket.on('ingresso.reservar', ...)` , captura este evento.
4.  **Reação:** O servidor executa a lógica: diminui a contagem de ingressos, inicia um temporizador e atualiza seu estado interno.
5.  **Broadcast:** Em seguida, o servidor emite o evento `estado.atualizado` para **todos** os clientes. Os clientes, ao receberem este evento, reagem atualizando suas interfaces para mostrar o novo número de ingressos disponíveis.

Este ciclo de **emitir -> escutar -> reagir -> notificar** é a essência da programação orientada a eventos e a base de funcionamento desta aplicação.
