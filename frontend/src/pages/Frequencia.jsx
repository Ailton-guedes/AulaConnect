
import { useEffect, useState } from 'react';
import apiRequest from '../services/api';

// ==========================================
// FORMATAÇÃO DE DATA
// ==========================================

// Converte YYYY-MM-DD para DD/MM/YYYY
// sem alterar a data por causa do fuso horário
function formatarData(dataISO) {
  if (!dataISO) return '-';

  const [ano, mes, dia] = dataISO.split('-');

  return `${dia}/${mes}/${ano}`;
}


// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

function Frequencia() {

  // Dados recebidos do backend
  const [agendamentos, setAgendamentos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [aulas, setAulas] = useState([]);

  // Filtros da página
  const [busca, setBusca] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState('todos');

  // NOVO: filtros de período
  // Valores vazios significam que não há limite de data
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Controle de carregamento e erros
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');


  // ==========================================
  // BUSCAR DADOS DA API
  // ==========================================

  useEffect(() => {

    let ativo = true;

    async function carregarDados() {

      try {

        setCarregando(true);
        setErro('');

        const [
          dadosAgendamentos,
          dadosAlunos,
          dadosAulas
        ] = await Promise.all([
          apiRequest('/agendamento/'),
          apiRequest('/alunos/'),
          apiRequest('/aulas/')
        ]);

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
  // IDENTIFICAR ALUNOS E AULAS
  // ==========================================

  function obterNomeAluno(idAluno) {

    const aluno = alunos.find(
      (item) => item.id_aluno === idAluno
    );

    return aluno
      ? aluno.nome
      : `Aluno #${idAluno}`;
  }

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
  // SELECIONAR AULAS CONCLUÍDAS
  // ==========================================

  // Aulas agendadas e canceladas não entram
  // no cálculo de frequência.
  const aulasConcluidas = agendamentos.filter(
    (item) => item.status?.toLowerCase() === 'concluido'
  );


  // ==========================================
  // NOVO: FILTRAR PELO PERÍODO E ALUNO
  // ==========================================

  // Como as datas da API estão em YYYY-MM-DD,
  // podemos compará-las diretamente como strings.
  const periodoInvalido =
    dataInicio !== '' &&
    dataFim !== '' &&
    dataInicio > dataFim;

  const registrosDoPeriodo = aulasConcluidas.filter(
    (item) => {

      if (periodoInvalido) return false;

      const correspondeInicio =
        !dataInicio || item.data_aula >= dataInicio;

      const correspondeFim =
        !dataFim || item.data_aula <= dataFim;

      return correspondeInicio && correspondeFim;
    }
  );

  // A busca por aluno também influencia
  // os indicadores e o resumo por aluno.
  const registrosBase = registrosDoPeriodo.filter(
    (item) => {

      const nomeAluno = obterNomeAluno(
        item.id_aluno
      ).toLowerCase();

      return nomeAluno.includes(
        busca.trim().toLowerCase()
      );
    }
  );


  // ==========================================
  // CONTADORES DE FREQUÊNCIA
  // ==========================================

  // NOVO: os contadores consideram o período
  // selecionado e a busca pelo aluno.
  const totalPresentes = registrosBase.filter(
    (item) => item.presenca === 'presente'
  ).length;

  const totalFaltas = registrosBase.filter(
    (item) => item.presenca === 'falta'
  ).length;

  // Aula concluída sem presença registrada
  const totalPendentes = registrosBase.filter(
    (item) => !item.presenca
  ).length;

  // NOVO: percentual geral de frequência
  // Pendentes não entram no denominador.
  const totalRegistrados = totalPresentes + totalFaltas;

  const percentualGeral = totalRegistrados > 0
    ? (totalPresentes / totalRegistrados) * 100
    : null;


  // ==========================================
  // FILTRAR A LISTAGEM
  // ==========================================

  const registrosFiltrados = registrosBase
    .filter((item) => {

      return (
        filtroSituacao === 'todos' ||
        (
          filtroSituacao === 'pendente'
            ? !item.presenca
            : item.presenca === filtroSituacao
        )
      );
    })
    .sort((a, b) => {

      // Ordena da aula mais recente para a mais antiga
      const dataA = `${a.data_aula}T${a.horario_inicio || '00:00:00'}`;
      const dataB = `${b.data_aula}T${b.horario_inicio || '00:00:00'}`;

      return dataB.localeCompare(dataA);
    });


  // ==========================================
  // NOVO: RESUMO DE FREQUÊNCIA POR ALUNO
  // ==========================================

  // Agrupa os registros pelo ID do aluno,
  // evitando misturar alunos com nomes iguais.
  const resumoPorAluno = Object.values(
    registrosBase.reduce((acumulador, item) => {

      const idAluno = item.id_aluno;

      // Cria o registro do aluno na primeira ocorrência
      if (!acumulador[idAluno]) {

        acumulador[idAluno] = {
          id_aluno: idAluno,
          nome: obterNomeAluno(idAluno),
          presentes: 0,
          faltas: 0,
          pendentes: 0
        };
      }

      // Soma a frequência de cada aula
      if (item.presenca === 'presente') {
        acumulador[idAluno].presentes += 1;

      } else if (item.presenca === 'falta') {
        acumulador[idAluno].faltas += 1;

      } else {
        acumulador[idAluno].pendentes += 1;
      }

      return acumulador;

    }, {})
  )
    .map((aluno) => {

      // Apenas aulas com presença ou falta registrada
      // entram no cálculo do percentual.
      const total = aluno.presentes + aluno.faltas;

      return {
        ...aluno,
        percentual: total > 0
          ? (aluno.presentes / total) * 100
          : null
      };
    })
    .sort((a, b) =>
      a.nome.localeCompare(b.nome, 'pt-BR')
    );


  // ==========================================
  // NOVO: LIMPAR TODOS OS FILTROS
  // ==========================================

  function limparFiltros() {
    setBusca('');
    setFiltroSituacao('todos');
    setDataInicio('');
    setDataFim('');
  }


  // ==========================================
  // EXIBIR A INTERFACE
  // ==========================================

  return (
    <section className="pagina-alunos">

      {/* Título da página */}
      <div className="titulo-pagina">

        <h2>Controle de Frequência</h2>

        <p>
          Consulte as presenças, faltas e o percentual
          de frequência dos alunos.
        </p>

      </div>

      <div className="painel-pagina">

        {/* ==================================
            FILTROS DA PÁGINA
            ================================== */}

        <div className="frequencia-filtros">

          {/* Buscar pelo nome do aluno */}
          <input
            type="search"
            placeholder="Buscar aluno..."
            aria-label="Buscar aluno"
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
          />

          {/* Filtrar pela situação */}
          <select
            aria-label="Filtrar situação"
            value={filtroSituacao}
            onChange={(event) =>
              setFiltroSituacao(event.target.value)
            }
          >
            <option value="todos">
              Todas as situações
            </option>

            <option value="presente">
              Presentes
            </option>

            <option value="falta">
              Faltas
            </option>

            <option value="pendente">
              Pendentes
            </option>
          </select>

        </div>

        {/* NOVO: filtro de período */}
        <div className="frequencia-filtros">

          <label className="frequencia-campo-data">
            Data inicial

            <input
              type="date"
              value={dataInicio}
              max={dataFim || undefined}
              onChange={(event) =>
                setDataInicio(event.target.value)
              }
            />
          </label>

          <label className="frequencia-campo-data">
            Data final

            <input
              type="date"
              value={dataFim}
              min={dataInicio || undefined}
              onChange={(event) =>
                setDataFim(event.target.value)
              }
            />
          </label>

          <button
            type="button"
            className="frequencia-limpar"
            onClick={limparFiltros}
          >
            Limpar filtros
          </button>

        </div>

        {/* Validação do intervalo de datas */}
        {periodoInvalido && (
          <p className="mensagem-lista" role="alert">
            A data inicial não pode ser posterior
            à data final.
          </p>
        )}


        {/* ==================================
            INDICADORES DE FREQUÊNCIA
            ================================== */}

        <div className="frequencia-resumo">

          <div className="frequencia-card">
            <span>Presentes</span>
            <strong>{totalPresentes}</strong>
          </div>

          <div className="frequencia-card">
            <span>Faltas</span>
            <strong>{totalFaltas}</strong>
          </div>

          <div className="frequencia-card">
            <span>Pendentes</span>
            <strong>{totalPendentes}</strong>
          </div>

          {/* NOVO: percentual geral */}
          <div className="frequencia-card">
            <span>Frequência geral</span>

            <strong>
              {percentualGeral === null
                ? '—'
                : `${percentualGeral.toFixed(1)}%`}
            </strong>
          </div>

        </div>


        {/* ==================================
            MENSAGENS
            ================================== */}

        {carregando && (
          <p className="mensagem-lista">
            Carregando frequência...
          </p>
        )}

        {erro && (
          <p className="mensagem-lista" role="alert">
            Erro: {erro}
          </p>
        )}


        {/* ==================================
            HISTÓRICO DE FREQUÊNCIA
            ================================== */}

        {!carregando && !erro && (

          <>
            <h3 className="frequencia-subtitulo">
              Histórico de frequência
            </h3>

            <div className="frequencia-tabela-container">

              <table className="frequencia-tabela">

                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Aula</th>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Frequência</th>
                  </tr>
                </thead>

                <tbody>

                  {registrosFiltrados.length === 0 ? (

                    <tr>
                      <td colSpan="5">
                        Nenhum registro encontrado.
                      </td>
                    </tr>

                  ) : (

                    registrosFiltrados.map((item) => (

                      <tr key={item.id_agendamento}>

                        <td>
                          {obterNomeAluno(item.id_aluno)}
                        </td>

                        <td>
                          {obterDescricaoAula(item.id_aula)}
                        </td>

                        <td>
                          {formatarData(item.data_aula)}
                        </td>

                        <td>
                          {item.horario_inicio
                            ? String(item.horario_inicio).slice(0, 5)
                            : '-'}
                        </td>

                        <td>

                          <span
                            className={`frequencia-status ${
                              item.presenca || 'pendente'
                            }`}
                          >
                            {item.presenca === 'presente'
                              ? 'Presente'
                              : item.presenca === 'falta'
                                ? 'Falta'
                                : 'Pendente'}
                          </span>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>


            {/* ==================================
                NOVO: RESUMO POR ALUNO
                ================================== */}

            <h3 className="frequencia-subtitulo">
              Resumo por aluno
            </h3>

            <div className="frequencia-tabela-container">

              <table className="frequencia-tabela">

                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Presenças</th>
                    <th>Faltas</th>
                    <th>Pendentes</th>
                    <th>Frequência (%)</th>
                  </tr>
                </thead>

                <tbody>

                  {resumoPorAluno.length === 0 ? (

                    <tr>
                      <td colSpan="5">
                        Nenhum aluno encontrado no período.
                      </td>
                    </tr>

                  ) : (

                    resumoPorAluno.map((aluno) => (

                      <tr key={aluno.id_aluno}>

                        <td>{aluno.nome}</td>

                        <td>{aluno.presentes}</td>

                        <td>{aluno.faltas}</td>

                        <td>{aluno.pendentes}</td>

                        <td>
                          {aluno.percentual === null
                            ? '—'
                            : `${aluno.percentual.toFixed(1)}%`}
                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </>
        )}

      </div>

    </section>
  );
}

export default Frequencia;
