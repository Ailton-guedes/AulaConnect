import {
  Users,
  CalendarDays,
  Wallet,
  Bell
} from 'lucide-react'

function Inicio() {
  return (
    <section className="resumo">

      <h2>Bem-vinda, Tia Aline!</h2>

      <p>
        Organize seus alunos, aulas e agendamentos.
      </p>

      <div className="indicadores">

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
  )
}

export default Inicio