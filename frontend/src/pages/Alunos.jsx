import { useEffect, useState } from "react";
import apiRequest from "../services/api";

function Alunos() {
    // Dados carregados do backend
    const [alunos, setAlunos] = useState([]);
    const [responsaveis, setResponsaveis] = useState([]);
    const [planos, setPlanos] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [professorSelecionado, setProfessorSelecionado] = useState("");

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
    const [diaSemana, setDiaSemana] = useState("");     // Dia da semana escolhido para a aula (0 = segunda-feira)
    const [horarioInicio, setHorarioInicio] = useState("");// Horário de início da aula
    const [duracaoMinutos, setDuracaoMinutos] = useState("40");// Duração da aula em minutos
    const [deslocamentoMinutos, setDeslocamentoMinutos] = useState("30");// Tempo de deslocamento após a aula
    const [horariosContrato, setHorariosContrato] = useState([]);// Lista dos horários adicionados à matrícula


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

                // Busca os usuários cadastrados
                const dadosUsuarios = await apiRequest("/usuarios/");

                // Mantém somente usuários com perfil de professor
                const listaProfessores = dadosUsuarios.filter(
                    (usuario) =>
                         usuario.tipo_usuario?.trim().toUpperCase() === "PROFESSOR"
            );

            setProfessores(listaProfessores);

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
        setProfessorSelecionado("");
        // Limpa os dados da agenda semanal
        setDiaSemana("");
        setHorarioInicio("");
        setDuracaoMinutos("40");
        setDeslocamentoMinutos("30");
        setHorariosContrato([]);    
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
        setProfessorSelecionado("");

        // A edição de dados pessoais não deve criar contratos
        setRealizarMatricula(false);
        setPlanoSelecionado("");
        setDataInicioContrato("");
        setValorMensal("");
    }


    // Adiciona um horário à lista da matrícula
    function adicionarHorario() {

        // Verifica se o dia e o horário foram informados
        if (diaSemana === "" || !horarioInicio) {
            alert("Selecione o dia e o horário da aula.");
            return;
        }

        // Impede horários duplicados na mesma matrícula
        const horarioDuplicado = horariosContrato.some(
            (item) =>
                item.dia_semana === Number(diaSemana) &&
                item.horario_inicio === horarioInicio
        );

        if (horarioDuplicado) {
            alert("Este horário já foi adicionado.");
            return;
        }

        // Monta os dados do horário
        const novoHorario = {
            dia_semana: Number(diaSemana),
            horario_inicio: horarioInicio,
            duracao_minutos: Number(duracaoMinutos),
            deslocamento_minutos: Number(deslocamentoMinutos)
        };

        // Adiciona o horário sem apagar os anteriores
        setHorariosContrato((anteriores) => [
            ...anteriores,
            novoHorario
        ]);

        // Limpa os campos para adicionar outro horário
        setDiaSemana("");
        setHorarioInicio("");
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
        // Verifica se um professor foi selecionado
        if (
            !professorSelecionado ||
            !Number.isInteger(Number(professorSelecionado)) ||
            Number(professorSelecionado) <= 0
        ) {
            alert(
                "Selecione um professor responsável pela matrícula.");
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
        id_professor: Number(professorSelecionado),
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


{/* Seleção do professor responsável pelo contrato */}
<div className="campo">
    <label htmlFor="professor">
        Professor responsável
    </label>

    <select
        id="professor"
        value={professorSelecionado}
        onChange={(evento) =>
            setProfessorSelecionado(evento.target.value)
        }
        required={realizarMatricula}
    >
        <option value="">
            Selecione um professor
        </option>

        {professores.map((professor) => (
            <option
                key={professor.id_usuario}
                value={professor.id_usuario}
            >
                {professor.nome}
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


{/* Configuração da agenda semanal do aluno */}
<div className="campo">
    <h3>Agenda semanal do aluno</h3>

    <label htmlFor="diaSemana">Dia da semana</label>
    <select
        id="diaSemana"
        value={diaSemana}
        onChange={(evento) => setDiaSemana(evento.target.value)}
    >
        <option value="">Selecione o dia</option>
        <option value="0">Segunda-feira</option>
        <option value="1">Terça-feira</option>
        <option value="2">Quarta-feira</option>
        <option value="3">Quinta-feira</option>
        <option value="4">Sexta-feira</option>
        <option value="5">Sábado</option>
    </select>
</div>

<div className="campo">
    <label htmlFor="horarioInicio">Horário de início</label>
    <input
        id="horarioInicio"
        type="time"
        value={horarioInicio}
        onChange={(evento) => setHorarioInicio(evento.target.value)}
    />
</div>

<div className="campo">
    <label htmlFor="duracaoMinutos">Duração da aula</label>
    <select
        id="duracaoMinutos"
        value={duracaoMinutos}
        onChange={(evento) => setDuracaoMinutos(evento.target.value)}
    >
        <option value="30">30 minutos</option>
        <option value="35">35 minutos</option>
        <option value="40">40 minutos</option>
    </select>
</div>

<div className="campo">
    <label htmlFor="deslocamentoMinutos">
        Tempo de deslocamento
    </label>
    <select
        id="deslocamentoMinutos"
        value={deslocamentoMinutos}
        onChange={(evento) =>
            setDeslocamentoMinutos(evento.target.value)
        }
    >
        <option value="20">20 minutos</option>
        <option value="25">25 minutos</option>
        <option value="30">30 minutos</option>
    </select>
</div>

<div className="campo">
    <button
        type="button"
        onClick={adicionarHorario}
    >
        Adicionar horário
    </button>
</div>


{/* Lista dos horários adicionados à matrícula */}
{horariosContrato.length > 0 && (
    <div className="campo">
        <h4>Horários adicionados</h4>

        {horariosContrato.map((horario, indice) => (
            <div
                key={`${horario.dia_semana}-${horario.horario_inicio}`}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: "10px"
                }}
            >
                <span>
                    {[
                        "Segunda-feira",
                        "Terça-feira",
                        "Quarta-feira",
                        "Quinta-feira",
                        "Sexta-feira",
                        "Sábado",
                        "Domingo"
                    ][horario.dia_semana]}
                    {" — "}
                    {horario.horario_inicio}
                    {" — "}
                    {horario.duracao_minutos} min de aula
                    {" + "}
                    {horario.deslocamento_minutos} min de deslocamento
                </span>

                <button
                    type="button"
                    onClick={() => {
                        setHorariosContrato((anteriores) =>
                            anteriores.filter((_, i) => i !== indice)
                        );
                    }}
                >
                    Remover
                </button>
            </div>
        ))}
    </div>
)}



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
