// Importa os recursos do React para gerenciar estados e carregar dados
import { useEffect, useState } from 'react';

// Importa a função responsável pela comunicação com o FastAPI
import apiRequest from '../services/api';

// Componente da página Notificações
function Notificacoes() {

    // Armazena as notificações cadastradas
    const [notificacoes, setNotificacoes] = useState([]);

    // Armazena os usuários disponíveis
    const [usuarios, setUsuarios] = useState([]);

    // Campos do formulário
    const [idUsuario, setIdUsuario] = useState('');
    const [titulo, setTitulo] = useState('');
    const [mensagemTexto, setMensagemTexto] = useState('');
    const [tipo, setTipo] = useState('');

    // Mensagens de sucesso e erro
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');

// Busca as notificações cadastradas no FastAPI
async function carregarNotificacoes() {

    try {

        const dados = await apiRequest('/notificacoes/');

        setNotificacoes(dados);

    } catch (error) {

        console.error('Erro ao carregar notificações:', error);
        setErro(error.message);
    }
}

// Busca os usuários cadastrados
async function carregarUsuarios() {

    try {

        const dados = await apiRequest('/usuarios/');

        setUsuarios(dados);

    } catch (error) {

        console.error('Erro ao carregar usuários:', error);
        setErro(error.message);
    }
}

// Executa as consultas quando a página é aberta
useEffect(() => {
    carregarNotificacoes();
    carregarUsuarios();
}, []);

// Cadastra uma nova notificação no banco de dados
async function cadastrarNotificacao(event) {

    // Impede o recarregamento da página
    event.preventDefault();

    // Limpa mensagens anteriores
    setMensagem('');
    setErro('');

    // Prepara os dados conforme o schema do FastAPI
    const dadosNotificacao = {
        id_usuario: idUsuario ? Number(idUsuario) : null,
        titulo: titulo,
        mensagem: mensagemTexto,
        tipo: tipo || null,
    };

    try {

        // Envia os dados para o FastAPI
        await apiRequest('/notificacoes/', {
            method: 'POST',
            body: JSON.stringify(dadosNotificacao),
        });

        // Exibe a confirmação
        setMensagem('Notificação cadastrada com sucesso!');

        // Limpa os campos do formulário
        setIdUsuario('');
        setTitulo('');
        setMensagemTexto('');
        setTipo('');

                // Atualiza a listagem de notificações
        await carregarNotificacoes();

    } catch (error) {

        console.error('Erro ao cadastrar notificação:', error);
        setErro(error.message);
    }
}


// Marca uma notificação como lida
async function marcarComoLida(id) {

    // Limpa mensagens anteriores
    setMensagem('');
    setErro('');

    try {

        // Envia a atualização para o FastAPI
        await apiRequest(`/notificacoes/${id}/lida`, {
            method: 'PATCH',
        });

        // Atualiza a lista após a alteração
        await carregarNotificacoes();

        // Exibe mensagem de sucesso
        setMensagem('Notificação marcada como lida!');

    } catch (error) {

        console.error('Erro ao marcar notificação:', error);
        setErro(error.message);
    }
}

// Prepara uma notificação para envio pelo Gmail
function enviarNotificacaoPorEmail(notificacao) {

    // E-mail fixo utilizado durante os testes
    const destinatario = "testesailton@gmail.com";

    // Assunto da mensagem
    const assunto = `AulaConnect - ${notificacao.titulo}`;

    // Conteúdo do e-mail
    const mensagemEmail = `
Olá!

Você recebeu uma notificação do Personal Kids.

Título: ${notificacao.titulo}

Tipo: ${notificacao.tipo || "Geral"}

Mensagem:
${notificacao.mensagem}

Atenciosamente,
Equipe Personal Kids.
`;

    // Prepara o endereço para abrir o Gmail
    const linkEmail =
        `https://mail.google.com/mail/?view=cm&fs=1` +
        `&to=${encodeURIComponent(destinatario)}` +
        `&su=${encodeURIComponent(assunto)}` +
        `&body=${encodeURIComponent(mensagemEmail)}`;

    // Abre o Gmail em uma nova aba
    window.open(linkEmail, "_blank");
}

// Estrutura visual da página
return (
    <section className="pagina-notificacoes">

        {/* Formulário de cadastro de notificações */}
<div className="painel-pagina">

    <h2>Gerenciamento de Notificações</h2>

    <form
        className="formulario-pagina"
        onSubmit={cadastrarNotificacao}
    >

        {/* Seleciona o destinatário */}
        <div className="campo">

            <label>Destinatário</label>

            <select
                value={idUsuario}
                onChange={(e) => setIdUsuario(e.target.value)}
            >
                <option value="">Sem destinatário específico</option>

                {usuarios.map((usuario) => (
                    <option
                        key={usuario.id_usuario}
                        value={usuario.id_usuario}
                    >
                        {usuario.nome}
                    </option>
                ))}

            </select>

        </div>

        {/* Título da notificação */}
        <div className="campo">

            <label>Título *</label>

            <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Digite o título da notificação"
                maxLength={100}
                required
            />

        </div>

        {/* Conteúdo da mensagem */}
        <div className="campo">

            <label>Mensagem *</label>

            <textarea
                value={mensagemTexto}
                onChange={(e) => setMensagemTexto(e.target.value)}
                placeholder="Digite a mensagem da notificação"
                required
            />

        </div>

        {/* Categoria da notificação */}
        <div className="campo">

            <label>Tipo</label>

            <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
            >
                <option value="">Selecione o tipo</option>
                <option value="Pagamento">Pagamento</option>
                <option value="Aula">Aula</option>
                <option value="Geral">Geral</option>
            </select>

        </div>

        {/* Botão de cadastro */}
        <div className="acoes-formulario">

            <button type="submit">
                Cadastrar notificação
            </button>

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

        {/* Lista de notificações cadastradas */}
<div className="painel-pagina">

    <h2>Notificações cadastradas</h2>

    <p>
        Total de notificações: {notificacoes.length}
    </p>

    <div className="lista-alunos">

        {notificacoes.length === 0 ? (

            <p>Nenhuma notificação cadastrada.</p>

        ) : (

            notificacoes.map((notificacao) => {

                // Identifica o usuário destinatário
                const usuario = usuarios.find(
                    (item) =>
                        item.id_usuario === notificacao.id_usuario
                );

                return (

                    <div
                        className="item-aluno"
                        key={notificacao.id_notificacao}
                    >

                        {/* Título */}
                        <h3>{notificacao.titulo}</h3>

                        {/* Destinatário */}
                        <p>
                            <strong>Destinatário: </strong>
                            {usuario
                                ? usuario.nome
                                : notificacao.id_usuario === null
                                    ? 'Não definido'
                                    : `Usuário ID ${notificacao.id_usuario}`}
                        </p>

                        {/* Mensagem */}
                        <p>
                            <strong>Mensagem: </strong>
                            {notificacao.mensagem}
                        </p>

                        {/* Categoria */}
                        <p>
                            <strong>Tipo: </strong>
                            {notificacao.tipo || 'Geral'}
                        </p>

                        {/* Situação de leitura */}
                        <p>
                            <strong>Status: </strong>
                            {notificacao.lida
                                ? 'Lida'
                                : 'Não lida'}
                        </p>

                        {/* Data de envio */}
                        <p>
                            <strong>Data: </strong>
                            {new Date(
                                notificacao.data_envio
                            ).toLocaleString('pt-BR')}
                        </p>


{/* Botões de ações da notificação */}
<div className="acoes-formulario acoes-notificacao">

    <button
        type="button"
        className="btn-enviar-notificacao"
        onClick={() => enviarNotificacaoPorEmail(notificacao)}
    >
        Enviar notificação
    </button>

    {!notificacao.lida && (
        <button
            type="button"
            className="btn-marcar-lida"
            onClick={() =>
                marcarComoLida(notificacao.id_notificacao)
            }
        >
            Marcar como lida
        </button>
    )}

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
export default Notificacoes;