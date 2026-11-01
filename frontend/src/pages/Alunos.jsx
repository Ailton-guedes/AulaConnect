import { useState } from "react"

function Alunos() {

  // Guarda a lista de alunos cadastrados
  const [alunos, setAlunos] = useState ([])

  // Guarda os dados digitados no formulario
  const [nome, setNome] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')

  const [alunoEditando, setAlunoEditando] = useState(null)

  // Função responsável por cadastrar ou editar um aluno
function cadastrarAluno(evento) {

  // Impede que a página seja recarregada
  evento.preventDefault()

  // Verifica os campos obrigatórios
  if (!nome.trim() || !nascimento || !responsavel.trim()) {
    alert('Preencha os campos obrigatórios.')
    return
  }

  // Cria o objeto com os dados do aluno
  const novoAluno = {
    id: alunoEditando !== null ? alunoEditando : Date.now(),
    nome,
    nascimento,
    responsavel,
    telefone,
    email
  }

  // Verifica se estamos editando ou cadastrando
  if (alunoEditando !== null) {

    // Atualiza o aluno existente
    setAlunos(
      alunos.map((aluno) =>
        aluno.id === alunoEditando ? novoAluno : aluno
      )
    )

    alert('Aluno atualizado com sucesso!')

  } else {

    // Adiciona um novo aluno à lista
    setAlunos([...alunos, novoAluno])

    alert('Aluno cadastrado com sucesso!')
  }

  // Limpa todos os campos do formulário
  setNome('')
  setNascimento('')
  setResponsavel('')
  setTelefone('')
  setEmail('')

  // Finaliza o modo de edição
  setAlunoEditando(null)
}

  // Função responsável por excluir um aluno
  function excluirAluno(id) {
    // Pede confirmação antes de excluir
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este aluno?'
    )

    // Se o usuário cancelar, interrompe a exclusão
    if (!confirmar){
      return
    }

    // Remove o aluno selecionado da lista
    setAlunos(alunos.filter((aluno) => aluno.id !== id))

    alert('Aluno excluido com sucesso!')
  }

  //Função responsável por carregar os dados do aluno para edição
  function editarAluno(aluno) {
    setAlunoEditando(aluno.id)

    // Preenche os campos com os dados atuias do aluno
    setNome(aluno.nome)
    setNascimento(aluno.nascimento)
    setResponsavel(aluno.responsavel)
    setTelefone(aluno.telefone)
    setEmail(aluno.email)
  }



  return (
    <section className="pagina-alunos">

      {/* Título da página */}
      <div className="titulo-pagina">
        <div>
          <h2>Alunos</h2>
          <p>Cadastre e gerencie os alunos.</p>
        </div>
      </div>

      {/* Formulário de cadastro */}
      <div className="painel-alunos">

        <h3>Cadastrar novo aluno</h3>

        <form className="formulario-aluno" onSubmit={cadastrarAluno}>

          <div className="campo">
            <label htmlFor="nome">Nome do aluno</label>
            <input
              type="text"
              id="nome"
              placeholder="Digite o nome completo"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="nascimento">Data de nascimento</label>
            <input
              type="date"
              id="nascimento"
              value={nascimento}
              onChange={(evento) => setNascimento(evento.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="responsavel">Responsável</label>
            <input
              type="text"
              id="responsavel"
              placeholder="Nome do responsável"
              value={responsavel}
              onChange={(evento) => setResponsavel(evento.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(evento) => setTelefone(evento.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="Digite o e-mail"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
            />
          </div>

          <div className="acoes-formulario">
            <button type="submit">
              {alunoEditando !== null ? 'Salvar alterações' : 'Cadastrar aluno'}
            </button>
          </div>

        </form>

      </div>

      {/* Área de listagem */}
      <div className="painel-alunos">

        <h3>Alunos cadastrados</h3>

        {alunos.length === 0 ? (

        <p>
          Nenhum aluno cadastrado.
        </p>
        ): (
          <div className="lista-alunos">

            {alunos.map((aluno) => (
              <article className="item-aluno" key={aluno.id}>

              <h4>{aluno.nome}</h4>

              <p>
                <strong>Data de nascimento:</strong> {aluno.nascimento}
              </p>

              <p>
                <strong>Responsavel:</strong> {aluno.responsavel}
              </p>

              <p>
                <strong>Telefone:</strong> {aluno.telefone || 'Não informado'}
              </p>

              <p>
                <strong>Email</strong> {aluno.email || 'Não informado'}
              </p>

              {/* Botão para editar o aluno */}
              <button 
              type="button"
              onClick={() => editarAluno(aluno)}
              >
                Editar
              </button>

              {/* Botão para excluir o aluno */}
              <button
              type="button"
              onClick={() => excluirAluno(aluno.id)}
              >
                Excluir
              </button>
            </article>
            ))} 

          </div>
        )

        }

      </div>

    </section>
  )
}

export default Alunos