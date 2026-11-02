
import { useState, useEffect } from "react";
import apiRequest from "../services/api";

function Alunos() {
    // Guarda a lista de alunos cadastrados no banco de dados
    const [alunos, setAlunos] = useState([]);

    // Guarda a lista de responsáveis cadastrados no banco
    const [responsaveis, setResponsaveis] = useState([]);

    // Guarda os dados preenchidos no formulário
    const [nome, setNome] = useState("");
    const [nascimento, setNascimento] = useState("");
    const [responsavel, setResponsavel] = useState("");
    const [sexo, setSexo] = useState("");
    const [observacoes, setObservacoes] = useState("");

    // Guarda o ID do aluno que está sendo editado
    const [alunoEditando, setAlunoEditando] = useState(null);

    // Carrega alunos e responsáveis quando a página é aberta
    useEffect(() => {
        async function carregarDados() {
            try {
                const dadosAlunos = await apiRequest("/alunos/");
                setAlunos(dadosAlunos);

                const dadosResponsaveis = await apiRequest("/responsaveis/");
                setResponsaveis(dadosResponsaveis);
            } catch (erro) {
                console.error("Erro ao carregar dados:", erro);
                alert("Não foi possível carregar os dados.");
            }
        }

        carregarDados();
    }, []);

    // Cadastra um novo aluno ou atualiza um aluno existente
    async function cadastrarAluno(evento) {
        evento.preventDefault();

        if (!nome.trim()) {
            alert("Preencha o nome do aluno.");
            return;
        }

        // Organiza os dados conforme o formato esperado pela API
        const dadosAluno = {
            nome: nome,
            data_nascimento: nascimento || null,
            sexo: sexo || null,
            observacoes: observacoes || null,
            id_responsavel: responsavel ? Number(responsavel) : null
        };

        try {
            if (alunoEditando !== null) {
                await apiRequest(`/alunos/${alunoEditando}`, {
                    method: "PUT",
                    body: JSON.stringify(dadosAluno)
                });

                alert("Aluno atualizado com sucesso!");
            } else {
                await apiRequest("/alunos/", {
                    method: "POST",
                    body: JSON.stringify(dadosAluno)
                });

                alert("Aluno cadastrado com sucesso!");
            }

            // Atualiza a lista após salvar
            const dadosAtualizados = await apiRequest("/alunos/");
            setAlunos(dadosAtualizados);

            limparFormulario();

        } catch (erro) {
            console.error("Erro ao salvar aluno:", erro);
            alert(erro.message || "Não foi possível salvar o aluno.");
        }
    }

    // Limpa os campos do formulário
    function limparFormulario() {
        setNome("");
        setNascimento("");
        setResponsavel("");
        setSexo("");
        setObservacoes("");
        setAlunoEditando(null);
    }

    // Preenche o formulário com os dados do aluno selecionado
    function editarAluno(aluno) {
        setNome(aluno.nome);
        setNascimento(aluno.data_nascimento || "");
        setResponsavel(aluno.id_responsavel?.toString() || "");
        setSexo(aluno.sexo || "");
        setObservacoes(aluno.observacoes || "");
        setAlunoEditando(aluno.id_aluno);
    }

    // Exclui um aluno do banco de dados
    async function excluirAluno(id) {
        const confirmar = window.confirm(
            "Tem certeza que deseja excluir este aluno?"
        );

        if (!confirmar) {
            return;
        }

        try {
            await apiRequest(`/alunos/${id}`, {
                method: "DELETE"
            });

            alert("Aluno excluído com sucesso!");

            const dadosAtualizados = await apiRequest("/alunos/");
            setAlunos(dadosAtualizados);

            if (alunoEditando === id) {
                limparFormulario();
            }

        } catch (erro) {
            console.error("Erro ao excluir aluno:", erro);
            alert(erro.message || "Não foi possível excluir o aluno.");
        }
    }

    return (
        <div className="pagina-alunos">

            {/* Título da página */}
            <div className="titulo-pagina">
                <h2>Gerenciamento de Alunos</h2>
                <p>Cadastre e gerencie os alunos do sistema.</p>
            </div>

            {/* Formulário de cadastro e edição */}
            <div className="painel-alunos">
                <h3>Dados do aluno</h3>

                <form className="formulario-aluno" onSubmit={cadastrarAluno}>

                    <div className="campo">
                        <label htmlFor="nome">Nome do aluno</label>
                        <input
                            id="nome"
                            type="text"
                            value={nome}
                            onChange={(evento) => setNome(evento.target.value)}
                            placeholder="Digite o nome do aluno"
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="nascimento">Data de nascimento</label>
                        <input
                            id="nascimento"
                            type="date"
                            value={nascimento}
                            onChange={(evento) => setNascimento(evento.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="responsavel">Responsável</label>
                        <select
                            id="responsavel"
                            value={responsavel}
                            onChange={(evento) => setResponsavel(evento.target.value)}
                        >
                            <option value="">Selecione um responsável</option>

                            {responsaveis.map((item) => (
                                <option
                                    key={item.id_responsavel}
                                    value={item.id_responsavel}
                                >
                                    {item.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo">
                        <label htmlFor="sexo">Sexo</label>
                        <select
                            id="sexo"
                            value={sexo}
                            onChange={(evento) => setSexo(evento.target.value)}
                        >
                            <option value="">Selecione</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div className="campo">
                        <label htmlFor="observacoes">Observações</label>
                        <textarea
                            id="observacoes"
                            value={observacoes}
                            onChange={(evento) => setObservacoes(evento.target.value)}
                            placeholder="Informações adicionais sobre o aluno"
                        />
                    </div>

                    <div className="acoes-formulario">
                        <button type="submit">
                            {alunoEditando !== null
                                ? "Salvar alterações"
                                : "Cadastrar aluno"}
                        </button>

                        {alunoEditando !== null && (
                            <button type="button" onClick={limparFormulario}>
                                Cancelar edição
                            </button>
                        )}
                    </div>

                </form>
            </div>

            {/* Lista de alunos cadastrados */}
            <div className="painel-alunos">
                <h3>Alunos cadastrados</h3>

                {alunos.length === 0 ? (
                    <p className="mensagem-lista">
                        Nenhum aluno cadastrado.
                    </p>
                ) : (
                    <section className="lista-alunos">
                        {alunos.map((aluno) => (
                            <article
                                className="item-aluno"
                                key={aluno.id_aluno}
                            >
                                <h4>{aluno.nome}</h4>

                                <p>
                                    <strong>Data de nascimento: </strong>
                                    {aluno.data_nascimento || "Não informado"}
                                </p>

                                <p>
                                    <strong>Responsável: </strong>
                                    {responsaveis.find(
                                        (item) => item.id_responsavel === aluno.id_responsavel
                                    )?.nome || "Não informado"}
                                </p>

                                <p>
                                    <strong>Sexo: </strong>
                                    {aluno.sexo || "Não informado"}
                                </p>

                                <p>
                                    <strong>Observações: </strong>
                                    {aluno.observacoes || "Nenhuma"}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => editarAluno(aluno)}
                                >
                                    Editar
                                </button>

                                <button
                                    type="button"
                                    onClick={() => excluirAluno(aluno.id_aluno)}
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

export default Alunos;
