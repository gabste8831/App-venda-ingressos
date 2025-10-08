import React from 'react';
import { Link } from 'react-router-dom';
import AdminPanel from '../components/AdminPanel';
import { usePartidaSocket } from '../hooks/usePartidaSocket';

// Componente de página para a rota '/admin'.
function PaginaAdmin() {
  // Utiliza o hook customizado para acessar o estado da partida e as funções de evento.
  const { 
    partidaState, 
    iniciarVendas, 
    encerrarVendas
  } = usePartidaSocket();

  // Exibe uma tela de carregamento enquanto o estado inicial não é recebido do backend.
  if (!partidaState) {
    return <div className="loading-screen">Conectando à bilheteria... 🏟️</div>;
  }

  return (
    <div className="App">
       <header className="App-header">
        <h1>Painel do Administrador</h1>
        <p>Controle de Vendas do Jogo</p>
        <nav><Link to="/" className="nav-link">Ir para Página do Torcedor</Link></nav>
      </header>
      <main className="container">
        {/* Renderiza o componente AdminPanel, passando o estado e as funções via props. */}
        <AdminPanel 
          partidaState={partidaState}
          onIniciarVendas={iniciarVendas}
          onEncerrarVendas={encerrarVendas}
        />
      </main>
      <footer className="App-footer">
        <p>Desenvolvido por Gabriel Steffens e Lucas Weigel</p>
      </footer>
    </div>
  );
}

export default PaginaAdmin;