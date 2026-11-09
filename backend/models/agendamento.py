
# Importa os tipos de dados e chaves estrangeiras do SQLAlchemy
from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, text

# Importa a Base utilizada pelos modelos do projeto
from backend.database.connection import Base


# Representa a tabela agendamentos do MySQL
class Agendamento(Base):

    __tablename__ = "agendamentos"

    # Identificador único do agendamento
    id_agendamento = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    # Aluno relacionado ao agendamento
    id_aluno = Column(
        Integer,
        ForeignKey("alunos.id_aluno"),
        nullable=False
    )

    # Aula relacionada ao agendamento
    id_aula = Column(
        Integer,
        ForeignKey("aulas.id_aula"),
        nullable=True
    )

    # Contrato que originou o agendamento
    # Pode ser nulo para aulas experimentais
    id_contrato = Column(
        Integer,
        ForeignKey("contratos.id_contrato"),
        nullable=True
    )

    # Data em que a aula será realizada
    data_aula = Column(
        Date,
        nullable=False
    )

    # Horário específico do agendamento
    horario_inicio = Column(
        Time,
        nullable=True
    )

    # Diferencia aulas regulares e experimentais
    tipo_agendamento = Column(
        String(30),
        nullable=False,
        server_default=text("'regular'")
    )

    # Situação do agendamento
    status = Column(
        String(30),
        nullable=False
    )
    # Registra a frequência do aluno na aula
    # None significa que a presença ainda não foi registrada
    presenca = Column(
        String(20),
        nullable=True,
        default=None
    )