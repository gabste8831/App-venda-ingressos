import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PaginaTorcedor from './pages/PaginaTorcedor';
import PaginaAdmin from './pages/PaginaAdmin';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* rotas raiz */}
        <Route path="/" element={<PaginaTorcedor />} />
        <Route path="/admin" element={<PaginaAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;