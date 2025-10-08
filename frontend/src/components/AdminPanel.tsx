import React from 'react';
import { PartidaState } from '../hooks/usePartidaSocket';

// Define as props que o componente recebe.
interface AdminPanelProps {
  partidaState: PartidaState;
  onIniciarVendas: () => void;
  onEncerrarVendas: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  partidaState, 
  onIniciarVendas, 
  onEncerrarVendas 
}) => {
  return (
    <div className="admin-panel">
      <h3>Painel do Administrador</h3>
      
      {/* Exibe a contagem de ingressos em tempo real. */}
      <div className="info-box">
        <p className="ingressos">
          Ingressos Disponíveis: <strong>{partidaState.ingressosDisponiveis} / {partidaState.totalIngressos}</strong>
        </p>
      </div>

      {/* Renderização condicional dos botões de ação com base no status da partida. */}
      <div className="action-box">
        {partidaState.status === 'Aguardando' && (
          <button onClick={onIniciarVendas} className="admin-button start">
            ABRIR VENDAS DE INGRESSOS
          </button>
        )}

        {partidaState.status === 'Vendas Abertas' && (
          <button onClick={onEncerrarVendas} className="admin-button end">
            ENCERRAR VENDAS
          </button>
        )}

        {partidaState.status === 'Encerrada' && (
          <p>As vendas para esta partida foram encerradas.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;