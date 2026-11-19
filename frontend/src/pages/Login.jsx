
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {

    // Controla os dados digitados
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    // Controla mensagens e carregamento
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    // Permite navegar entre páginas
    const navigate = useNavigate();

    // Realiza o login no FastAPI
    async function realizarLogin(evento) {
        evento.preventDefault();

        setErro("");
        setCarregando(true);

        try {

            // OAuth2PasswordRequestForm exige dados de formulário
            const dadosLogin = new URLSearchParams();

            dadosLogin.append("username", email);
            dadosLogin.append("password", senha);

            const resposta = await fetch(
                "http://127.0.0.1:8000/usuarios/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },
                    body: dadosLogin
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    typeof dados.detail === "string"
                        ? dados.detail
                        : "Não foi possível realizar o login."
                );
            }

            if (!dados.access_token) {
                throw new Error(
                    "O servidor não retornou um token de acesso."
                );
            }

            // Guarda o token durante a sessão do navegador
            sessionStorage.setItem(
                "access_token",
                dados.access_token
            );

            // Abre o painel inicial
            navigate("/", { replace: true });

        } catch (erroLogin) {

            setErro(
                erroLogin.message ||
                "Erro ao conectar com o servidor."
            );

        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="pagina-login">

            <div className="painel-login">

                <h1>AulaConnect</h1>

                <p>Entre para acessar o sistema</p>

                <form onSubmit={realizarLogin}>

                    <div className="campo">
                        <label htmlFor="emailLogin">
                            E-mail
                        </label>

                        <input
                            id="emailLogin"
                            type="email"
                            value={email}
                            onChange={(evento) =>
                                setEmail(evento.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="senhaLogin">
                            Senha
                        </label>

                        <input
                            id="senhaLogin"
                            type="password"
                            value={senha}
                            onChange={(evento) =>
                                setSenha(evento.target.value)
                            }
                            required
                        />
                    </div>
{/* Acesso à futura recuperação de senha */}
<div className="recuperar-senha">

    <Link to="/recuperar-senha">
        Esqueci minha senha
    </Link>

</div>
                    {erro && (
                        <p role="alert" className="erro-login">
                            {erro}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={carregando}
                    >
                        {carregando
                            ? "Entrando..."
                            : "Entrar"}
                    </button>
{/* Opção para novos usuários se cadastrarem */}
<div className="opcoes-login">

    <p>
        Ainda não possui uma conta?
    </p>

    <Link to="/cadastro">
        Criar nova conta
    </Link>

</div>
                </form>

            </div>

        </div>
    );
}

export default Login;
