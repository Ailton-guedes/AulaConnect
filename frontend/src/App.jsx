import { Routes, Route } from 'react-router-dom'

import MenuLateral from './components/MenuLateral'
import Cabecalho from './components/Cabecalho'
import Alunos from './pages/Alunos'
import Aulas from './pages/Aulas'
import Agendamentos from './pages/Agendamentos'

import Inicio from './pages/Inicio'
import Responsaveis from './pages/Responsaveis'

function App() {
  return (
    <div className='app'>

      {/* Menu lateral */}
      <MenuLateral />
      {/* Menu lateral */}
      <main className='conteudo-principal'>

        {/* Cabeçalho */}
        <Cabecalho />

        {/* Área onde as páginas serão exibidas */}
        <Routes>
          <Route path="/" element={<Inicio/>} />  {/* Página inicial */}
          <Route path= "/alunos" element={<Alunos />} /> {/* Página de alunos */}
          <Route path="/responsaveis" element={<Responsaveis />} /> {/* Página de responsáveis */}
          <Route path="/aulas" element={<Aulas />} />
          <Route path="/agendamentos" element={<Agendamentos />} /> {/* Página de agendamentos */}

        </Routes>

      </main>
    </div>
  )
}

export default App