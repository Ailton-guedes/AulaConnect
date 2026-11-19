import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";

function RecuperarSenha() {

    // Armazena o e-mail informado
    const [email, setEmail] = useState("");

    // Controla a mensagem demonstrativa
    const [mensagem, setMensagem] = useState("");

    function solicitarRecuperacao(evento) {
        evento.preventDefault();

        // Demonstração: ainda não envia e-mails
        setMensagem(
            "Solicitação demonstrativa registrada na tela. " +
            "O envio do link de recuperação será implementado futuramente."
        );
    }

    return (
        <div className="pagina-login">

            <div className="painel-login">

                <h1>AulaConnect</h1>

                <p>Recuperação de senha</p>

                <form onSubmit={solicitarRecuperacao}>

                    <div className="campo">

                        <label htmlFor="emailRecuperacao">
                            E-mail cadastrado
                        </label>

                        <input
                            id="emailRecuperacao"
                            type="email"
                            value={email}
                            onChange={(evento) =>
                                setEmail(evento.target.value)
                            }
                            required
                        />

                    </div>

                    <button type="submit">
                        Solicitar recuperação
                    </button>

                </form>

                {mensagem && (
                    <p role="status">
                        {mensagem}
                    </p>
                )}

                <div className="opcoes-login">

                    <Link to="/login">
                        Voltar para o login
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default RecuperarSenha;