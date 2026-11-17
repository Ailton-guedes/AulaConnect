
import { useEffect, useState } from "react";
import apiRequest from "../../services/api";

// Dias da semana conforme a numeração do backend
const diasSemana = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado"
];

// Valores iniciais do formulário
const formularioInicial = {
    dia_semana: "0",
    horario_inicio: "",
    duracao_minutos: "40",
    deslocamento_minutos: "30"
};

// Consulta e gerencia os horários semanais do contrato
function EditarHorariosAluno({ idContrato, idPlano }) {

    // Horários cadastrados no contrato
    const [horarios, setHorarios] = useState([]);

    // Plano vinculado ao contrato
    const [plano, setPlano] = useState(null);

    // Estados de carregamento
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    // Mensagens exibidas na tela
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    // Controla se o usuário está adicionando ou editando
    const [modo, setModo] = useState(null);

    // Identifica o horário em edição
    const [horarioEditando, setHorarioEditando] = useState(null);

    // Campos do formulário
    const [formulario, setFormulario] = useState(formularioInicial);

    // Consulta os horários e o plano no backend
    useEffect(() => {

        let consultaAtiva = true;

        async function carregarDados() {

            setCarregando(true);
            setErro("");
            setMensagem("");
            setModo(null);
            setHorarioEditando(null);
            setHorarios([]);
            setPlano(null);

            if (!idContrato || !idPlano) {
                setErro("Contrato ou plano não informado.");
                setCarregando(false);
                return;
            }

            try {

                // Consulta os horários do contrato
                // e os planos cadastrados
                const [dadosHorarios, dadosPlanos] = await Promise.all([
                    apiRequest(
                        `/horarios-contrato/contrato/${idContrato}`
                    ),
                    apiRequest("/planos/")
                ]);

                // Localiza o plano vinculado ao contrato
                const planoEncontrado = Array.isArray(dadosPlanos)
                    ? dadosPlanos.find(
                        (item) => Number(item.id_plano) === Number(idPlano)
                    )
                    : null;

                if (!planoEncontrado) {
                    throw new Error("Plano do contrato não encontrado.");
                }

                if (consultaAtiva) {
                    setHorarios(
                        Array.isArray(dadosHorarios) ? dadosHorarios : []
                    );
                    setPlano(planoEncontrado);
                }

            } catch (erroConsulta) {

                console.error("Erro ao consultar horários:", erroConsulta);

                if (consultaAtiva) {
                    setErro(
                        erroConsulta.message ||
                        "Não foi possível carregar os dados."
                    );
                }

            } finally {

                if (consultaAtiva) {
                    setCarregando(false);
                }
            }
        }

        carregarDados();

        return () => {
            consultaAtiva = false;
        };

    }, [idContrato, idPlano]);

    // Atualiza um campo do formulário
    function atualizarCampo(campo, valor) {

        setFormulario((anterior) => ({
            ...anterior,
            [campo]: valor
        }));
    }

    // Abre o formulário para cadastrar um novo horário
    function iniciarCadastro() {

        setFormulario({ ...formularioInicial });
        setHorarioEditando(null);
        setModo("adicionar");
        setErro("");
        setMensagem("");
    }

    // Abre o formulário com os dados do horário existente
    function iniciarEdicao(horario) {

        setFormulario({
            dia_semana: String(horario.dia_semana),
            horario_inicio: horario.horario_inicio
                ? horario.horario_inicio.slice(0, 5)
                : "",
            duracao_minutos: String(horario.duracao_minutos ?? 40),
            deslocamento_minutos: String(
                horario.deslocamento_minutos ?? 30
            )
        });

        setHorarioEditando(horario.id_horario);
        setModo("editar");
        setErro("");
        setMensagem("");
    }

    // Fecha o formulário sem salvar alterações
    function cancelar() {

        setModo(null);
        setHorarioEditando(null);
        setFormulario({ ...formularioInicial });
        setErro("");
    }

    // Cadastra ou atualiza o horário no FastAPI
    async function salvarHorario() {

        if (salvando || !modo || !plano) {
            return;
        }

        if (!formulario.horario_inicio) {
            setErro("Informe o horário de início.");
            return;
        }

        // Confere o limite semanal antes do cadastro
        if (
            modo === "adicionar" &&
            horarios.length >= plano.aulas_por_semana
        ) {
            setErro("O plano já atingiu o limite semanal de aulas.");
            return;
        }

        // Monta os dados esperados pelo backend
        const dados = {
            dia_semana: Number(formulario.dia_semana),
            horario_inicio: formulario.horario_inicio,
            duracao_minutos: Number(formulario.duracao_minutos),
            deslocamento_minutos: Number(formulario.deslocamento_minutos)
        };

        setSalvando(true);
        setErro("");
        setMensagem("");

        try {

            if (modo === "adicionar") {

                // Inclui os dados exigidos pelo POST
                await apiRequest("/horarios-contrato/", {
                    method: "POST",
                    body: JSON.stringify({
                        id_contrato: Number(idContrato),
                        id_aula: null,
                        ...dados
                    })
                });

            } else if (modo === "editar") {

                // Atualiza um horário existente
                await apiRequest(
                    `/horarios-contrato/${horarioEditando}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(dados)
                    }
                );
            }

            // Recarrega os horários diretamente do MySQL
            const horariosAtualizados = await apiRequest(
                `/horarios-contrato/contrato/${idContrato}`
            );

            setHorarios(
                Array.isArray(horariosAtualizados)
                    ? horariosAtualizados
                    : []
            );

            setMensagem(
                modo === "adicionar"
                    ? "Horário cadastrado com sucesso!"
                    : "Horário atualizado com sucesso!"
            );

            setModo(null);
            setHorarioEditando(null);

        } catch (erroSalvar) {

            console.error("Erro ao salvar horário:", erroSalvar);

            setErro(
                erroSalvar.message ||
                "Não foi possível salvar o horário."
            );

        } finally {

            setSalvando(false);
        }
    }

    // Quantidade de aulas permitidas pelo plano
    const limiteSemanal = plano?.aulas_por_semana;

    // Verifica se ainda é possível adicionar horários
    const podeAdicionar =
        Number.isInteger(limiteSemanal) &&
        horarios.length < limiteSemanal;

    // Formulário compartilhado entre cadastro e edição
    const formularioHorario = modo && (
        <div className="formulario-horario">

            <h4>
                {modo === "adicionar"
                    ? "Adicionar horário"
                    : "Editar horário"}
            </h4>

            {/* Dia da semana */}
            <div className="campo">
                <label>Dia da semana</label>

                <select
                    value={formulario.dia_semana}
                    onChange={(e) =>
                        atualizarCampo("dia_semana", e.target.value)
                    }
                    disabled={salvando}
                >
                    {diasSemana.map((dia, indice) => (
                        <option key={indice} value={indice}>
                            {dia}
                        </option>
                    ))}
                </select>
            </div>

            {/* Horário de início */}
            <div className="campo">
                <label>Horário de início</label>

                <input
                    type="time"
                    value={formulario.horario_inicio}
                    onChange={(e) =>
                        atualizarCampo("horario_inicio", e.target.value)
                    }
                    disabled={salvando}
                    required
                />
            </div>

            {/* Duração da aula */}
            <div className="campo">
                <label>Duração da aula</label>

                <select
                    value={formulario.duracao_minutos}
                    onChange={(e) =>
                        atualizarCampo("duracao_minutos", e.target.value)
                    }
                    disabled={salvando}
                >
                    <option value="30">30 minutos</option>
                    <option value="35">35 minutos</option>
                    <option value="40">40 minutos</option>
                </select>
            </div>

            {/* Tempo de deslocamento */}
            <div className="campo">
                <label>Deslocamento</label>

                <select
                    value={formulario.deslocamento_minutos}
                    onChange={(e) =>
                        atualizarCampo(
                            "deslocamento_minutos",
                            e.target.value
                        )
                    }
                    disabled={salvando}
                >
                    <option value="20">20 minutos</option>
                    <option value="25">25 minutos</option>
                    <option value="30">30 minutos</option>
                </select>
            </div>

            {/* Botões com type button para não enviar
                o formulário principal do aluno */}
            <div className="acoes-formulario">

                <button
                    type="button"
                    onClick={salvarHorario}
                    disabled={salvando}
                >
                    {salvando ? "Salvando..." : "Salvar horário"}
                </button>

                <button
                    type="button"
                    onClick={cancelar}
                    disabled={salvando}
                >
                    Cancelar
                </button>

            </div>
        </div>
    );

    return (
        <div className="campo">

            <h3>Horários das aulas</h3>

            {/* Mostra as mensagens da operação */}
            {erro && (
                <p role="alert" style={{ color: "#b91c1c" }}>
                    {erro}
                </p>
            )}

            {mensagem && (
                <p role="status" style={{ color: "#15803d" }}>
                    {mensagem}
                </p>
            )}

            {carregando ? (

                <p>Carregando horários...</p>

            ) : plano ? (

                <>
                    {/* Resumo do plano contratado */}
                    <p>
                        <strong>Plano: </strong>
                        {plano.nome}
                    </p>

                    <p>
                        <strong>Horários cadastrados: </strong>
                        {horarios.length} de {limiteSemanal ?? "não definido"}
                    </p>

                    {/* Lista os horários cadastrados */}
                    <div className="lista-horarios">

                        {horarios.map((horario) => (

                            <div
                                className="item-horario"
                                key={horario.id_horario}
                            >
                                <p>
                                    <strong>Dia: </strong>
                                    {diasSemana[horario.dia_semana]}
                                </p>

                                <p>
                                    <strong>Horário: </strong>
                                    {horario.horario_inicio?.slice(0, 5)}
                                </p>

                                <p>
                                    <strong>Duração: </strong>
                                    {horario.duracao_minutos ?? "Não informado"}
                                    {" minutos"}
                                </p>

                                <p>
                                    <strong>Deslocamento: </strong>
                                    {horario.deslocamento_minutos ?? 30}
                                    {" minutos"}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => iniciarEdicao(horario)}
                                    disabled={salvando || modo !== null}
                                >
                                    Editar horário
                                </button>

                            </div>
                        ))}

                    </div>

                    {/* Exibe o formulário de cadastro ou edição */}
                    {formularioHorario}

                    {/* Permite adicionar até atingir o limite do plano */}
                    {podeAdicionar && modo === null && (
                        <button
                            type="button"
                            onClick={iniciarCadastro}
                            disabled={salvando}
                        >
                            + Adicionar horário
                        </button>
                    )}

                    {/* Informa quando todos os horários estão cadastrados */}
                    {!podeAdicionar &&
                        Number.isInteger(limiteSemanal) && (
                            <p>
                                Todos os horários semanais do plano
                                estão cadastrados.
                            </p>
                        )}
                </>

            ) : null}

        </div>
    );
}

export default EditarHorariosAluno;
