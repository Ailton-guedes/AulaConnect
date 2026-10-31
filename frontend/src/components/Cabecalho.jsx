function Cabecalho() {
    return(
        <header className="cabecalho">

            {/* Título e descrição */}
            <div className="cabecalho-info">
                <h2>Personal Kids</h2>
                <p>Gestão de aulas em sum so lugar</p>
            </div>

            {/* Campo de pesquisa */}
            <div className="pesquisa">
             <input 
                type="search"
                placeholder="Pesquisar..."
                aria-label="Pesquisar no AulaConnect" 
             />
            </div>

        </header>
    )
}

export default Cabecalho