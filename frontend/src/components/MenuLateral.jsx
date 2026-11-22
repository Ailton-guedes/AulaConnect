
import { NavLink, useNavigate } from "react-router-dom";

// Ícones utilizados no menu lateral
import {
  House,
  Users,
  UserRound,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Wallet,
  TrendingUp,
  Bell,
  LogOut
} from "lucide-react";

function MenuLateral() {

  // Permite navegar entre as páginas
  const navigate = useNavigate();

  // Encerra a sessão do usuário
  function sairDoSistema() {

    // Remove o token JWT do navegador
    sessionStorage.removeItem("access_token");

    // Redireciona para a tela de login
    navigate("/login", { replace: true });
  }

  return (
    <aside className="menu-lateral">

      {/* Nome do sistema */}
      <h1 className="logo">AulaConnect</h1>

      {/* Opções de navegação */}
      <nav>

        <NavLink to="/">
          <House size={18} />
          Início
        </NavLink>

        <NavLink to="/alunos">
          <Users size={18} />
          Alunos
        </NavLink>

        <NavLink to="/responsaveis">
          <UserRound size={18} />
          Responsáveis
        </NavLink>

        <NavLink to="/aulas">
          <BookOpen size={18} />
          Aulas
        </NavLink>

        <NavLink to="/agendamentos">
          <CalendarDays size={18} />
          Agendamentos
        </NavLink>

        {/* NOVO: Controle de frequência */}
        <NavLink to="/frequencia">
          <ClipboardCheck size={18} />
          Frequência
        </NavLink>

        <NavLink to="/pagamentos">
          <Wallet size={18} />
          Pagamentos
        </NavLink>

        <NavLink to="/evolucoes">
          <TrendingUp size={18} />
          Evoluções
        </NavLink>

        <NavLink to="/notificacoes">
          <Bell size={18} />
          Notificações
        </NavLink>

       <NavLink to="/usuarios">
          <UserRound size={18} />
          Usuários
        </NavLink>

      </nav>
{/* Botão para encerrar a sessão */}
<button
  type="button"
  className="btn-sair"
  onClick={sairDoSistema}
>
  <LogOut size={18} />
  Sair do sistema
</button>
    </aside>
  );
}

export default MenuLateral;
