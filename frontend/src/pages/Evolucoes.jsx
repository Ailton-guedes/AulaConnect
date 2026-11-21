// Importa os recursos do React para gerenciar estados e carregar dados
import { useEffect, useState } from 'react';

// Importa a função responsável pela comunicação com o FastAPI
import apiRequest from '../services/api';

// Componente da página Evoluções
function Evolucoes() {

    // Armazena os alunos cadastrados no sistema
    const [alunos, setAlunos] = useState([]);

    // Armazena as evoluções cadastradas
    const [evolucoes, setEvolucoes] = useState([]);

    // Campos do formulário
    const [idAluno, setIdAluno] = useState('');
    const [dataAvaliacao, setDataAvaliacao] = useState('');
    const [descricao, setDescricao] = useState('');
    const [observacoes, setObservacoes] = useState('');

    // Controla qual evolução está sendo editada
    const [evolucaoEditando, setEvolucaoEditando] = useState(null);

    // Mensagens de sucesso e erro
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');

    // Busca os alunos cadastrados no FastAPI
    async function carregarAlunos() {
        try {
            const dados = await apiRequest('/alunos/');
            setAlunos(dados);
        } catch (error) {
            setErro(error.message);
        }
    }

    // Busca as evoluções cadastradas no FastAPI
    async function carregarEvolucoes() {
        try {
            const dados = await apiRequest('/evolucoes/');
            setEvolucoes(dados);
        } catch (error) {
            setErro(error.message);
        }
    }

    // Executa as consultas quando a página é aberta
    useEffect(() => {
        carregarAlunos();
        carregarEvolucoes();
    }, []);


// Cadastra uma nova evolução no banco de dados
async function salvarEvolucao(event) {

    // Impede o recarregamento da página
    event.preventDefault();

    // Limpa mensagens anteriores
    setMensagem('');
    setErro('');

    // Prepara os dados conforme o schema do FastAPI
    const dadosEvolucao = {
        id_aluno: Number(idAluno),
        data_avaliacao: dataAvaliacao,
        descricao: descricao,
        observacoes: observacoes || null,
    };

    try {

    if (evolucaoEditando !== null) {

        // Atualiza uma evolução existente
        await apiRequest(`/evolucoes/${evolucaoEditando}`, {
            method: 'PUT',
            body: JSON.stringify(dadosEvolucao),
        });

        setMensagem('Evolução atualizada com sucesso!');

    } else {

        // Cadastra uma nova evolução
        await apiRequest('/evolucoes/', {
            method: 'POST',
            body: JSON.stringify(dadosEvolucao),
        });

        setMensagem('Evolução cadastrada com sucesso!');
    }

    // Limpa os campos após salvar
    setIdAluno('');
    setDataAvaliacao('');
    setDescricao('');
    setObservacoes('');
    setEvolucaoEditando(null);

    // Atualiza os registros exibidos
    await carregarEvolucoes();

} catch (error) {

    console.error('Erro ao salvar evolução:', error);
    setErro(error.message);
}
}

// Preenche o formulário com os dados da evolução selecionada
function editarEvolucao(evolucao) {

    // Guarda o ID da evolução que será editada
    setEvolucaoEditando(evolucao.id_evolucao);

    // Preenche os campos com os dados existentes
    setIdAluno(String(evolucao.id_aluno));
    setDataAvaliacao(evolucao.data_avaliacao);
    setDescricao(evolucao.descricao);
    setObservacoes(evolucao.observacoes ?? '');

    // Limpa mensagens anteriores
    setMensagem('');
    setErro('');
}
// Limpa o formulário e cancela a edição
function limparFormulario() {
    setIdAluno('');
    setDataAvaliacao('');
    setDescricao('');
    setObservacoes('');
    setEvolucaoEditando(null);
}

// Exclui uma evolução cadastrada
async function excluirEvolucao(id) {

    // Solicita confirmação antes de excluir
    const confirmar = window.confirm(
        'Tem certeza que deseja excluir esta evolução?'
    );

    // Cancela a operação se o usuário não confirmar
    if (!confirmar) return;

    setMensagem('');
    setErro('');

    try {

        // Solicita a exclusão ao FastAPI
        await apiRequest(`/evolucoes/${id}`, {
            method: 'DELETE',
        });

        // Limpa o formulário se a evolução excluída
        // estiver sendo editada
        if (evolucaoEditando === id) {
            limparFormulario();
        }

        // Atualiza a lista
        await carregarEvolucoes();

        setMensagem('Evolução excluída com sucesso!');

    } catch (error) {

        console.error('Erro ao excluir evolução:', error);
        setErro(error.message);
    }
}

// Prepara o envio da evolução do aluno pelo Gmail
function enviarEvolucaoPorEmail(evolucao, aluno) {

    // E-mail utilizado somente para testes
    const destinatario = "testesailton@gmail.com";

    // Identifica o aluno
    const nomeAluno = aluno
        ? aluno.nome
        : `Aluno ID ${evolucao.id_aluno}`;

    // Formata a data para o padrão brasileiro
    const dataFormatada = evolucao.data_avaliacao
        .split("-")
        .reverse()
        .join("/");

    // Assunto do e-mail
    const assunto = `AulaConnect - Evolução de ${nomeAluno}`;

    // Conteúdo da mensagem
    const mensagemEmail = `
Olá!

Segue o acompanhamento da evolução do aluno.

Aluno: ${nomeAluno}
Data da avaliação: ${dataFormatada}

Descrição do progresso:
${evolucao.descricao}

Observações:
${evolucao.observacoes || "Nenhuma observação adicional."}

Atenciosamente,
Equipe Personal Kids.
`;

    // Monta o link de composição do Gmail
    const linkEmail =
        `https://mail.google.com/mail/?view=cm&fs=1` +
        `&to=${encodeURIComponent(destinatario)}` +
        `&su=${encodeURIComponent(assunto)}` +
        `&body=${encodeURIComponent(mensagemEmail)}`;

    // Abre o Gmail em uma nova aba
    window.open(linkEmail, "_blank");
}

    return (
        <section className="pagina-evolucoes">

                {/* Formulário de cadastro de evolução */}
<div className="painel-pagina">

    <h2>
    {evolucaoEditando !== null
        ? 'Editar evolução do aluno'
        : 'Registrar evolução do aluno'}
</h2>

    <form 
        className="formulario-pagina"
        onSubmit={salvarEvolucao}

    >

        {/* Seleciona um aluno cadastrado */}
        <div className="campo">
            <label>Aluno *</label>

            <select
                value={idAluno}
                onChange={(e) => setIdAluno(e.target.value)}
                required
            >
                <option value="">Selecione um aluno</option>

                {alunos.map((aluno) => (
                    <option
                        key={aluno.id_aluno}
                        value={aluno.id_aluno}
                    >
                        {aluno.nome}
                    </option>
                ))}
            </select>
        </div>

        {/* Data em que o aluno foi avaliado */}
        <div className="campo">
            <label>Data da avaliação *</label>

            <input
                type="date"
                value={dataAvaliacao}
                onChange={(e) => setDataAvaliacao(e.target.value)}
                required
            />
        </div>

        {/* Descrição do progresso do aluno */}
        <div className="campo">
            <label>Descrição do progresso *</label>

            <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o desenvolvimento do aluno"
                required
            />
        </div>

        {/* Observações adicionais */}
        <div className="campo">
            <label>Observações</label>

            <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informações adicionais sobre a avaliação"
            />
        </div>

      {/* Botão do formulário */}
<div className="acoes-formulario">

    <button type="submit">
        {evolucaoEditando !== null
            ? 'Salvar alterações'
            : 'Registrar evolução'}
    </button>

    {/* Exibe o botão somente durante a edição */}
    {evolucaoEditando !== null && (
        <button
            type="button"
            onClick={limparFormulario}
        >
            Cancelar edição
        </button>
    )}

</div>

    </form>

</div>
{/* Mensagens de sucesso e erro */}
{mensagem && (
    <p className="mensagem-lista">{mensagem}</p>
)}

{erro && (
    <p className="mensagem-lista">{erro}</p>
)}

            {/* Lista de evoluções cadastradas */}
<div className="painel-pagina">

    <h2>Evoluções cadastradas</h2>

    <div className="lista-alunos">

        {evolucoes.length === 0 ? (

            <p>Nenhuma evolução cadastrada.</p>

        ) : (

            evolucoes.map((evolucao) => {

                // Busca o aluno associado à evolução
                const aluno = alunos.find(
                    (item) => item.id_aluno === evolucao.id_aluno
                );

                return (
                    <div
                        className="item-aluno"
                        key={evolucao.id_evolucao}
                    >

                        {/* Nome do aluno */}
                        <h3>
                            {aluno
                                ? aluno.nome
                                : `Aluno ID ${evolucao.id_aluno}`}
                        </h3>

                        {/* Data da avaliação */}
                        <p>
                            <strong>Data da avaliação: </strong>
                            {evolucao.data_avaliacao
                                .split('-')
                                .reverse()
                                .join('/')}
                        </p>

                        {/* Descrição do progresso */}
                        <p>
                            <strong>Descrição: </strong>
                            {evolucao.descricao}
                        </p>

                        {/* Observações adicionais */}
                        {evolucao.observacoes && (
                            <p>
                                <strong>Observações: </strong>
                                {evolucao.observacoes}
                            </p>
                        )}

          {/* Botões de ações da evolução */}
<div className="acoes-formulario acoes-evolucao">

    {/* Edita a evolução cadastrada */}
    <button
        type="button"
        className="btn-editar-evolucao"
        onClick={() => editarEvolucao(evolucao)}
    >
        Editar
    </button>

    {/* Exclui a evolução cadastrada */}
    <button
        type="button"
        className="btn-excluir-evolucao"
        onClick={() => excluirEvolucao(evolucao.id_evolucao)}
    >
        Excluir
    </button>

    {/* Prepara o envio da evolução pelo Gmail */}
    <button
        type="button"
        className="btn-enviar-evolucao"
        onClick={() => enviarEvolucaoPorEmail(evolucao, aluno)}
    >
        Enviar evolução
    </button>

</div>         

                    </div>
                );
            })

        )}

    </div>

</div>

        </section>
    );
}

// Disponibiliza o componente para utilização no App.jsx
export default Evolucoes;