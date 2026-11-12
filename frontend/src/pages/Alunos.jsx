
import { useState, useEffect } from "react";
import apiRequest from "../services/api";

function Alunos() {
    // Guarda a lista de alunos cadastrados no banco de dados
    const [alunos, setAlunos] = useState([]);

    // Guarda a lista de responsáveis cadastrados no banco
    const [responsaveis, setResponsaveis] = useState([]);
    // Guarda os planos disponíveis cadastrados no banco
    const [planos, setPlanos] = useState([]);
    // Guarda o ID do plano selecionado na matrícula
    const [planoSelecionado, setPlanoSelecionado] = useState("");
    // Guarda a data de inicio do contrato
    const [dataInicioContrato, setDataInicioContrato] = useState("");
    // Guarda o valor mensal definido para o contrato
    const [valorMensal, setValorMensal] = useState("");


    // Guarda os dados preenchidos no formulário
    const [nome, setNome] = useState("");
    const [nascimento, setNascimento] = useState("");
    const [responsavel, setResponsavel] = useState("");
    const [sexo, setSexo] = useState("");
    const [observacoes, setObservacoes] = useState("");
    // Guarda os dados de endereço do aluno
    const [endereco, setEndereco] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");

    // Guarda o ID do aluno que está sendo editado
    const [alunoEditando, setAlunoEditando] = useState(null);

    // Carrega alunos e responsáveis quando a página é aberta
    useEffect(() => {
        async function carregarDados() {
            try {
                // Busca os dados cadastrados
                const dadosAlunos = await apiRequest("/alunos/");
                setAlunos(dadosAlunos);
                // Busca os responsáveis cadastrados
                const dadosResponsaveis = await apiRequest("/responsaveis/");
                setResponsaveis(dadosResponsaveis);
                // Busca os planos cadastrados
                const dadosPlanos = await apiRequest("/planos/");
                setPlanos(dadosPlanos);
                
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
            // Organiza os dados conforme o formato esperado pela API
            const dadosAluno = {
            nome: nome,
            data_nascimento: nascimento || null,
            sexo: sexo || null,

            // Dados de endereço do aluno
            endereco: endereco || null,
            bairro: bairro || null,
            cidade: cidade || null,

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

                // Envia os dados do novo aluno para o FastAPI
                const alunoCriado = await apiRequest("/alunos/", {
                    method: "POST",
                     body: JSON.stringify(dadosAluno)
                });

                // Mostra os dados retornados pela API
                console.log("Aluno cadastrado:", alunoCriado);

                // Guarda o identificador gerado pelo MySQL
                const idAlunoCriado = alunoCriado.id_aluno;

                // Confirma que a API retornou um identificador
                if (!idAlunoCriado) {
                    alert("Aluno cadastrado, mas a API não retornou seu identificador.");
                    return;
                }

                alert("Aluno cadastrado com sucesso!");
            }

            // Cdasttra um contrato para um aluno já existente
            async function cadastrarContrato(idAluno) {

                // Verifica se um plano foi selecionado
                if (!planoSelecionado){
                    alert("Selecione um plano para realizar a matrícula.");
                    return;
                }

                // Verifica se a data de início foi preenchida
                if (!dataInicioContrato) {
                    alert("Informe a data de início do contrato.");
                    return;
                }
                // Verifica se o valor mensal foi informado corretamente
                if (
                    valorMensal === "" ||
                    !Number.isFinite(Number(valorMensal)) ||
                    Number(valorMensal) < 0
                ){
                    alert("Informe um valor mensal válido.");
                    return;
                }

                // Organiza os dados esperados pelo FastAPI
                const dadosContrato = {
                    id_aluno: Number(idAluno),
                    id_plano: Number(planoSelecionado),
                    data_inicio: dataInicioContrato,
                    valor_mensal: Number(valorMensal).toFixed(2)
                };

                try {
                    // Envia os dados para a API
                    const contratoCriado = await apiRequest("/contratos/", {
                        method: "POST",
                        body: JSON.stringify(dadosContrato)
                    });

                    // Exibe o resultado no Console para conferência
                    console.log("Contrato criado:", contratoCriado);

                    alert("Contrato cadastrado com sucesso!");

                    return contratoCriado;

                } catch (erro) {
                    console.error("Erro ao cadastrar contrato:", erro);
                    alert(erro.message || "Não foi possível cadastrar o contrato.");

                    return null;
                }

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
        setEndereco("");
        setBairro("");
        setCidade("");
        setAlunoEditando(null);
    }

    // Preenche o formulário com os dados do aluno selecionado
    function editarAluno(aluno) {
        setNome(aluno.nome);
        setNascimento(aluno.data_nascimento || "");
        setResponsavel(aluno.id_responsavel?.toString() || "");
        setSexo(aluno.sexo || "");
        setObservacoes(aluno.observacoes || "");
        setEndereco(aluno.endereco || "");
        setBairro(aluno.bairro || "");
        setCidade(aluno.cidade || "");
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
            <div className="painel-pagina">
                <h3>Dados do aluno</h3>

                <form className="formulario-pagina" onSubmit={cadastrarAluno}>

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
                        <label htmlFor="endereco">Endereço</label>
                        <input
                            id="endereco"
                            type="text"
                            value={endereco}
                            onChange={(evento) => setEndereco(evento.target.value)}
                            placeholder="Digite a rua e o número"
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="bairro">Bairro</label>
                        <input
                            id="bairro"
                            type="text"
                            value={bairro}
                            onChange={(evento) => setBairro(evento.target.value)}
                            placeholder="Digite o bairro"
                        />
                    </div>

                    <div className="campo">
                    <label htmlFor="cidade">Cidade</label>
                    <input
                        id="cidade"
                        type="text"
                        value={cidade}
                        onChange={(evento) => setCidade(evento.target.value)}
                        placeholder="Digite a cidade"
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

                    {/* Seleção do plano para matrícula */}
<div className="campo">
    <label htmlFor="plano">Planos</label>

    <select
        id="plano"
        value={planoSelecionado}
        onChange={(evento) =>
            setPlanoSelecionado(evento.target.value)
        }
    >
        <option value="">Selecione um plano</option>

        {planos
            .filter((plano) => plano.ativo === true)
            .map((plano) => (
                <option
                    key={plano.id_plano}
                    value={plano.id_plano}
                >
                    {plano.nome} - {plano.aulas_por_semana} aula(s) por semana
                </option>
            ))}
    </select>
</div>

{/* Data de início do contrato */}
<div className="campo">
    <label htmlFor="dataInicioContrato">
        Data de início do contrato
    </label>

    <input
        id="dataInicioContrato"
        type="date"
        value={dataInicioContrato}
        onChange={(evento) =>
            setDataInicioContrato(evento.target.value)
        }
    />
</div>

{/* Valor mensal do contrato */}
<div className="campo">
    <label htmlFor="valorMensal">
        Valor mensal (R$)
    </label>

    <input
        id="valorMensal"
        type="number"
        min="0"
        step="0.01"
        value={valorMensal}
        onChange={(evento) =>
            setValorMensal(evento.target.value)
        }
        placeholder="Ex.: 150.00"
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
            <div className="painel-pagina">
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
