import React from 'react';
import { Link } from 'react-router-dom';
import TorcedorPanel from '../components/TorcedorPanel';
import { usePartidaSocket } from '../hooks/usePartidaSocket';

// Componente de página para a rota principal '/'.
function PaginaTorcedor() {
  // Utiliza o hook customizado para gerenciar a lógica de eventos do torcedor.
  const { 
    partidaState, 
    reservaStatus, 
    reservarIngresso, 
    confirmarCompra 
  } = usePartidaSocket();

  // Exibe uma tela de carregamento até que o estado inicial seja recebido.
  if (!partidaState) {
    return <div className="loading-screen">Conectando à bilheteria... 🏟️</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Venda de Ingressos</h1>
        <p>Barcelona X Real Madrid</p>
        <nav><Link to="/admin" className="nav-link">Ir para Painel Admin</Link></nav>
      </header>
      <main className="container">
        {/* Renderiza o componente TorcedorPanel, passando o estado e as funções via props. */}
        <TorcedorPanel 
          partidaState={partidaState}
          reservaStatus={reservaStatus}
          onReservarIngresso={reservarIngresso}
          onConfirmarCompra={confirmarCompra}
        />
      </main>
      <footer className="App-footer">
        <p>Desenvolvido por Gabriel Steffens e Lucas Weigel</p>
      </footer>
    </div>
  );
}

export default PaginaTorcedor;