// Importa os recursos para controlar os dados e carregar a página
import { useState, useEffect, useRef } from "react";

// Importa a função responsável pelas requisições ao FastAPI
import apiRequest from "../services/api";

function Usuarios() {

    // Armazena os usuários recebidos do banco de dados
    const [usuarios, setUsuarios] = useState([]);

    // Controla o carregamento e as mensagens de erro
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    // Referência para localizar o formulário na página
    const formularioRef = useRef(null);

    // Armazena os dados do novo usuário
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    // Define o perfil do novo usuário
    const [tipoUsuario, setTipoUsuario] = useState("PROFESSOR");

    // Controla o envio do formulário
    const [salvando, setSalvando] = useState(false);
    // Armazena o ID do usuário que está sendo editado
    const [usuarioEditando, setUsuarioEditando] = useState(null);

    // Exibe mensagens após o cadastro
    const [mensagemCadastro, setMensagemCadastro] = useState("");
    const [erroCadastro, setErroCadastro] = useState("");

    // Busca os usuários cadastrados no MySQL por meio do FastAPI
    async function carregarUsuarios() {

        setCarregando(true);
        setErro("");

        try {

            // GET /usuarios/ exige autenticação JWT
            const dados = await apiRequest("/usuarios/");

            // Atualiza a lista com os dados reais da API
            setUsuarios(dados);

        } catch (erroRequisicao) {

            console.error(
                "Erro ao carregar usuários:",
                erroRequisicao
            );

            setErro(
                erroRequisicao.message ||
                "Não foi possível carregar os usuários."
            );

        } finally {

            setCarregando(false);

        }
    }

    // Executa a consulta quando a página é aberta
    useEffect(() => {
        carregarUsuarios();
    }, []);

// Cadastra um novo usuário ou atualiza um usuário existente
async function cadastrarUsuario(evento) {

    // Impede que o formulário recarregue a página
    evento.preventDefault();

    // Limpa as mensagens anteriores
    setMensagemCadastro("");
    setErroCadastro("");

    // Verifica se estamos cadastrando ou editando
    const editando = usuarioEditando !== null;

    // Valida a senha somente durante o cadastro
    if (!editando) {

        if (senha !== confirmarSenha) {
            setErroCadastro("As senhas não coincidem.");
            return;
        }

        if (senha.length < 8) {
            setErroCadastro(
                "A senha deve possuir pelo menos 8 caracteres."
            );
            return;
        }
    }

    // Impede vários envios simultâneos
    setSalvando(true);

    // Dados utilizados tanto no cadastro quanto na edição
    const dadosUsuario = {
        nome: nome.trim(),
        email: email.trim(),
        tipo_usuario: tipoUsuario
    };

    try {

        if (editando) {

            // Atualiza um usuário existente
            // A senha não é enviada durante a edição
            await apiRequest(`/usuarios/${usuarioEditando}`, {
                method: "PUT",
                body: JSON.stringify(dadosUsuario)
            });

            setMensagemCadastro(
                "Usuário atualizado com sucesso!"
            );

        } else {

            // Adiciona a senha somente no cadastro
            dadosUsuario.senha = senha;

            // Cadastra um novo usuário no MySQL
            await apiRequest("/usuarios/", {
                method: "POST",
                body: JSON.stringify(dadosUsuario)
            });

            setMensagemCadastro(
                "Usuário cadastrado com sucesso!"
            );
        }

        // Limpa os campos após salvar
        setNome("");
        setEmail("");
        setSenha("");
        setConfirmarSenha("");
        setTipoUsuario("PROFESSOR");

        // Retorna ao modo de cadastro
        setUsuarioEditando(null);

        // Atualiza a listagem com os dados do MySQL
        await carregarUsuarios();

    } catch (erroRequisicao) {

        console.error(
            "Erro ao salvar usuário:",
            erroRequisicao
        );

        setErroCadastro(
            erroRequisicao.message ||
            "Não foi possível salvar o usuário."
        );

    } finally {

        setSalvando(false);
    }
}

// Preenche o formulário com os dados do usuário selecionado
function editarUsuario(usuario) {

    // Guarda o ID do usuário que será editado
    setUsuarioEditando(usuario.id_usuario);

    // Preenche os campos com os dados existentes
    setNome(usuario.nome);
    setEmail(usuario.email);
    setTipoUsuario(usuario.tipo_usuario);

    // A senha não será carregada na edição
    setSenha("");
    setConfirmarSenha("");

    // Limpa as mensagens anteriores
    setMensagemCadastro("");
    setErroCadastro("");

    // Rola a página suavemente até o formulário
    formularioRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start"
});

}

// Cancela a edição e limpa o formulário
function cancelarEdicao() {

    setUsuarioEditando(null);

    setNome("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");
    setTipoUsuario("PROFESSOR");

    setMensagemCadastro("");
    setErroCadastro("");
}

