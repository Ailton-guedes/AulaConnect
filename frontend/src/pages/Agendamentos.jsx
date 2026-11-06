
import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

// Nomes dos dias exibidos no calendário
const nomesDias = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

// Converte uma data para o formato brasileiro
function formatarData(data) {
  return data.toLocaleDateString('pt-BR');
}

// Encontra a segunda-feira da semana informada
function obterInicioSemana(data) {
  const inicio = new Date(data);

  // Converte domingo (0) para o último dia da semana
  const diaSemana = (inicio.getDay() + 6) % 7;

  inicio.setDate(inicio.getDate() - diaSemana);
  inicio.setHours(0, 0, 0, 0);

  return inicio;
}

function Agendamentos() {

  // Guarda a segunda-feira da semana selecionada
  const [inicioSemana, setInicioSemana] = useState(
    () => obterInicioSemana(new Date())
  );

  // Avança ou retrocede a quantidade de dias informada
  function mudarSemana(dias) {
    setInicioSemana((semanaAtual) => {
      const novaSemana = new Date(semanaAtual);
      novaSemana.setDate(novaSemana.getDate() + dias);

      return novaSemana;
    });
  }

  // Cria os sete dias da semana selecionada
  const diasSemana = Array.from({ length: 6 }, (_, indice) => {
    const data = new Date(inicioSemana);
    data.setDate(data.getDate() + indice);

    return data;
  });

  // Último dia da semana
  const fimSemana = diasSemana[5];

  return (
    <section className="pagina-alunos">

      {/* Título da página */}
      <div className="titulo-pagina">
        <h2>Agenda de Aulas</h2>
        <p>Visualize os agendamentos semanais dos alunos.</p>
      </div>

      {/* Painel principal da agenda */}
      <div className="painel-pagina">

        {/* Navegação entre as semanas */}
        <div className="agenda-cabecalho">

          <div className="agenda-periodo">
            <CalendarDays size={22} />

            <h3>
              {formatarData(inicioSemana)} até {formatarData(fimSemana)}
            </h3>
          </div>

          <div className="agenda-navegacao">

            <button
              type="button"
              onClick={() => mudarSemana(-7)}
              aria-label="Semana anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() => setInicioSemana(
                obterInicioSemana(new Date())
              )}
            >
              Hoje
            </button>

            <button
              type="button"
              onClick={() => mudarSemana(7)}
              aria-label="Próxima semana"
            >
              <ChevronRight size={20} />
            </button>

          </div>
        </div>

        {/* Grade com os sete dias da semana */}
        <div className="agenda-grade">

          {diasSemana.map((data, indice) => (

            <div
              className="agenda-dia"
              key={formatarData(data)}
            >

              <div className="agenda-dia-cabecalho">
                <strong>{nomesDias[indice]}</strong>
                <span>{formatarData(data)}</span>
              </div>

              {/* Espaço reservado para os agendamentos */}
              <div className="agenda-dia-conteudo">
                <p>Nenhuma aula exibida</p>
              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}

export default Agendamentos;
