import { useEffect, useState } from 'react';
import apiRequest from '../services/api';

function Aulas() {
    // Lista de aulas cadastradas
    const [ aulas, setAulas] = useState([]);

    // Campos do formulario
    const [descricao, setDescricao] = useState('');
    const [diaSemana, setDiaSemana] = useState('');
    const [horario, setHorario] = useState('');
    const [duracao, setDuracao] = useState('');
    const [capacidade, setCapacidade] = useState('');
    const [observacoes, setObservacoes] = useState('');

    // Controla qual aula está sen editada
    const [aulaEditando, setAulaEditando] = useState(null);

    // Mensagem para o usuário
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');

    // Busca as aulas cadastradas na API
    async function carregarAulas() {
        try {
            const dados = await apiRequest('/aulas/');
            setAulas(dados);
            setErro('');
        } catch (error) {
            setErro(error.message);
        }
    }

    // Carrega a lista quando a página é aberta
    useEffect(() =>{
        carregarAulas();
    }, []);

    // Limpa os campos do formuario
    function limparFormulario() {
        setDescricao('');
        setDiaSemana('');
        setHorario('');
        setDuracao('');
        setCapacidade('');
        setObservacoes('');
        setAulaEditando(null);
    }

    // Cadastrar uma nova aula au atualizar uma existente
    async function salvarAula(event) {
        event.prevent.Default();

        setMensagem('');
        setErro('');


        const dadosAula = {
            descricao,
            dia_semana: diaSemana,
            horario,
            duracao: duracao ? Number(duracao) : null,
            capacidade: capacidade ? Number(capacidade) : null,
            observacoes: observacoes || null,
        };

        try {
            if (aulaEditando) {
                await apiRequest(`/aulas/${aulaEditando}`, {
                    method: 'PUT',
                    body: JSON.stringify(dadosAula),
                });
                setMensagem('Aula atualiada com sucessso!');
            } else {
                await apiRequest('/Aula/', {
                    method: 'POST',
                    body: JSON.stringify(dadosAula),
                });

                setMensagem('Aula cadastrado com sucesso!');
            }

            limparFormulario();
            await carregarAulas();
        } catch (error) {
            setErro(error.message);
        }
    }

    // Preenche o formulario com os dados da aula selecionada
    function editarAula(aula) {
        setAulaEditando(aula.id_aula);
        setDescricao(aula.descricao);
        setDiaSemana(aula.dia_semana);
        setHorario(String(aula.horario).slice(0,5));
        setDuracao(aula.duracao ?? '');
        setCapacidade(aula.capacidade ?? '');
        setObservacoes(aula.observacoes ?? '');

        setMensagem('');
        setErro('');
    }

    // Excluir uma aula
    async function excluirAula(id) {
        const confirmar = window.confirm(
            'Tem certeza que deseja excluir esta aula?'
        );

        if (!confirmar) return;

        setMensagem('');
        setErro('');

        try {
            await apiRequest(`/aula/${id}`, {
                method: 'DELETE',
            });

            setMensagem('Aula excluida com sucesso!');

            if (aulaEditando === id){
                limparFormulario();
            }

            await carregarAulas();
        } catch (error) {
            setErro(error.message);
        }
    }

    return (
        <section className='pagina-alino'>
            <h1 className='titulo-pagina'>Gerenciamento de Aulas</h1>
            {/* Formulário de cadastro e edição */}
            <div className='painel-pagina'>
              <h2>{aulaEditando ? 'Editar Aula' : 'Cdastrar Aula'}</h2>
              <form className='formulario-pagina' onSubmit={salvarAula}>
                <div className='campo'>
                    <label>Descrição da aula *</label>
                    <input 
                      type="text" 
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder='Ex: Natação infantil'
                      required
                    />
                </div>

                <div>
                    <label> Dia da semana *</label>
                    <select
                        value={diaSemana}
                        onChange={(e) => setDiaSemana(e.target.value)}
                        required
                    >
                        <option value="">Selecione o dia</option>
                        <option value="Segunda-feira">Segunda-feira</option>
                        <option value="Terça-feira">Terça-feira</option>
                        <option value="Quarta-feira">Quarta-feira</option>
                        <option value="Quinta-feira">Quinta-feira</option>
                        <option value="Sexta-feira">Sexta-feira</option>
                        <option value="Sábado">Sábado</option>
                    </select>
                </div>
                <div className="campo">
            <label>Horário *</label>
            <input
              type="time"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label>Duração (minutos)</label>
            <input
              type="number"
              min="1"
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
              placeholder="Ex.: 60"
            />
          </div>

          <div className="campo">
            <label>Capacidade de alunos</label>
            <input
              type="number"
              min="1"
              value={capacidade}
              onChange={(e) => setCapacidade(e.target.value)}
              placeholder="Ex.: 10"
            />
          </div>

          <div className="campo">
            <label>Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais sobre a aula"
            />
          </div>

          <div className="acoes-formulario">
            <button type="submit">
              {aulaEditando ? 'Salvar alterações' : 'Cadastrar aula'}
            </button>

            {aulaEditando && (
              <button type="button" onClick={limparFormulario}>
                Cancelar edição
              </button>
            )}
          </div>
        </form>
    </div>
          {/* Mensagens de sucesso e erro */}
      {mensagem && <p className="mensagem-lista">{mensagem}</p>}
      {erro && <p className="mensagem-lista">{erro}</p>}

      {/* Lista de aulas cadastradas */}
      <div className="painel-pagina">
        <h2>Aulas cadastradas</h2>

        <div className="lista-alunos">
          {aulas.length === 0 ? (
            <p>Nenhuma aula cadastrada.</p>
          ) : (
            aulas.map((aula) => (
              <div className="item-aluno" key={aula.id_aula}>
                <h3>{aula.descricao}</h3>

                <p><strong>Dia:</strong> {aula.dia_semana}</p>
                <p><strong>Horário:</strong> {String(aula.horario).slice(0, 5)}</p>

                {aula.duracao != null && (
                  <p><strong>Duração:</strong> {aula.duracao} minutos</p>
                )}

                {aula.capacidade != null && (
                  <p><strong>Capacidade:</strong> {aula.capacidade} alunos</p>
                )}

                {aula.observacoes && (
                  <p><strong>Observações:</strong> {aula.observacoes}</p>
                )}

                <div className="acoes-formulario">
                  <button
                    type="button"
                    onClick={() => editarAula(aula)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => excluirAula(aula.id_aula)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>   
    </section>
    );
}

export default Aulas;