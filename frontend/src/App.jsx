import  './App.css'

import MenuLateral from './components/MenuLateral'
import Cabecalho from './components/Cabecalho'

import Inicio from './pages/Inicio'

function App() {
  return (
    <div className='app'>

      {/* Menu lateral */}
      <MenuLateral />
      {/* Menu lateral */}
      <main className='conteudo-principal'>

        {/* Cabeçalho */}
        <Cabecalho />

        {/* Página inicial */}
        <Inicio />

      </main>
    </div>
  )
}

export default App