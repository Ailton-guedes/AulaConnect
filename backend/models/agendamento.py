# Importa os tipos de coluna e a chave estrangeira do SQLALchemy
from sqlalchemy import Column, Integer,String, Date, ForeignKey

# Importa a Base utilizada pelos modelos do projeto
from backend.database.connection import Base

# Representa a tabela agendamento no banco MySQL
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
        ForeignKey("alunos.id.aluno"),
        nullable=False
    )

    # Aula relacionada ao agendamento (opcional)
    id_aula = Column(
        Integer,
        ForeignKey("aulas.id_aula"),
        nullable=True
    )

    # Data em que a aula será realizada
    data_aula = Column(Date, nullable=False)

    # Situação do agendamento
    status = Column(String(30), nullable=False)