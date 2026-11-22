import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Importa a função de comunicação com o backend
import apiRequest from "../services/api";
import "../styles/Login.css";


function Cadastro() {

    // Armazena os dados digitados no formulário
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    // Controla as mensagens e o carregamento
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    // Permite navegar entre páginas
    const navigate = useNavigate();

   // Valida os dados e cadastra o usuário no FastAPI
async function cadastrarUsuario(evento) {
    evento.preventDefault();

    // Limpa mensagens anteriores
    setErro("");

    // Verifica se as senhas são iguais
    if (senha !== confirmarSenha) {
        setErro("As senhas não coincidem.");
        return;
    }

    // Verifica o tamanho mínimo da senha
    if (senha.length < 8) {
        setErro("A senha deve ter pelo menos 8 caracteres.");
        return;
    }

    // Impede novos cliques durante o cadastro
    if (carregando) {
        return;
    }

    setCarregando(true);

    try {

        // Organiza os dados esperados pelo FastAPI
        const dadosUsuario = {
            nome: nome.trim(),
            email: email.trim(),
            senha: senha,
            tipo_usuario: "PROFESSOR"
        };

        // Envia os dados para o backend
        await apiRequest("/usuarios/", {
            method: "POST",
            body: JSON.stringify(dadosUsuario)
        });

        // Confirma que o cadastro foi realizado
        alert("Conta criada com sucesso! Faça login para continuar.");

        // Direciona o usuário para a tela de login
        navigate("/login");

    } catch (erroCadastro) {

        // Registra o erro no console
        console.error(
            "Erro ao cadastrar usuário:",
            erroCadastro
        );

        // Apresenta a mensagem de erro
        setErro(
            erroCadastro.message ||
            "Não foi possível criar a conta."
        );

    } finally {

        // Libera o botão após a operação
        setCarregando(false);
    }
}

    return (
        <div className="pagina-login">

            <div className="painel-login">

                <h1>AulaConnect</h1>

                <p>Crie sua conta para acessar o sistema</p>

                <form onSubmit={cadastrarUsuario}>

                    {/* Nome completo */}
                    <div className="campo">
                        <label htmlFor="nomeCadastro">
                            Nome completo
                        </label>

                        <input
                            id="nomeCadastro"
                            type="text"
                            value={nome}
                            onChange={(evento) =>
                                setNome(evento.target.value)
                            }
                            required
                        />
                    </div>

                    {/* E-mail */}
                    <div className="campo">
                        <label htmlFor="emailCadastro">
                            E-mail
                        </label>

                        <input
                            id="emailCadastro"
                            type="email"
                            value={email}
                            onChange={(evento) =>
                                setEmail(evento.target.value)
                            }
                            required
                        />
                    </div>

                    {/* Senha */}
                    <div className="campo">
                        <label htmlFor="senhaCadastro">
                            Senha
                        </label>

                        <input
                            id="senhaCadastro"
                            type="password"
                            value={senha}
                            onChange={(evento) =>
                                setSenha(evento.target.value)
                            }
                            minLength={8}
                            required
                        />
                    </div>

                    {/* Confirmação da senha */}
                    <div className="campo">
                        <label htmlFor="confirmarSenha">
                            Confirmar senha
                        </label>

                        <input
                            id="confirmarSenha"
                            type="password"
                            value={confirmarSenha}
                            onChange={(evento) =>
                                setConfirmarSenha(evento.target.value)
                            }
                            required
                        />
                    </div>

                    {/* Mensagem de erro */}
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
                            ? "Cadastrando..."
                            : "Criar conta"}
                    </button>

                </form>

                {/* Retorno para o login */}
                <div className="opcoes-login">
                    <p>Já possui uma conta?</p>

                    <Link to="/login">
                        Fazer login
                    </Link>
                </div>

            </div>

        </div>
    );
}

export default Cadastro;