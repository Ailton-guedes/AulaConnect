
import { useEffect, useState } from 'react';
import apiRequest from '../services/api';

// ==========================================
// FORMATAÇÃO DE DATA
// ==========================================

// Converte YYYY-MM-DD para DD/MM/YYYY
// sem alterar o dia por causa do fuso horário
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

        // Consulta as três rotas existentes
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

  // Apenas aulas concluídas entram no
  // controle de frequência.
  //
  // Aulas canceladas ou ainda agendadas
  // não são consideradas faltas.

  const aulasConcluidas = agendamentos.filter(
    (item) => item.status?.toLowerCase() === 'concluido'
  );


  // ==========================================
  // CONTADORES DE FREQUÊNCIA
  // ==========================================

  const totalPresentes = aulasConcluidas.filter(
    (item) => item.presenca === 'presente'
  ).length;

  const totalFaltas = aulasConcluidas.filter(
    (item) => item.presenca === 'falta'
  ).length;

  // Aula concluída sem frequência registrada
  const totalPendentes = aulasConcluidas.filter(
    (item) => !item.presenca
  ).length;


  // ==========================================
  // FILTRAR A LISTAGEM
  // ==========================================

  const registrosFiltrados = aulasConcluidas
    .filter((item) => {

      const nomeAluno = obterNomeAluno(
        item.id_aluno
      ).toLowerCase();

      // Filtra pelo nome digitado
      const correspondeBusca = nomeAluno.includes(
        busca.trim().toLowerCase()
      );

      // Filtra pela situação escolhida
      const correspondeSituacao =
        filtroSituacao === 'todos' ||
        (
          filtroSituacao === 'pendente'
            ? !item.presenca
            : item.presenca === filtroSituacao
        );

      return correspondeBusca && correspondeSituacao;

    })
    .sort((a, b) => {

      // Ordena da aula mais recente para a mais antiga
      const dataA = `${a.data_aula}T${a.horario_inicio || '00:00:00'}`;
      const dataB = `${b.data_aula}T${b.horario_inicio || '00:00:00'}`;

      return dataB.localeCompare(dataA);
    });


  // ==========================================
  // EXIBIR A INTERFACE
  // ==========================================

  return (
    <section className="pagina-alunos">

      {/* Título da página */}
      <div className="titulo-pagina">

        <h2>Controle de Frequência</h2>

        <p>
          Consulte as presenças e faltas dos alunos
          nas aulas concluídas.
        </p>

      </div>

      <div className="painel-pagina">

        {/* Indicadores de frequência */}
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

        </div>


        {/* Filtros da listagem */}
        <div className="frequencia-filtros">

          <input
            type="search"
            placeholder="Buscar aluno..."
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
          />

          <select
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


        {/* Mensagens de carregamento e erro */}
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


        {/* Tabela de frequência */}
        {!carregando && !erro && (

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

        )}

      </div>

    </section>
  );
}

export default Frequencia;
