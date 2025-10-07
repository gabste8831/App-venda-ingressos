// src/index.ts

// --- Imports ---
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// --- Configuração do Servidor ---
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// --- Tipos e Estado Global ---
interface Reserva {
  timer: NodeJS.Timeout;
}

interface PartidaState {
  status: 'Aguardando' | 'Vendas Abertas' | 'Encerrada';
  totalIngressos: number;
  ingressosDisponiveis: number;
  reservas: Map<string, Reserva>; // Associa socket.id a uma reserva
}

// Objeto de estado que centraliza a lógica da aplicação.
let partidaState: PartidaState = {
  status: 'Aguardando',
  totalIngressos: 50,
  ingressosDisponiveis: 50,
  reservas: new Map()
};

const TEMPO_EXPIRACAO_RESERVA = 30000; // 30s

// --- Lógica de Eventos Socket.IO ---
io.on('connection', (socket) => {
  console.log(`[CONEXÃO] Novo torcedor conectado: ${socket.id}`);

  // Envia o estado atual para o cliente que acabou de se conectar.
  socket.emit('estado.atualizado', partidaState);

  // Evento: 'admin.iniciar-vendas'
  socket.on('admin.iniciar-vendas', () => {
    if (partidaState.status === 'Aguardando') {
      partidaState.status = 'Vendas Abertas';
      console.log('[EVENTO] Vendas iniciadas pelo administrador.');
      // Notifica todos os clientes que as vendas começaram.
      io.emit('partida.aberta', partidaState);
    }
  });

  // Evento: 'admin.encerrar-vendas'
  socket.on('admin.encerrar-vendas', () => {
    if (partidaState.status === 'Vendas Abertas') {
      partidaState.status = 'Encerrada';
      console.log('[EVENTO] Vendas encerradas pelo administrador.');

      // Limpa todas as reservas pendentes ao encerrar.
      partidaState.reservas.forEach(reserva => clearTimeout(reserva.timer));
      partidaState.reservas.clear();

      io.emit('partida.encerrada', partidaState);
    }
  });

  // Evento: 'ingresso.reservar'
  socket.on('ingresso.reservar', () => {
    // Valida se a reserva é permitida.
    if (partidaState.status !== 'Vendas Abertas' || partidaState.ingressosDisponiveis <= 0 || partidaState.reservas.has(socket.id)) {
      socket.emit('reserva.falhou', { message: 'Não é possível reservar um ingresso no momento.' });
      return;
    }

    partidaState.ingressosDisponiveis--;
    
    // Inicia um timer para expiração da reserva.
    const timer = setTimeout(() => {
      if (partidaState.reservas.has(socket.id)) {
        partidaState.ingressosDisponiveis++;
        partidaState.reservas.delete(socket.id);
        console.log(`[EXPIRADO] Reserva de ${socket.id} expirou. Ingresso devolvido.`);
        // Notifica todos sobre a devolução do ingresso.
        io.emit('reserva.expirada', partidaState);
      }
    }, TEMPO_EXPIRACAO_RESERVA);

    partidaState.reservas.set(socket.id, { timer });
    console.log(`[RESERVA] Ingresso reservado para: ${socket.id}`);
    
    // Envia confirmação de reserva para o solicitante.
    socket.emit('ingresso.reservado', { success: true, tempoExpiracao: TEMPO_EXPIRACAO_RESERVA / 1000 });
    
    // Atualiza o estado para todos os clientes.
    io.emit('estado.atualizado', partidaState);
  });

  // Evento: 'compra.confirmar'
  socket.on('compra.confirmar', () => {
    const reserva = partidaState.reservas.get(socket.id);
    if (reserva) {
      // Interrompe o timer de expiração.
      clearTimeout(reserva.timer);
      partidaState.reservas.delete(socket.id);
      
      console.log(`[COMPRA] Compra confirmada por: ${socket.id}`);
      
      socket.emit('compra.confirmada', { success: true, message: 'Parabéns! Seu ingresso está garantido.' });
      io.emit('estado.atualizado', partidaState);
    }
  });

  // Evento: 'disconnect'
  socket.on('disconnect', () => {
    console.log(`[DESCONEXÃO] Torcedor desconectado: ${socket.id}`);
    
    // Se o usuário tinha uma reserva, o ingresso é devolvido.
    const reserva = partidaState.reservas.get(socket.id);
    if (reserva) {
      clearTimeout(reserva.timer);
      partidaState.ingressosDisponiveis++;
      partidaState.reservas.delete(socket.id);
      console.log(`[DESCONEXÃO] Reserva de ${socket.id} cancelada. Ingresso devolvido.`);
      
      // Notifica todos os clientes sobre a atualização.
      io.emit('estado.atualizado', partidaState);
    }
  });
});

// --- Inicialização do Servidor ---
const PORT = 4000;
server.listen(PORT, () => console.log(`🏟️  Servidor da bilheteria rodando na porta ${PORT}`));