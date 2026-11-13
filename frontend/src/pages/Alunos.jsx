import { useEffect, useState } from "react";
import apiRequest from "../services/api";

function Alunos() {
    // Dados carregados do backend
    const [alunos, setAlunos] = useState([]);
    const [responsaveis, setResponsaveis] = useState([]);
    const [planos, setPlanos] = useState([]);

    // Dados pessoais do aluno
    const [nome, setNome] = useState("");
    const [nascimento, setNascimento] = useState("");
    const [responsavel, setResponsavel] = useState("");
    const [sexo, setSexo] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [endereco, setEndereco] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");

    // Controle de edição e matrícula
    const [alunoEditando, setAlunoEditando] = useState(null);
    const [realizarMatricula, setRealizarMatricula] = useState(false);
    const [planoSelecionado, setPlanoSelecionado] = useState("");
    const [dataInicioContrato, setDataInicioContrato] = useState("");
    const [valorMensal, setValorMensal] = useState("");

    // Carrega alunos, responsáveis e planos ao abrir a página
    useEffect(() => {
        async function carregarDados() {
            try {
                const dadosAlunos = await apiRequest("/alunos/");
                setAlunos(dadosAlunos);

                const dadosResponsaveis = await apiRequest("/responsaveis/");
                setResponsaveis(dadosResponsaveis);

                const dadosPlanos = await apiRequest("/planos/");
                setPlanos(dadosPlanos);
            } catch (erro) {
                console.error("Erro ao carregar dados:", erro);
                alert("Não foi possível carregar os dados.");
            }
        }

        carregarDados();
    }, []);

    // Limpa todos os campos e sai do modo de edição
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
        setRealizarMatricula(false);
        setPlanoSelecionado("");
        setDataInicioContrato("");
        setValorMensal("");
    }

    // Preenche o formulário com os dados do aluno escolhido
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

        // A edição de dados pessoais não deve criar contratos
        setRealizarMatricula(false);
        setPlanoSelecionado("");
        setDataInicioContrato("");
        setValorMensal("");
    }

    // Cadastra um aluno ou atualiza seus dados pessoais
async function cadastrarAluno(evento) {
    evento.preventDefault();

    // Verifica se o nome foi preenchido
    if (!nome.trim()) {
        alert("Preencha o nome do aluno.");
        return;
    }

    // Valida a matrícula somente ao cadastrar um novo aluno
    if (realizarMatricula && alunoEditando === null) {

        // Verifica se um plano foi selecionado
        if (!planoSelecionado) {
            alert("Selecione um plano para realizar a matrícula.");
            return;
        }

        // Verifica se a data de início foi preenchida
        if (!dataInicioContrato) {
            alert("Informe a data de início do contrato.");
            return;
        }

        // Verifica se o valor mensal é válido
        if (
            valorMensal === "" ||
            !Number.isFinite(Number(valorMensal)) ||
            Number(valorMensal) < 0
        ) {
            alert("Informe um valor mensal válido.");
            return;
        }
    }


        const dadosAluno = {
            nome: nome.trim(),
            data_nascimento: nascimento || null,
            sexo: sexo || null,
            endereco: endereco || null,
            bairro: bairro || null,
            cidade: cidade || null,
            observacoes: observacoes || null,
            id_responsavel: responsavel ? Number(responsavel) : null
        };

        try {
    if (alunoEditando !== null) {

        // Atualiza os dados de um aluno existente
        await apiRequest(`/alunos/${alunoEditando}`, {
            method: "PUT",
            body: JSON.stringify(dadosAluno)
        });

        alert("Aluno atualizado com sucesso!");

    } else {

        // Cadastra o aluno no banco de dados
        const alunoCriado = await apiRequest("/alunos/", {
            method: "POST",
            body: JSON.stringify(dadosAluno)
        });

        console.log("Aluno cadastrado:", alunoCriado);

        // Recupera o ID gerado pelo MySQL
        const idAlunoCriado = alunoCriado?.id_aluno;

        if (!idAlunoCriado) {
            alert(
                "Aluno cadastrado, mas a API não retornou seu identificador. " +
                "Confira a lista antes de tentar novamente."
            );
            return;
        }

        // Cria o contrato somente se a matrícula foi selecionada
        if (realizarMatricula) {

            try {
                await cadastrarContrato(idAlunoCriado);

                alert("Aluno cadastrado e contrato criado com sucesso!");

            } catch (erroContrato) {

                console.error(
                    "Aluno cadastrado, mas houve erro ao criar contrato:",
                    erroContrato
                );

                alert(
                    "O aluno foi cadastrado, mas o contrato não foi criado. " +
                    "Verifique o cadastro antes de tentar novamente."
                );

                // Evita repetir o cadastro do aluno
                const dadosAtualizados = await apiRequest("/alunos/");
                setAlunos(dadosAtualizados);
                limparFormulario();
                return;
            }

        } else {
            alert("Aluno cadastrado com sucesso!");
        }
    }

    // Atualiza a lista de alunos
    const dadosAtualizados = await apiRequest("/alunos/");
    setAlunos(dadosAtualizados);

    // Limpa os campos após salvar
    limparFormulario();

} catch (erro) {

    console.error("Erro ao salvar aluno:", erro);

    alert(
        erro.message || "Não foi possível salvar o aluno."
    );

}

}
   // Cria um contrato para um aluno já cadastrado