// Exclui um usuário do banco de dados
async function excluirUsuario(idUsuario) {

    // Solicita confirmação antes da exclusão
    const confirmar = window.confirm(
        "Tem certeza que deseja excluir este usuário?"
    );

    if (!confirmar) {
        return;
    }

    try {

        // Envia a requisição DELETE ao FastAPI
        await apiRequest(`/usuarios/${idUsuario}`, {
            method: "DELETE"
        });

        alert("Usuário excluído com sucesso!");

        // Se o usuário excluído estava sendo editado,
        // limpa o formulário
        if (usuarioEditando === idUsuario) {
            cancelarEdicao();
        }

        // Atualiza a listagem após a exclusão
        await carregarUsuarios();

    } catch (erroRequisicao) {

        console.error(
            "Erro ao excluir usuário:",
            erroRequisicao
        );

        alert(
            erroRequisicao.message ||
            "Não foi possível excluir o usuário."
        );
    }
}

    return (
        <div className="pagina-alunos">

            {/* Título da página */}
            <div className="titulo-pagina">

                <h2>Gerenciamento de Usuários</h2>

                <p>
                    Consulte os administradores e professores
                    cadastrados no AulaConnect.
                </p>

            </div>

            {/* Formulário para cadastrar administradores e professores */}
<div className="painel-pagina" ref={formularioRef}>

    <h3>
    {usuarioEditando !== null
        ? "Editar usuário"
        : "Cadastrar novo usuário"}
</h3>

    <form
        className="formulario-pagina"
        onSubmit={cadastrarUsuario}
    >

        {/* Nome completo */}
        <div className="campo">
            <label htmlFor="nomeUsuario">
                Nome completo
            </label>

            <input
                id="nomeUsuario"
                type="text"
                value={nome}
                onChange={(evento) =>
                    setNome(evento.target.value)
                }
                minLength={3}
                maxLength={100}
                required
            />
        </div>

        {/* E-mail */}
        <div className="campo">
            <label htmlFor="emailUsuario">
                E-mail
            </label>

            <input
                id="emailUsuario"
                type="email"
                value={email}
                onChange={(evento) =>
                    setEmail(evento.target.value)
                }
                required
            />
        </div>

        {/* Senha */}
        <div className="campo">
            <label htmlFor="senhaUsuario">
                Senha
            </label>

            <input
                id="senhaUsuario"
                type="password"
                value={senha}
                onChange={(evento) =>
                    setSenha(evento.target.value)
                }
                minLength={8}
                required
            />
        </div>

        {/* Confirmação da senha */}
        <div className="campo">
            <label htmlFor="confirmarSenhaUsuario">
                Confirmar senha
            </label>

            <input
                id="confirmarSenhaUsuario"
                type="password"
                value={confirmarSenha}
                onChange={(evento) =>
                    setConfirmarSenha(evento.target.value)
                }
                required
            />
        </div>

        {/* Perfil de acesso */}
        <div className="campo">
            <label htmlFor="tipoUsuario">
                Perfil do usuário
            </label>

            <select
                id="tipoUsuario"
                value={tipoUsuario}
                onChange={(evento) =>
                    setTipoUsuario(evento.target.value)
                }
            >
                <option value="PROFESSOR">
                    Professor
                </option>

                <option value="Adm">
                    Administrador
                </option>
            </select>
        </div>

        {/* Mensagens do cadastro */}
        {erroCadastro && (
            <p role="alert" className="erro-login">
                {erroCadastro}
            </p>
        )}

        {mensagemCadastro && (
            <p role="status">
                {mensagemCadastro}
            </p>
        )}

        {/* Botão de cadastro */}
        <div className="acoes-formulario">
            <button
                type="submit"
                disabled={salvando}
            >
                {salvando
                    ? "Salvando..."
                    : usuarioEditando !== null
                        ? "Salvar alterações"
                        : "Cadastrar usuário"}
            </button>

                    {usuarioEditando !== null && (
                        <button
                            type="button"
                            onClick={cancelarEdicao}
                            disabled={salvando}
                        >
                            Cancelar edição
                    </button>
                )}

        </div>

    </form>

</div>

            {/* Painel com os usuários cadastrados */}
            <div className="painel-pagina">

                <h3>Usuários cadastrados</h3>

                {/* Mensagem durante o carregamento */}
                {carregando && (
                    <p className="mensagem-lista">
                        Carregando usuários...
                    </p>
                )}

                {/* Mensagem caso a API retorne um erro */}
                {!carregando && erro && (
                    <p className="mensagem-lista" role="alert">
                        {erro}
                    </p>
                )}

                {/* Mensagem quando não existem usuários */}
                {!carregando && !erro && usuarios.length === 0 && (
                    <p className="mensagem-lista">
                        Nenhum usuário cadastrado.
                    </p>
                )}

                {/* Lista dos usuários recebidos do backend */}
                {!carregando && !erro && usuarios.length > 0 && (

                    <section className="lista-alunos">

                        {usuarios.map((usuario) => (

                            <article
                                className="item-aluno"
                                key={usuario.id_usuario}
                            >

                                <h4>{usuario.nome}</h4>

                                <p>
                                    <strong>E-mail: </strong>
                                    {usuario.email}
                                </p>

                                <p>
                                    <strong>Perfil: </strong>
                                    {usuario.tipo_usuario === "Adm"
                                        ? "Administrador"
                                        : "Professor"}
                                </p>

                                <p>
                                    <strong>Data de cadastro: </strong>
                                    {usuario.data_cadastro
                                        ? new Date(
                                            usuario.data_cadastro
                                        ).toLocaleDateString("pt-BR")
                                        : "Não informado"}
                                </p>


                                {/* Botões para gerenciar o usuário */}
<div className="acoes-formulario">

    <button
        type="button"
        onClick={() => editarUsuario(usuario)}
    >
        Editar
    </button>

    <button
        type="button"
        onClick={() => excluirUsuario(usuario.id_usuario)}
    >
        Excluir
    </button>

</div>

                            </article>

                        ))}

                    </section>

                )}

            </div>

        </div>
    );
}

export default Usuarios;