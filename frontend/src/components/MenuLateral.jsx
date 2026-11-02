import { NavLink } from "react-router-dom"

function MenuLateral() {
    return(
        <aside className="menu-lateral">
       {/* Nome do sistema */}
      <h1 className="logo">AulaConnect</h1>

      {/* Opções de navegação */}
     <nav>
      <NavLink to="/">Início</NavLink>
      <NavLink to="/alunos">Alunos</NavLink>
      <NavLink to="/responsaveis">Responsáveis</NavLink>
      <NavLink to="/aulas">Aulas</NavLink>
      <NavLink to="/agendamentos">Agendamentos</NavLink>
      <NavLink to="/pagamentos">Pagamentos</NavLink>
      <NavLink to="/evolucoes">Evoluções</NavLink>
      <NavLink to="/notificacoes">Notificações</NavLink>
  </nav>
    
    </aside>
    )
}

export default MenuLateral