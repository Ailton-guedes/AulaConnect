
import './App.css'

import {
  Users,
  CalendarDays,
  Wallet,
  Bell
} from 'lucide-react'

function App() {
  return (
    <div className="app">

      {/* Menu lateral */}
      <aside className="menu-lateral">
        <h1 className="logo">Personal Kids</h1>

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

          <div className="cabecalho-info">
            <h2>Personal Kids</h2>
            <p>Gestão de aulas em um só lugar</p>
          </div>

          {/* Pesquisa */}
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

          <h2>Bem-vinda, Tia Aline!</h2>

          <p>
            Organize seus alunos, aulas e agendamentos.
          </p>

          {/* Cards com os indicadores do sistema */}
          <div className="indicadores">

            {/* Card de alunos */}
            <article className="card-indicador">
              <div className="card-topo">
                <span className="indicador-titulo">
                  Total de alunos
                </span>
                <Users className="icone-card" />
              </div>

              <strong className="indicador-valor">24</strong>
              <p>Alunos cadastrados</p>
            </article>

            {/* Card de aulas */}
            <article className="card-indicador">
              <div className="card-topo">
                <span className="indicador-titulo">
                  Aulas agendadas
                </span>
                <CalendarDays className="icone-card" />
              </div>

              <strong className="indicador-valor">12</strong>
              <p>Aulas programadas</p>
            </article>

            {/* Card de pagamentos */}
            <article className="card-indicador">
              <div className="card-topo">
                <span className="indicador-titulo">
                  Pagamentos recebidos
                </span>
                <Wallet className="icone-card" />
              </div>

              <strong className="indicador-valor">
                R$ 1.800,00
              </strong>
              <p>Valor demonstrativo</p>
            </article>

            {/* Card de notificações */}
            <article className="card-indicador">
              <div className="card-topo">
                <span className="indicador-titulo">
                  Notificações
                </span>
                <Bell className="icone-card" />
              </div>

              <strong className="indicador-valor">3</strong>
              <p>Notificações pendentes</p>
            </article>

          </div>
        </section>

      </main>
    </div>
  )
}

export default App
