
import { useEffect, useState } from "react";
import apiRequest from "../../services/api";

// Componente responsável por consultar e mostrar
// os horários vinculados ao contrato do aluno
function EditarHorariosAluno({ idContrato }) {

    // Armazena os horários recebidos do backend
    const [horarios, setHorarios] = useState([]);

    // Controla o carregamento dos dados
    const [carregando, setCarregando] = useState(false);

    // Armazena uma possível mensagem de erro
    const [erro, setErro] = useState("");

    // Nomes dos dias conforme a numeração do backend
    // 0 = segunda-feira, 1 = terça-feira, etc.
    const diasSemana = [
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado",
        "Domingo"
    ];

    // Busca os horários sempre que o contrato mudar
    useEffect(() => {

        // Evita atualizar a tela com uma consulta antiga
        let consultaAtiva = true;

        // Limpa os horários e o erro do contrato anterior
        setHorarios([]);
        setErro("");

        // Não consulta sem um contrato válido
        if (!idContrato) {
            setCarregando(false);
            return;
        }

        // Função responsável pela consulta ao FastAPI
        async function carregarHorarios() {

            setCarregando(true);

            try {

                // Busca os horários do contrato selecionado
                const dados = await apiRequest(
                    `/horarios-contrato/contrato/${idContrato}`
                );

                // Atualiza somente se a consulta ainda for válida
                if (consultaAtiva) {
                    setHorarios(
                        Array.isArray(dados) ? dados : []
                    );
                }

            } catch (erroConsulta) {

                console.error(
                    "Erro ao carregar horários:",
                    erroConsulta
                );

                if (consultaAtiva) {
                    setErro(
                        erroConsulta.message ||
                        "Não foi possível carregar os horários."
                    );
                }

            } finally {

                if (consultaAtiva) {
                    setCarregando(false);
                }
            }
        }

        carregarHorarios();

        // Ignora resultados antigos quando o contrato mudar
        // ou quando o componente for desmontado
        return () => {
            consultaAtiva = false;
        };

    }, [idContrato]);

    return (
        <div className="campo">

            <h3>Horários das aulas</h3>

            {/* Mensagem durante o carregamento */}
            {carregando ? (

                <p>Carregando horários...</p>

            ) : erro ? (

                // Mostra o erro sem confundir com lista vazia
                <p role="alert">{erro}</p>

            ) : horarios.length === 0 ? (

                // Mensagem quando não existem horários
                <p>
                    Nenhum horário cadastrado neste contrato.
                </p>

            ) : (

                // Lista os horários recebidos do backend
                <div className="lista-horarios">

                    {horarios.map((horario) => (

                        <div
                            className="item-horario"
                            key={horario.id_horario}
                        >

                            {/* Dia da semana */}
                            <p>
                                <strong>Dia: </strong>
                                {diasSemana[horario.dia_semana] ||
                                    "Não informado"}
                            </p>

                            {/* Horário de início */}
                            <p>
                                <strong>Horário: </strong>
                                {horario.horario_inicio
                                    ? horario.horario_inicio.slice(0, 5)
                                    : "Não informado"}
                            </p>

                            {/* Duração da aula */}
                            <p>
                                <strong>Duração da aula: </strong>
                                {horario.duracao_minutos ?? "Não informado"}
                                {" minutos"}
                            </p>

                            {/* Tempo de deslocamento */}
                            <p>
                                <strong>Deslocamento: </strong>
                                {horario.deslocamento_minutos ?? "Não informado"}
                                {" minutos"}
                            </p>

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}

export default EditarHorariosAluno;
