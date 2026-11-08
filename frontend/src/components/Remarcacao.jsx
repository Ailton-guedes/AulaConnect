
import { useState } from 'react';

// Componente responsável pelo formulário de remarcação
function Remarcacao({ agendamento, nomeAluno, aoFechar }) {

  // Guarda a data selecionada
  const [novaData, setNovaData] = useState(
    agendamento.data_aula
  );

  // Guarda o horário selecionado
  const [novoHorario, setNovoHorario] = useState(
    agendamento.horario_inicio?.slice(0, 5) || ''
  );

  return (
    <div className="agenda-formulario-remarcacao">

      <h3>Remarcar aula</h3>

      <p>Aluno: {nomeAluno}</p>

      <div className="agenda-campos-remarcacao">

        {/* Campo da nova data */}
        <div>
          <label htmlFor="nova-data-aula">
            Nova data
          </label>

          <input
            id="nova-data-aula"
            type="date"
            value={novaData}
            onChange={(e) => setNovaData(e.target.value)}
          />
        </div>

        {/* Campo do novo horário */}
        <div>
          <label htmlFor="novo-horario-aula">
            Novo horário
          </label>

          <input
            id="novo-horario-aula"
            type="time"
            value={novoHorario}
            onChange={(e) => setNovoHorario(e.target.value)}
          />
        </div>

      </div>

      <div className="agenda-acoes-remarcacao">
        <button
          type="button"
          onClick={aoFechar}
        >
          Fechar
        </button>
      </div>

    </div>
  );
}

export default Remarcacao;
