
import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';

import apiRequest from '../services/api';
import Remarcacao from '../components/Remarcacao';

//  CONFIGURAÇÕES DO CALENDÁRIO

// Dias que serão exibidos na agenda
const nomesDias = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

// Formata a data para o padrão brasileiro
// Exemplo: 09/11/2026
function formatarData(data) {
  return data.toLocaleDateString('pt-BR');
}

// Converte uma data JavaScript para YYYY-MM-DD
// Exemplo: 2026-11-09
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

  // JavaScript: domingo = 0, segunda = 1
  // Ajustamos para segunda = 0
  const diaSemana = (inicio.getDay() + 6) % 7;

  inicio.setDate(
    inicio.getDate() - diaSemana
  );

  inicio.setHours(0, 0, 0, 0);

  return inicio;
}


// COMPONENTE PRINCIPAL

function Agendamentos() {

  // Controla qual semana está sendo exibida
  const [inicioSemana, setInicioSemana] = useState(
    () => obterInicioSemana(new Date())
  );

  // Armazena os dados recebidos do backend
  const [agendamentos, setAgendamentos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [aulas, setAulas] = useState([]);

  // Controla carregamento e erros
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Identifica qual aula está sendo atualizada
  const [atualizandoId, setAtualizandoId] = useState(null);
 // Armazena a aula selecionada para remarcação
  const [agendamentoRemarcacao, setAgendamentoRemarcacao] = useState(null);  
  //  BUSCAR DADOS DA API

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setCarregando(true);
        setErro('');

        // Executa as três consultas ao backend
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

        // Armazena os resultados no React
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

  // NAVEGAÇÃO ENTRE SEMANAS

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

  
  //  LOCALIZAR ALUNOS E AULAS

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

  // FILTRAR AGENDAMENTOS POR DIA

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

  // CONCLUIR UMA AULA

  async function concluirAula(agendamento) {

    // Impede concluir novamente uma aula já concluída
    if (
      agendamento.status?.toLowerCase() !== 'agendado'
    ) {
      return;
    }

    // Confirma a operação com o usuário
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

      // Envia os dados atualizados ao FastAPI
      await apiRequest(
        `/agendamento/${agendamento.id_agendamento}`,
        {
          method: 'PUT',
          body: JSON.stringify(dadosAtualizados)
        }
      );

      // Atualiza o status na lista do React
      setAgendamentos((listaAtual) =>
        listaAtual.map((item) =>
          item.id_agendamento === agendamento.id_agendamento
            ? { ...item, status: 'concluido' }
            : item
        )
      );

    } catch (error) {
      setErro(error.message);

    } finally {
      setAtualizandoId(null);
    }
  }
   // CANCELAR UMA AULA
   async function cancelarAula(agendamento) {

    // Permite cancelar somente aulas agendadas
    if (
      agendamento.status?.toLowerCase() !== 'agendado'
    ){
      return;
    }

    // Solicita confirmação ao professor
    const confirmar = window.confirm(
      'Deseja realmete cancelar esta aula?'
    );

    if (!confirmar) return;

    // Limpa mensagens anteriores
    setErro('');

    // Identifica qual agendamento está sendo atualizado
    setAtualizandoId(agendamento.id_agendamento);

    // Mantém os dados originais e altera apenas o status
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
      await apiRequest(
        `/agendamento/${agendamento.id_agendamento}`,
        {
          method:'PUT',
          body: JSON.stringify(dadosAtualizados)
        }
      );

      // Atualiza p status na tela sem ecarregar
      setAgendamentos((listaAtual) =>
        listaAtual.map((item) =>
          item.id_agendamento === agendamento.id_agendamento
            ?{ ...item, status: 'cancelado'}
            : item
        )
      );
    } catch (error) {
      // Mostra o erro caso a API não consiga atualizar
      setErro(error.message);

    } finally{
      // libera os botões após a operação
      setAtualizandoId(null);
    }
   }

 // Abre o formulário da aula selecionada
function abrirRemarcacao(agendamento) {

  if (agendamento.status?.toLowerCase() !== 'agendado') {
    return;
  }

  setErro('');
  setAgendamentoRemarcacao(agendamento);
}

  // EXIBIR A INTERFACE
  
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

          {/* Botões para navegar pelas semanas */}
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
              onClick={() => setInicioSemana(
                obterInicioSemana(new Date())
              )}
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
      {/* Exibe o formulário quando uma aula é selecionada */}
        {agendamentoRemarcacao && (
          <Remarcacao
            key={agendamentoRemarcacao.id_agendamento}
            agendamento={agendamentoRemarcacao}
            nomeAluno={obterNomeAluno(agendamentoRemarcacao.id_aluno)}
            aoFechar={() => setAgendamentoRemarcacao(null)}
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
                  {/* Quantidade total de aulas do dia */}
                    <span className="agenda-total-aulas">
                      {`${agendamentosDia.length} ${agendamentosDia.length === 1 ? 'aula' : 'aulas'}`}
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

                            {/* Status da aula com cor correspondente*/}
                            <span 
                            className={`agenda-aula-status status-${agendamento.status?.toLowerCase()}`}
                            >
                              {agendamento.status}
                            </span>

                          
                          {/* Botões disponíveis para aulas agendadas */}
                          {agendamento.status?.toLowerCase() === 'agendado' && (

                          <div className="agenda-acoes">

                          {/* Botão para concluir a aula */}
                          <button
                            type="button"
                            className="botao-concluir-aula"
                            disabled={atualizandoId !== null}
                            onClick={() => concluirAula(agendamento)}
                                >
                            {atualizandoId === agendamento.id_agendamento
                            ? 'Salvando...'
                            : 'Concluir aula'}
                          </button>

                          {/* Botão para cancelar a aula */}
                          <button
                          type="button"
                          className="botao-cancelar-aula"
                          disabled={atualizandoId !== null}
                          onClick={() => cancelarAula(agendamento)}
                            >
                          {atualizandoId === agendamento.id_agendamento
                          ? 'Salvando...'
                            : 'Cancelar aula'}
                          </button>
                          {/* Botão para remarcar aula */}
                          <button
                          type="button"
                          className="botao-remarcar-aula"
                          disabled={atualizandoId !== null}
                          onClick={() => abrirRemarcacao(agendamento)}
                          >
                            Remarcar aula
                          </button>
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
