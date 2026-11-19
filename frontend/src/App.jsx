
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Componentes do layout
import MenuLateral from "./components/MenuLateral";
import Cabecalho from "./components/Cabecalho";

// Páginas do sistema
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import Alunos from "./pages/Alunos";
import Responsaveis from "./pages/Responsaveis";
import Aulas from "./pages/Aulas";
import Agendamentos from "./pages/Agendamentos";
import Frequencia from "./pages/Frequencia";
import Pagamentos from "./pages/Pagamentos";
import Evolucoes from "./pages/Evolucoes";


// Verifica se existe um token JWT
function RotaProtegida() {

    const token = sessionStorage.getItem("access_token");

    // Sem token, redireciona para o login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Com token, permite acessar as páginas
    return <Outlet />;
}


// Layout das páginas internas
function LayoutSistema() {

    return (
        <div className="app">

            {/* Menu lateral */}
            <MenuLateral />

            {/* Conteúdo principal */}
            <main className="conteudo-principal">

                {/* Cabeçalho */}
                <Cabecalho />

                {/* Página selecionada */}
                <Outlet />

            </main>

        </div>
    );
}


// Componente principal
function App() {

    return (
        <Routes>

            {/* Página pública de login */}
            <Route path="/login" element={<Login />} />

            {/* Páginas protegidas */}
            <Route element={<RotaProtegida />}>

                <Route element={<LayoutSistema />}>

                    <Route path="/" element={<Inicio />} />

                    <Route path="/alunos" element={<Alunos />} />

                    <Route
                        path="/responsaveis"
                        element={<Responsaveis />}
                    />

                    <Route path="/aulas" element={<Aulas />} />

                    <Route
                        path="/agendamentos"
                        element={<Agendamentos />}
                    />

                    <Route
                        path="/frequencia"
                        element={<Frequencia />}
                    />

                    {/* Página de gerenciamento de pagamentos */}
                <Route 
                    path="/pagamentos"
                     element={<Pagamentos />} 
                />
                {/* Página de acompanhamento da evolução dos alunos */}
                    <Route 
                    path="/evolucoes"
                     element={<Evolucoes />} 
                />
                </Route>


            </Route>

            {/* Redireciona rotas inexistentes */}
            <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
    );
}

export default App;
