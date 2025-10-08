import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Interfaces para tipagem do estado e dos eventos.
export interface PartidaState {
  status: 'Aguardando' | 'Vendas Abertas' | 'Encerrada';
  totalIngressos: number;
  ingressosDisponiveis: number;
  reservas: any;
}

export interface ReservaStatus {
  success: boolean;
  tempoExpiracao?: number;
  message?: string;
}

// Hook customizado para gerenciar a comunicação via Socket.IO.
export const usePartidaSocket = () => {
  const [partidaState, setPartidaState] = useState<PartidaState | null>(null);
  const [reservaStatus, setReservaStatus] = useState<ReservaStatus | null>(null);
  
  // Ref para manter a instância do socket persistente entre renderizações.
  const socketRef = useRef<Socket | null>(null);

  // Efeito para conectar e registrar os ouvintes de eventos do socket.
  useEffect(() => {
    socketRef.current = io('http://localhost:4000');
    const socket = socketRef.current;

    // Listeners (socket.on) para eventos recebidos do servidor.
    socket.on('estado.atualizado', (novoEstado: PartidaState) => setPartidaState(novoEstado));
    socket.on('partida.aberta', (novoEstado: PartidaState) => {
      setPartidaState(novoEstado);
      setReservaStatus({ success: true, message: 'As vendas foram abertas!' });
    });
    socket.on('partida.encerrada', (novoEstado: PartidaState) => {
      setPartidaState(novoEstado);
      setReservaStatus({ success: false, message: 'As vendas foram encerradas.' });
    });
    socket.on('ingresso.reservado', (status: ReservaStatus) => setReservaStatus(status));
    socket.on('compra.confirmada', (status: ReservaStatus) => setReservaStatus(status));
    socket.on('reserva.expirada', (novoEstado: PartidaState) => {
      setPartidaState(novoEstado);
      setReservaStatus({ success: false, message: 'Sua reserva expirou!' });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const iniciarVendas = () => socketRef.current?.emit('admin.iniciar-vendas');
  const encerrarVendas = () => socketRef.current?.emit('admin.encerrar-vendas');
  const reservarIngresso = () => socketRef.current?.emit('ingresso.reservar');
  const confirmarCompra = () => socketRef.current?.emit('compra.confirmar');

  return { 
    partidaState, 
    reservaStatus, 
    iniciarVendas, 
    encerrarVendas, 
    reservarIngresso, 
    confirmarCompra 
  };
};