function MenuLateral() {
    return(
        <aside className="menu-lateral">
       {/* Nome do sistema */}
      <h1 className="logo">AulaConnect</h1>

      {/* Opções de navegação */}
      <nav>
        <a href="#">Início</a>
        <a href="#">Alunos</a>
        <a href="#">Responsáveis</a>
        <a href="#">Aulas</a>
        <a href="#">Agendamentos</a>
        <a href="#">Pagamentos</a>
        <a href="#">Evoluções</a>
        <a href="#">Notificações</a>
      </nav>   
    
    </aside>
    )
}

export default MenuLateral