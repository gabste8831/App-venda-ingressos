import React, { useState, useEffect } from 'react';
import { PartidaState, ReservaStatus } from '../hooks/usePartidaSocket';

interface TorcedorPanelProps {
  partidaState: PartidaState;
  reservaStatus: ReservaStatus | null;
  onReservarIngresso: () => void;
  onConfirmarCompra: () => void;
}

const TorcedorPanel: React.FC<TorcedorPanelProps> = ({ partidaState, reservaStatus, onReservarIngresso, onConfirmarCompra }) => {
  // Estados locais para controlar a UI de reserva.
  const [reservaAtiva, setReservaAtiva] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Efeito para gerenciar o timer da reserva de ingresso.
  // É acionado sempre que 'reservaStatus' muda.
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // Se a reserva foi bem-sucedida, inicia o contador regressivo.
    if (reservaStatus?.success && reservaStatus.tempoExpiracao) {
      setReservaAtiva(true);
      setCountdown(reservaStatus.tempoExpiracao);

      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            setReservaAtiva(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Limpa o estado visual se a compra for confirmada ou a reserva expirar.
    if(reservaStatus?.message?.includes('Parabéns') || reservaStatus?.message?.includes('expirou')) {
        setReservaAtiva(false);
        setCountdown(null);
    }

    // Função de limpeza do useEffect para remover o timer e evitar memory leaks.
    return () => clearInterval(timer);
  }, [reservaStatus]);


  // Função auxiliar para renderizar a mensagem de status da partida.
  const renderStatusMessage = () => {
    switch (partidaState.status) {
      case 'Aguardando':
        return <p className="status-aguardando">As vendas começarão em breve!</p>;
      case 'Encerrada':
        return <p className="status-encerrada">Vendas Encerradas!</p>;
      case 'Vendas Abertas':
        if (partidaState.ingressosDisponiveis > 0) {
          return <p className="status-abertas">Vendas Abertas! Garanta seu ingresso!</p>;
        } else {
          return <p className="status-esgotado">Ingressos Esgotados!</p>;
        }
      default:
        return null;
    }
  };

  return (
    <div className="torcedor-panel">
      <h2>Área do Torcedor</h2>
      <div className="info-box">
        {renderStatusMessage()}
        <p className="ingressos">
          Ingressos Disponíveis: <strong>{partidaState.ingressosDisponiveis} / {partidaState.totalIngressos}</strong>
        </p>
      </div>

      {/* Exibe os botões de ação somente se as vendas estiverem abertas e houver ingressos. */}
      {partidaState.status === 'Vendas Abertas' && partidaState.ingressosDisponiveis > 0 && (
        <div className="action-box">
          {!reservaAtiva ? (
            <button onClick={onReservarIngresso} className="torcedor-button reservar">
              RESERVAR INGRESSO
            </button>
          ) : (
            <>
              <button onClick={onConfirmarCompra} className="torcedor-button confirmar">
                CONFIRMAR COMPRA
              </button>
              {countdown !== null && (
                <p className="countdown">Sua reserva expira em: {countdown}s</p>
              )}
            </>
          )}
        </div>
      )}

      {/* Exibe mensagens de feedback recebidas do servidor. */}
      {reservaStatus?.message && <p className="feedback">{reservaStatus.message}</p>}
    </div>
  );
};

export default TorcedorPanel;