
import './App.css'

function App() {
  return (
    <div className="app">

      {/* Menu lateral */}
      <aside className="menu-lateral">
        <h1 className="logo">AulaConnect</h1>

        <nav>
          <a href="#">Início</a>
          <a href="#">Alunos</a>
          <a href="#">Responsáveis</a>
          <a href="#">Aulas</a>
          <a href="#">Agendamentos</a>
          <a href="#">Pagamentos</a>
          <a href="#">Evoluções</a>
          <a href="#">Notificações</a>
        </nav>
      </aside>

      {/* Área principal */}
      <main className="conteudo-principal">

        {/* Cabeçalho */}
        <header className="cabecalho">
          <div>
          <h2>AulaConnect</h2>
          <p>Gestão de aulas em um só lugar</p>
          </div>
          
                  {/* Pisquisa */}
          <div className="pesquisa">
            <input
              type="search"
              placeholder="Pesquisar..."
              aria-label="Pesquisar no AulaConnect"
         />
        </div>
      </header>

        {/* Conteúdo da página */}
        <section className="resumo">
          <h2>Bem-vindo Tia Aline !</h2>
          <p>
            Organize seus aqui alunos, aulas e agendamentos.
          </p>
        </section>

      </main>

    </div>
  )
}

export default App
