
function EditarAluno({
    nome,
    setNome,
    nascimento,
    setNascimento,
    endereco,
    setEndereco,
    bairro,
    setBairro,
    cidade,
    setCidade,
    responsavel,
    setResponsavel,
    responsaveis,
    sexo,
    setSexo,
    observacoes,
    setObservacoes
}) {
    return (
        <div className="campo">
            <label htmlFor="nome">Nome do aluno</label>
            <input
                id="nome"
                type="text"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                required
            />

            <label htmlFor="nascimento">
                Data de nascimento
            </label>
            <input
                id="nascimento"
                type="date"
                value={nascimento}
                onChange={(evento) =>
                    setNascimento(evento.target.value)
                }
            />

            <label htmlFor="endereco">Endereço</label>
            <input
                id="endereco"
                type="text"
                value={endereco}
                onChange={(evento) =>
                    setEndereco(evento.target.value)
                }
            />

{/* Bairro do aluno */}
<label htmlFor="bairro">Bairro</label>
<input
    id="bairro"
    type="text"
    value={bairro}
    onChange={(evento) => setBairro(evento.target.value)}
/>

{/* Cidade do aluno */}
<label htmlFor="cidade">Cidade</label>
<input
    id="cidade"
    type="text"
    value={cidade}
    onChange={(evento) => setCidade(evento.target.value)}
/>

{/* Responsável vinculado ao aluno */}
<label htmlFor="responsavel">Responsável</label>
<select
    id="responsavel"
    value={responsavel}
    onChange={(evento) => setResponsavel(evento.target.value)}
>
    <option value="">Selecione um responsável</option>

    {responsaveis.map((item) => (
        <option
            key={item.id_responsavel}
            value={item.id_responsavel}
        >
            {item.nome}
        </option>
    ))}
</select>

{/* Sexo do aluno */}
<label htmlFor="sexo">Sexo</label>
<select
    id="sexo"
    value={sexo}
    onChange={(evento) => setSexo(evento.target.value)}
>
    <option value="">Selecione</option>
    <option value="Feminino">Feminino</option>
    <option value="Masculino">Masculino</option>
    <option value="Outro">Outro</option>
</select>

{/* Observações adicionais */}
<label htmlFor="observacoes">Observações</label>
<textarea
    id="observacoes"
    value={observacoes}
    onChange={(evento) => setObservacoes(evento.target.value)}
    placeholder="Informações adicionais sobre o aluno"
/>

        </div>
    );
}

export default EditarAluno;
