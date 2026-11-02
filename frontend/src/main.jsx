import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'

// Estilos gerais do sistema
import './styles/global.css';
// Estilos da estrutura principal
import './styles/layout.css';
// Estilos compartilhados entre as páginas
import './styles/paginas.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>,
)
