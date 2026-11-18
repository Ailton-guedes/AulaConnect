// Importa os recursos necessários do React
import { useState } from "react";

// Importa a função responsável pela comunicação com o FastAPI
import apiRequest from "../../services/api";

// Componente responsável pela geração de agendamentos
function GerarAgendamentosAluno({ 
    idContrato,
    onAgendamentosGerados
}) {

    // Controla o processamento da solicitação
    const [gerando, setGerando] = useState(false);

    // Armazena mensagens de sucesso
    const [mensagem, setMensagem] = useState("");

    // Armazena mensagens de erro
    const [erro, setErro] = useState("");

    // Solicita ao backend a geração dos agendamentos
    async function gerarAgendamentos() {

        // Impede solicitações simultâneas
        if (gerando || !idContrato) {
            return;
        }

        setGerando(true);
        setMensagem("");
        setErro("");

        try {

            // Executa a geração automática no FastAPI
            const resultado = await apiRequest(
                `/contratos/${idContrato}/gerar-agendamentos`,
                {
                    method: "POST"
                }
            );

            // Quantidade de novos agendamentos
            const criados = resultado.agendamentos_criados ?? 0;

            // Quantidade de agendamentos já existentes
            const existentes = resultado.agendamentos_existentes ?? 0;

            // Informa o resultado da operação
            setMensagem(
                `Geração concluída! ${criados} agendamento(s) criado(s) e ${existentes} já existente(s).`
            );

            // Avisa o componente pai que os agendamentos foram processados
            if (onAgendamentosGerados) {
                onAgendamentosGerados();
            }

        } catch (erroGeracao) {

            // Registra o erro para facilitar a investigação
            console.error(
                "Erro ao gerar agendamentos:",
                erroGeracao
            );

            // Exibe a mensagem de erro na tela
            setErro(
                erroGeracao.message ||
                "Não foi possível gerar os agendamentos."
            );

        } finally {

            // Libera o botão após finalizar a solicitação
            setGerando(false);
        }
    }

    return (
        <div className="geracao-agendamentos">

            <h4>Agendamentos do contrato</h4>

            <p>
                Gere automaticamente as aulas conforme os
                horários semanais e o período do contrato.
            </p>

            <button
                type="button"
                onClick={gerarAgendamentos}
                disabled={gerando || !idContrato}
            >
                {gerando
                    ? "Gerando agendamentos..."
                    : "Gerar agendamentos"}
            </button>

            {mensagem && (
                <p role="status" style={{ color: "#15803d" }}>
                    {mensagem}
                </p>
            )}

            {erro && (
                <p role="alert" style={{ color: "#b91c1c" }}>
                    {erro}
                </p>
            )}

        </div>
    );
}

export default GerarAgendamentosAluno;