
import { useState, useEffect } from "react";
import apiRequest from "../services/api";

function Responsaveis() {
    // Guarda a lista de responsáveis cadastrados
    const [responsaveis, setResponsaveis] = useState([]);

    // Guarda os dados preenchidos no formulário
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");

    // Guarda o ID do responsável que está sendo editado
    const [responsavelEditando, setResponsavelEditando] = useState(null);

    // Busca os responsáveis na API
    async function carregarResponsaveis() {
        try {
            const dados = await apiRequest("/responsaveis/");
            setResponsaveis(dados);
        } catch (erro) {
            console.error("Erro ao carregar responsáveis:", erro);
            alert("Não foi possível carregar os responsáveis.");
        }
    }

    // Carrega a lista quando a página é aberta
    useEffect(() => {
        carregarResponsaveis();
    }, []);

    // Cadastra um responsável ou atualiza um registro existente
    async function salvarResponsavel(evento) {
        evento.preventDefault();

        if (!nome.trim()) {
            alert("Preencha o nome do responsável.");
            return;
        }

        // O CPF é armazenado somente com números
        const cpfLimpo = cpf.replace(/\D/g, "");

        if (cpfLimpo && cpfLimpo.length !== 11) {
            alert("O CPF deve possuir 11 números.");
            return;
        }

        // Organiza os dados conforme o formato esperado pela API
        const dadosResponsavel = {
            nome: nome.trim(),
            telefone: telefone.trim() || null,
            email: email.trim() || null,
            cpf: cpfLimpo || null
        };

        try {
            if (responsavelEditando !== null) {
                await apiRequest(`/responsaveis/${responsavelEditando}`, {
                    method: "PUT",
                    body: JSON.stringify(dadosResponsavel)
                });

                alert("Responsável atualizado com sucesso!");
            } else {
                await apiRequest("/responsaveis/", {
                    method: "POST",
                    body: JSON.stringify(dadosResponsavel)
                });

                alert("Responsável cadastrado com sucesso!");
            }

            await carregarResponsaveis();
            limparFormulario();

        } catch (erro) {
            console.error("Erro ao salvar responsável:", erro);
            alert(erro.message || "Não foi possível salvar o responsável.");
        }
    }

    // Limpa os campos do formulário
    function limparFormulario() {
        setNome("");
        setTelefone("");
        setEmail("");
        setCpf("");
        setResponsavelEditando(null);
    }

    // Preenche o formulário com os dados selecionados
    function editarResponsavel(responsavel) {
        setNome(responsavel.nome || "");
        setTelefone(responsavel.telefone || "");
        setEmail(responsavel.email || "");
        setCpf(responsavel.cpf || "");
        setResponsavelEditando(responsavel.id_responsavel);
    }

    // Exclui um responsável do banco de dados
    async function excluirResponsavel(id) {
        const confirmar = window.confirm(
            "Tem certeza que deseja excluir este responsável?"
        );

        if (!confirmar) {
            return;
        }

        try {
            await apiRequest(`/responsaveis/${id}`, {
                method: "DELETE"
            });

            alert("Responsável excluído com sucesso!");

            await carregarResponsaveis();

            if (responsavelEditando === id) {
                limparFormulario();
            }

        } catch (erro) {
            console.error("Erro ao excluir responsável:", erro);
            alert(erro.message || "Não foi possível excluir o responsável.");
        }
    }

    return (
        <div className="pagina-alunos">

            {/* Título da página */}
            <div className="titulo-pagina">
                <h2>Gerenciamento de Responsáveis</h2>
                <p>Cadastre e gerencie os responsáveis pelos alunos.</p>
            </div>

            {/* Formulário de cadastro e edição */}
            <div className="painel-alunos">
                <h3>Dados do responsável</h3>

                <form className="formulario-aluno" onSubmit={salvarResponsavel}>

                    <div className="campo">
                        <label htmlFor="nomeResponsavel">Nome completo</label>
                        <input
                            id="nomeResponsavel"
                            type="text"
                            value={nome}
                            onChange={(evento) => setNome(evento.target.value)}
                            placeholder="Digite o nome completo"
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="telefoneResponsavel">Telefone</label>
                        <input
                            id="telefoneResponsavel"
                            type="tel"
                            value={telefone}
                            onChange={(evento) => setTelefone(evento.target.value)}
                            placeholder="Digite o telefone"
                            maxLength={25}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="emailResponsavel">E-mail</label>
                        <input
                            id="emailResponsavel"
                            type="email"
                            value={email}
                            onChange={(evento) => setEmail(evento.target.value)}
                            placeholder="exemplo@email.com"
                            maxLength={100}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="cpfResponsavel">CPF</label>
                        <input
                            id="cpfResponsavel"
                            type="text"
                            value={cpf}
                            onChange={(evento) => setCpf(evento.target.value)}
                            placeholder="Digite os 11 números do CPF"
                            maxLength={14}
                        />
                    </div>

                    <div className="acoes-formulario">
                        <button type="submit">
                            {responsavelEditando !== null
                                ? "Salvar alterações"
                                : "Cadastrar responsável"}
                        </button>

                        {responsavelEditando !== null && (
                            <button type="button" onClick={limparFormulario}>
                                Cancelar edição
                            </button>
                        )}
                    </div>

                </form>
            </div>

            {/* Lista de responsáveis cadastrados */}
            <div className="painel-alunos">
                <h3>Responsáveis cadastrados</h3>

                {responsaveis.length === 0 ? (
                    <p className="mensagem-lista">
                        Nenhum responsável cadastrado.
                    </p>
                ) : (
                    <section className="lista-alunos">
                        {responsaveis.map((responsavel) => (
                            <article
                                className="item-aluno"
                                key={responsavel.id_responsavel}
                            >
                                <h4>{responsavel.nome}</h4>

                                <p>
                                    <strong>Telefone: </strong>
                                    {responsavel.telefone || "Não informado"}
                                </p>

                                <p>
                                    <strong>E-mail: </strong>
                                    {responsavel.email || "Não informado"}
                                </p>

                                <p>
                                    <strong>CPF: </strong>
                                    {responsavel.cpf || "Não informado"}
                                </p>

                                <p>
                                    <strong>Data de cadastro: </strong>
                                    {responsavel.data_cadastro
                                        ? new Date(responsavel.data_cadastro).toLocaleDateString("pt-BR")
                                        : "Não informado"}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => editarResponsavel(responsavel)}
                                >
                                    Editar
                                </button>

                                <button
                                    type="button"
                                    onClick={() => excluirResponsavel(responsavel.id_responsavel)}
                                >
                                    Excluir
                                </button>
                            </article>
                        ))}
                    </section>
                )}
            </div>

        </div>
    );
}

export default Responsaveis;
