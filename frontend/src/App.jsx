
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
          <div className='cabecalho-info'>
          <h2>Personal Kids</h2>
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
          <h2>Bem-vinda Tia Aline !</h2>
          <p>
            Organize seus alunos, aulas e agendamentos.
          </p>
            {/* Cards com os indicadores do sistema */}
        <div className='indicadores'>
          <article className='card-indicador'>
            <span className='indicador-titulo'> Total de alunos</span>
            <strong className='indicador-valor'>24</strong>
            <p>Alunos cadastraos</p>
          </article>

          <article className='card-indicador'>
            <span className='indicador-titulo'>Aulas agendadas</span>
            <strong className='indicador-valor'>12</strong>
            <p>Aulas programadas</p>
          </article>

          <article className='card-indicador'>
            <span className='indicador-titulo'>Pagamentos recebidos</span>
            <strong className='indicador-valor'>1.800,00</strong>
            <p>Valor demostrativo</p>
          </article>

          <article className='card-indicador'>
            <span className='indicador-titulo'>Notificações</span>
            <strong className='indicador-valor'>3</strong>
            <p>Notificações pendentes</p>
          </article>

        </div>
        </section>

      </main>

    </div>
  )
}

export default App
