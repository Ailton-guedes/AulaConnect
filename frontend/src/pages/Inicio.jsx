// Recursos do React para armazenar e carregar dados
import { useEffect, useState } from 'react';

// Serviço responsável pela comunicação com o FastAPI
import apiRequest from '../services/api';

import {
  Users,
  CalendarDays,
  Wallet,
  Bell
} from 'lucide-react'

function Inicio() {

  // Armazena os dados reais do painel
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [aulasAgendadas, setAulasAgendadas] = useState(0);
  const [pagamentosRecebidos, setPagamentosRecebidos] = useState(0);
  const [notificacoesPendentes, setNotificacoesPendentes] = useState(0);

  // Controla o carregamento e possíveis erros
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

// Carrega os indicadores ao abrir a página
useEffect(() => {

  async function carregarIndicadores() {

    try {

      setCarregando(true);
      setErro('');

      // Consulta os dados reais cadastrados no MySQL
const [
  alunos,
  agendamentos,
  pagamentos,
  notificacoes
] = await Promise.all([
  apiRequest('/alunos/'),
  apiRequest('/agendamento/'),
  apiRequest('/pagamentos/'),
  apiRequest('/notificacoes/')
]);

      // Total de alunos cadastrados
      setTotalAlunos(alunos.length);

      // Total de agendamentos cadastrados
      setAulasAgendadas(agendamentos.length);

      // Soma somente os pagamentos confirmados
      const totalRecebido = pagamentos
        .filter((pagamento) =>
          pagamento.status?.toLowerCase() === 'pago'
        )
        .reduce((total, pagamento) =>
          total + Number(pagamento.valor), 0
        );

      setPagamentosRecebidos(totalRecebido);

      // Conta somente notificações não lidas
      const totalPendentes = notificacoes.filter(
        (notificacao) => !notificacao.lida
      ).length;

      setNotificacoesPendentes(totalPendentes);

    } catch (error) {

      console.error('Erro ao carregar indicadores:', error);
      setErro('Não foi possível carregar os indicadores.');

    } finally {

      setCarregando(false);

    }
  }

  carregarIndicadores();

}, []);

  return (
    <section className="resumo">

      <h2>Bem-vinda, Tia Aline!</h2>

      <p>
        Organize seus alunos, aulas e agendamentos.
      </p>
{/* Informa quando os dados estão sendo carregados */}
{carregando && (
  <p>Carregando indicadores...</p>
)}

{/* Exibe erros de comunicação com o FastAPI */}
{erro && (
  <p className="mensagem-lista">{erro}</p>
)}
      <div className="indicadores">

        <article className="card-indicador">
          <div className="card-topo">
            <span className="indicador-titulo">
              Total de alunos
            </span>
            <Users className="icone-card" />
          </div>

          <strong className="indicador-valor">
  {totalAlunos}
</strong>
          <p>Alunos cadastrados</p>
        </article>

        <article className="card-indicador">
          <div className="card-topo">
            <span className="indicador-titulo">
              Aulas agendadas
            </span>
            <CalendarDays className="icone-card" />
          </div>

         <strong className="indicador-valor">
  {aulasAgendadas}
</strong>
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
  {pagamentosRecebidos.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })}
</strong>
         <p>Total de pagamentos confirmados</p>
        </article>

        <article className="card-indicador">
          <div className="card-topo">
            <span className="indicador-titulo">
              Notificações
            </span>
            <Bell className="icone-card" />
          </div>

          <strong className="indicador-valor">
  {notificacoesPendentes}
</strong>
          <p>Notificações pendentes</p>
        </article>

      </div>
    </section>
  )
}

export default Inicio