async function cadastrarContrato(idAluno) {

    // Verifica se o aluno possui um identificador válido
    if (!idAluno || Number(idAluno) <= 0) {
        throw new Error("Identificador do aluno inválido.");
    }

    // Verifica se um plano foi selecionado
    if (!planoSelecionado) {
        throw new Error("Selecione um plano para realizar a matrícula.");
    }

    // Verifica se a data de início foi preenchida
    if (!dataInicioContrato) {
        throw new Error("Informe a data de início do contrato.");
    }

    // Verifica se o valor mensal é válido
    if (
        valorMensal === "" ||
        !Number.isFinite(Number(valorMensal)) ||
        Number(valorMensal) < 0
    ) {
        throw new Error("Informe um valor mensal válido.");
    }

    // Organiza os dados conforme o schema do FastAPI
    const dadosContrato = {
        id_aluno: Number(idAluno),
        id_plano: Number(planoSelecionado),
        data_inicio: dataInicioContrato,
        valor_mensal: Number(valorMensal).toFixed(2)
    };

    // Envia os dados para o backend
    const contratoCriado = await apiRequest("/contratos/", {
        method: "POST",
        body: JSON.stringify(dadosContrato)
    });

    // Confirma que a API retornou o contrato criado
    if (!contratoCriado?.id_contrato) {
        throw new Error(
            "A API não confirmou a criação do contrato. " +
            "Verifique os contratos cadastrados antes de tentar novamente."
        );
    }

    console.log("Contrato criado:", contratoCriado);

    return contratoCriado;
}

    // Exclui um aluno após confirmação
    async function excluirAluno(id) {
        if (!window.confirm("Tem certeza que deseja excluir este aluno?")) {
            return;
        }

        try {
            await apiRequest(`/alunos/${id}`, { method: "DELETE" });
            const dadosAtualizados = await apiRequest("/alunos/");
            setAlunos(dadosAtualizados);

            if (alunoEditando === id) {
                limparFormulario();
            }

            alert("Aluno excluído com sucesso!");
        } catch (erro) {
            console.error("Erro ao excluir aluno:", erro);
            alert(erro.message || "Não foi possível excluir o aluno.");
        }
    }

    return (
        <div className="pagina-alunos">
            <div className="titulo-pagina">
                <h2>Gerenciamento de Alunos</h2>
                <p>Cadastre e gerencie os alunos do sistema.</p>
            </div>

            <div className="painel-pagina">
                <h3>{alunoEditando !== null ? "Editar aluno" : "Dados do aluno"}</h3>

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
                                <option key={item.id_responsavel} value={item.id_responsavel}>
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

                    {/* Matrícula disponível apenas no cadastro de novos alunos */}
                    {alunoEditando === null && (
                        <div className="campo">
                            <label
                                htmlFor="realizarMatricula"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    gap: "8px",
                                    width: "fit-content",
                                    cursor: "pointer"
                                }}
                            >
                                <input
                                    id="realizarMatricula"
                                    type="checkbox"
                                    checked={realizarMatricula}
                                    onChange={(evento) => setRealizarMatricula(evento.target.checked)}
                                    style={{ width: "auto", margin: 0, flex: "none" }}
                                />
                                Realizar matrícula do aluno
                            </label>
                        </div>
                    )}

                    {/* Exibe os dados do contrato somente quando a matrícula está marcada */}
                    {realizarMatricula && alunoEditando === null && (
                        <>
                            <div className="campo">
                                <label htmlFor="plano">Plano de aulas</label>
                                <select
                                    id="plano"
                                    value={planoSelecionado}
                                    onChange={(evento) => setPlanoSelecionado(evento.target.value)}
                                >
                                    <option value="">Selecione um plano</option>
                                    {planos
                                        .filter((plano) => plano.ativo === true)
                                        .map((plano) => (
                                            <option key={plano.id_plano} value={plano.id_plano}>
                                                {plano.nome} - {plano.aulas_por_semana} aula(s) por semana
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="campo">
                                <label htmlFor="dataInicioContrato">Data de início do contrato</label>
                                <input
                                    id="dataInicioContrato"
                                    type="date"
                                    value={dataInicioContrato}
                                    onChange={(evento) => setDataInicioContrato(evento.target.value)}
                                />
                            </div>

                            <div className="campo">
                                <label htmlFor="valorMensal">Valor mensal (R$)</label>
                                <input
                                    id="valorMensal"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={valorMensal}
                                    onChange={(evento) => setValorMensal(evento.target.value)}
                                    placeholder="Ex.: 150.00"
                                />
                            </div>
                           
                        </>
                    )}

                    <div className="acoes-formulario">
                        <button type="submit">
                            {alunoEditando !== null ? "Salvar alterações" : "Cadastrar aluno"}
                        </button>

                        {alunoEditando !== null && (
                            <button type="button" onClick={limparFormulario}>
                                Cancelar edição
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="painel-pagina">
                <h3>Alunos cadastrados</h3>

                {alunos.length === 0 ? (
                    <p className="mensagem-lista">Nenhum aluno cadastrado.</p>
                ) : (
                    <section className="lista-alunos">
                        {alunos.map((aluno) => (
                            <article className="item-aluno" key={aluno.id_aluno}>
                                <h4>{aluno.nome}</h4>
                                <p><strong>Data de nascimento: </strong>{aluno.data_nascimento || "Não informado"}</p>
                                <p>
                                    <strong>Responsável: </strong>
                                    {responsaveis.find((item) => item.id_responsavel === aluno.id_responsavel)?.nome || "Não informado"}
                                </p>
                                <p><strong>Sexo: </strong>{aluno.sexo || "Não informado"}</p>
                                <p><strong>Endereço: </strong>{aluno.endereco || "Não informado"}</p>
                                <p><strong>Bairro: </strong>{aluno.bairro || "Não informado"}</p>
                                <p><strong>Cidade: </strong>{aluno.cidade || "Não informado"}</p>
                                <p><strong>Observações: </strong>{aluno.observacoes || "Nenhuma"}</p>
                                <button type="button" onClick={() => editarAluno(aluno)}>Editar</button>
                                <button type="button" onClick={() => excluirAluno(aluno.id_aluno)}>Excluir</button>
                            </article>
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
}

export default Alunos;
