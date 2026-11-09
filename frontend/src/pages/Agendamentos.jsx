
import { useEffect, useState } from 'react';

import {
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';

import apiRequest from '../services/api';
import Remarcacao from '../components/Remarcacao';


// ==========================================
// CONFIGURAÇÕES DO CALENDÁRIO
// ==========================================

// Dias exibidos na agenda
const nomesDias = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

// Formata a data para o padrão brasileiro
function formatarData(data) {
  return data.toLocaleDateString('pt-BR');
}

// Converte uma data JavaScript para YYYY-MM-DD
function dataParaISO(data) {
  const ano = data.getFullYear();

  const mes = String(
    data.getMonth() + 1
  ).padStart(2, '0');

  const dia = String(
    data.getDate()
  ).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

// Encontra a segunda-feira da semana informada
function obterInicioSemana(data) {
  const inicio = new Date(data);

  // Domingo = 0, segunda = 1
  const diaSemana = (inicio.getDay() + 6) % 7;

  inicio.setDate(
    inicio.getDate() - diaSemana
  );

  inicio.setHours(0, 0, 0, 0);

  return inicio;
}


// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

function Agendamentos() {

  // Controla a semana exibida
  const [inicioSemana, setInicioSemana] = useState(
    () => obterInicioSemana(new Date())
  );

  // Dados recebidos do backend
  const [agendamentos, setAgendamentos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [aulas, setAulas] = useState([]);

  // Controla carregamento e mensagens de erro
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Identifica qual aula está sendo atualizada
  const [atualizandoId, setAtualizandoId] = useState(null);

  // Armazena a aula selecionada para remarcação
  const [
    agendamentoRemarcacao,
    setAgendamentoRemarcacao
  ] = useState(null);


  // ==========================================
  // BUSCAR DADOS DA API
  // ==========================================

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setCarregando(true);
        setErro('');

        // Consulta agendamentos, alunos e aulas
        const [
          dadosAgendamentos,
          dadosAlunos,
          dadosAulas
        ] = await Promise.all([
          apiRequest('/agendamento/'),
          apiRequest('/alunos/'),
          apiRequest('/aulas/')
        ]);

        // Evita atualizar um componente desmontado
        if (!ativo) return;

        setAgendamentos(dadosAgendamentos);
        setAlunos(dadosAlunos);
        setAulas(dadosAulas);

      } catch (error) {
        if (ativo) {
          setErro(error.message);
        }

      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };

  }, []);


  // ==========================================
  // NAVEGAÇÃO ENTRE SEMANAS
  // ==========================================

  function mudarSemana(dias) {
    setInicioSemana((semanaAtual) => {
      const novaSemana = new Date(semanaAtual);

      novaSemana.setDate(
        novaSemana.getDate() + dias
      );

      return novaSemana;
    });
  }

  // Cria os seis dias da semana selecionada
  const diasSemana = Array.from(
    { length: 6 },
    (_, indice) => {
      const data = new Date(inicioSemana);

      data.setDate(
        data.getDate() + indice
      );

      return data;
    }
  );

  // Sábado é o último dia exibido
  const fimSemana = diasSemana[5];


  // ==========================================
  // LOCALIZAR ALUNOS E AULAS
  // ==========================================

  // Procura o nome do aluno pelo ID
  function obterNomeAluno(idAluno) {
    const aluno = alunos.find(
      (item) => item.id_aluno === idAluno
    );

    return aluno
      ? aluno.nome
      : `Aluno #${idAluno}`;
  }

  // Procura a descrição da aula pelo ID
  function obterDescricaoAula(idAula) {
    if (idAula == null) {
      return 'Aula não informada';
    }

    const aula = aulas.find(
      (item) => item.id_aula === idAula
    );

    return aula
      ? aula.descricao
      : `Aula #${idAula}`;
  }


  // ==========================================
  // FILTRAR AGENDAMENTOS POR DIA
  // ==========================================

  function agendamentosDoDia(data) {
    const dataISO = dataParaISO(data);

    return agendamentos
      .filter(
        (item) => item.data_aula === dataISO
      )
      .sort((a, b) =>
        (a.horario_inicio || '').localeCompare(
          b.horario_inicio || ''
        )
      );
  }


  // ==========================================
  // CONCLUIR UMA AULA
  // ==========================================

  async function concluirAula(agendamento) {

    // Somente aulas agendadas podem ser concluídas
    if (
      agendamento.status?.toLowerCase() !== 'agendado'
    ) {
      return;
    }

    if (atualizandoId !== null) return;

    const confirmar = window.confirm(
      'Deseja marcar esta aula como concluída?'
    );

    if (!confirmar) return;

    setErro('');
    setAtualizandoId(agendamento.id_agendamento);

    // Mantém os dados originais e altera o status
    const dadosAtualizados = {
      id_aluno: agendamento.id_aluno,
      id_aula: agendamento.id_aula,
      id_contrato: agendamento.id_contrato,
      data_aula: agendamento.data_aula,
      horario_inicio: agendamento.horario_inicio,
      tipo_agendamento: agendamento.tipo_agendamento,
      status: 'concluido'
    };

    try {
      // Envia os dados ao FastAPI
      const agendamentoAtualizado = await apiRequest(
        `/agendamento/${agendamento.id_agendamento}`,
        {
          method: 'PUT',
          body: JSON.stringify(dadosAtualizados)
        }
      );

      // Atualiza a lista sem recarregar
      setAgendamentos((listaAtual) =>
        listaAtual.map((item) =>
          item.id_agendamento === agendamento.id_agendamento
            ? agendamentoAtualizado
            : item
        )
      );

    } catch (error) {
      setErro(error.message);

    } finally {
      setAtualizandoId(null);
    }
  }


  // ==========================================
  // CANCELAR UMA AULA
  // ==========================================

  async function cancelarAula(agendamento) {

    // Somente aulas agendadas podem ser canceladas
    if (
      agendamento.status?.toLowerCase() !== 'agendado'
    ) {
      return;
    }

    if (atualizandoId !== null) return;

    const confirmar = window.confirm(
      'Deseja realmente cancelar esta aula?'
    );

    if (!confirmar) return;

    setErro('');
    setAtualizandoId(agendamento.id_agendamento);

    const dadosAtualizados = {
      id_aluno: agendamento.id_aluno,
      id_aula: agendamento.id_aula,
      id_contrato: agendamento.id_contrato,
      data_aula: agendamento.data_aula,
      horario_inicio: agendamento.horario_inicio,
      tipo_agendamento: agendamento.tipo_agendamento,
      status: 'cancelado'
    };

    try {
      // Envia a atualização para o backend
      const agendamentoAtualizado = await apiRequest(
        `/agendamento/${agendamento.id_agendamento}`,
        {
          method: 'PUT',
          body: JSON.stringify(dadosAtualizados)
        }
      );

      // Atualiza a lista sem recarregar
      setAgendamentos((listaAtual) =>
        listaAtual.map((item) =>
          item.id_agendamento === agendamento.id_agendamento
            ? agendamentoAtualizado
            : item
        )
      );

    } catch (error) {
      setErro(error.message);

    } finally {
      setAtualizandoId(null);
    }
  }


  // ==========================================
  // REMARCAR UMA AULA
  // ==========================================

  // Abre o formulário da aula selecionada
  function abrirRemarcacao(agendamento) {

    if (
      agendamento.status?.toLowerCase() !== 'agendado'
    ) {
      return;
    }

    setErro('');
    setAgendamentoRemarcacao(agendamento);
  }

  // Salva a nova data e o horário da aula
  async function salvarRemarcacao(novaData, novoHorario) {

    const agendamento = agendamentoRemarcacao;

    if (!agendamento || atualizandoId !== null) {
      return;
    }

    setErro('');
    setAtualizandoId(agendamento.id_agendamento);

    const dadosAtualizados = {
      id_aluno: agendamento.id_aluno,
      id_aula: agendamento.id_aula,
      id_contrato: agendamento.id_contrato,
      data_aula: novaData,
      horario_inicio: novoHorario,
      tipo_agendamento: agendamento.tipo_agendamento,
      status: agendamento.status
    };

    try {
      // Envia a remarcação ao FastAPI
      const agendamentoAtualizado = await apiRequest(
        `/agendamento/${agendamento.id_agendamento}`,
        {
          method: 'PUT',
          body: JSON.stringify(dadosAtualizados)
        }
      );

      // Atualiza a lista sem recarregar
      setAgendamentos((listaAtual) =>
        listaAtual.map((item) =>
          item.id_agendamento === agendamento.id_agendamento
            ? agendamentoAtualizado
            : item
        )
      );

      // Fecha o formulário após salvar
      setAgendamentoRemarcacao(null);

    } catch (error) {
      setErro(error.message);

    } finally {
      setAtualizandoId(null);
    }
  }


  // ==========================================
  // NOVO AJUSTE 1: REGISTRAR PRESENÇA OU FALTA
  // ==========================================

  async function registrarPresenca(agendamento, presenca) {

    // Permite registrar frequência apenas
    // quando a aula estiver concluída
    if (
      agendamento.status?.toLowerCase() !== 'concluido'
    ) {
      return;
    }

    // Evita atualizações simultâneas
    if (atualizandoId !== null) {
      return;
    }

    // Não envia uma atualização desnecessária
    if (agendamento.presenca === presenca) {
      return;
    }

    setErro('');
    setAtualizandoId(agendamento.id_agendamento);

    try {
      // NOVO: envia apenas a frequência para o FastAPI
      const agendamentoAtualizado = await apiRequest(
        `/agendamento/${agendamento.id_agendamento}/presenca`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            presenca: presenca
          })
        }
      );

      // NOVO: atualiza a frequência na tela
      // sem precisar recarregar a página
      setAgendamentos((listaAtual) =>
        listaAtual.map((item) =>
          item.id_agendamento === agendamento.id_agendamento
            ? agendamentoAtualizado
            : item
        )
      );

    } catch (error) {
      // Exibe erros retornados pela API
      setErro(error.message);

    } finally {
      // Libera os botões após a atualização
      setAtualizandoId(null);
    }
  }


  // ==========================================
  // EXIBIR A INTERFACE
  // ==========================================

  return (
    <section className="pagina-alunos">

      {/* Título da página */}
      <div className="titulo-pagina">
        <h2>Agenda de Aulas</h2>

        <p>
          Visualize e gerencie os agendamentos
          semanais dos alunos.
        </p>
      </div>

      {/* Painel principal */}
      <div className="painel-pagina">

        {/* Cabeçalho da agenda */}
        <div className="agenda-cabecalho">

          <div className="agenda-periodo">
            <CalendarDays size={22} />

            <h3>
              {formatarData(inicioSemana)}
              {' até '}
              {formatarData(fimSemana)}
            </h3>
          </div>

          {/* Navegação entre semanas */}
          <div className="agenda-navegacao">

            <button
              type="button"
              onClick={() => mudarSemana(-7)}
              aria-label="Semana anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() =>
                setInicioSemana(
                  obterInicioSemana(new Date())
                )
              }
            >
              Hoje
            </button>

            <button
              type="button"
              onClick={() => mudarSemana(7)}
              aria-label="Próxima semana"
            >
              <ChevronRight size={20} />
            </button>

          </div>
        </div>

        {/* Mensagens de carregamento e erro */}
        {carregando && (
          <p className="mensagem-lista">
            Carregando agendamentos...
          </p>
        )}

        {erro && (
          <p className="mensagem-lista" role="alert">
            Erro: {erro}
          </p>
        )}

        {/* Formulário de remarcação */}
        {agendamentoRemarcacao && (
          <Remarcacao
            key={agendamentoRemarcacao.id_agendamento}
            agendamento={agendamentoRemarcacao}
            nomeAluno={obterNomeAluno(
              agendamentoRemarcacao.id_aluno
            )}
            aoFechar={() =>
              setAgendamentoRemarcacao(null)
            }
            aoSalvar={salvarRemarcacao}
            salvando={atualizandoId !== null}
          />
        )}

        {/* Grade dos seis dias */}
        {!carregando && (
          <div className="agenda-grade">

            {diasSemana.map((data, indice) => {

              const agendamentosDia =
                agendamentosDoDia(data);

              return (
                <div
                  className="agenda-dia"
                  key={dataParaISO(data)}
                >

                  {/* Cabeçalho de cada dia */}
                  <div className="agenda-dia-cabecalho">

                    <strong>
                      {nomesDias[indice]}
                    </strong>

                    <span>
                      {formatarData(data)}
                    </span>

                    {/* Quantidade de aulas do dia */}
                    <span className="agenda-total-aulas">
                      {`${agendamentosDia.length} ${
                        agendamentosDia.length === 1
                          ? 'aula'
                          : 'aulas'
                      }`}
                    </span>

                  </div>

                  {/* Aulas cadastradas no dia */}
                  <div className="agenda-dia-conteudo">

                    {agendamentosDia.length === 0 ? (

                      <p>Nenhuma aula agendada</p>

                    ) : (

                      agendamentosDia.map(
                        (agendamento) => (

                          <div
                            className="agenda-aula"
                            key={agendamento.id_agendamento}
                          >

                            {/* Horário da aula */}
                            <strong className="agenda-aula-horario">
                              {agendamento.horario_inicio
                                ? String(
                                    agendamento.horario_inicio
                                  ).slice(0, 5)
                                : 'Horário não informado'}
                            </strong>

                            {/* Nome do aluno */}
                            <p>
                              {obterNomeAluno(
                                agendamento.id_aluno
                              )}
                            </p>

                            {/* Descrição da aula */}
                            <span className="agenda-aula-descricao">
                              {obterDescricaoAula(
                                agendamento.id_aula
                              )}
                            </span>

                            {/* Status da aula */}
                            <span
                              className={`agenda-aula-status status-${
                                agendamento.status?.toLowerCase()
                              }`}
                            >
                              {agendamento.status}
                            </span>

                            {/* ==================================
                                AÇÕES PARA AULAS AGENDADAS
                                ================================== */}

                            {agendamento.status?.toLowerCase() ===
                              'agendado' && (

                              <div className="agenda-acoes">

                                {/* Concluir aula */}
                                <button
                                  type="button"
                                  className="botao-concluir-aula"
                                  disabled={atualizandoId !== null}
                                  onClick={() =>
                                    concluirAula(agendamento)
                                  }
                                >
                                  {atualizandoId ===
                                    agendamento.id_agendamento
                                    ? 'Salvando...'
                                    : 'Concluir aula'}
                                </button>

                                {/* Cancelar aula */}
                                <button
                                  type="button"
                                  className="botao-cancelar-aula"
                                  disabled={atualizandoId !== null}
                                  onClick={() =>
                                    cancelarAula(agendamento)
                                  }
                                >
                                  {atualizandoId ===
                                    agendamento.id_agendamento
                                    ? 'Salvando...'
                                    : 'Cancelar aula'}
                                </button>

                                {/* Remarcar aula */}
                                <button
                                  type="button"
                                  className="botao-remarcar-aula"
                                  disabled={atualizandoId !== null}
                                  onClick={() =>
                                    abrirRemarcacao(agendamento)
                                  }
                                >
                                  Remarcar aula
                                </button>

                              </div>
                            )}


                            {/* ==================================
                                NOVO AJUSTE 2:
                                CONTROLE DE FREQUÊNCIA
                                ================================== */}

                            {/* Botões aparecem somente
                                em aulas concluídas */}

                            {agendamento.status?.toLowerCase() ===
                              'concluido' && (

                              <div className="agenda-acoes">

                                {/* Registrar presença */}
                                <button
                                  type="button"
                                  className="botao-concluir-aula"
                                  disabled={
                                    atualizandoId !== null ||
                                    agendamento.presenca === 'presente'
                                  }
                                  onClick={() =>
                                    registrarPresenca(
                                      agendamento,
                                      'presente'
                                    )
                                  }
                                >
                                  {atualizandoId ===
                                    agendamento.id_agendamento
                                    ? 'Salvando...'
                                    : 'Presente'}
                                </button>

                                {/* Registrar falta */}
                                <button
                                  type="button"
                                  className="botao-cancelar-aula"
                                  disabled={
                                    atualizandoId !== null ||
                                    agendamento.presenca === 'falta'
                                  }
                                  onClick={() =>
                                    registrarPresenca(
                                      agendamento,
                                      'falta'
                                    )
                                  }
                                >
                                  Falta
                                </button>

                                {/* NOVO AJUSTE 3:
                                    Mostra a frequência salva */}

                                {agendamento.presenca && (
                                  <span className="agenda-aula-descricao">
                                    Frequência:{' '}
                                    {agendamento.presenca === 'presente'
                                      ? 'Presente'
                                      : 'Falta'}
                                  </span>
                                )}

                              </div>
                            )}

                          </div>
                        )
                      )
                    )}

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </section>
  );
}

export default Agendamentos;
