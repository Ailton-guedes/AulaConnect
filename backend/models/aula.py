# Importa os tipos de dados e recursos necessários do SQLAlchemy
from sqlalchemy import Column, Integer, String, Time, Text

# Importa a Base usada pelos modelos do projeto
from backend.database.connection import Base


# Representa a tabela alunos no banco de dados MySQL
class Aula(Base):
    __tablename__ = "aulas"

    # Identificador da aula
    id_aula = Column(Integer, primary_key=True, autoincrement=True)

    # descrição da aula
    descricao = Column(String(100), nullable=False)

    # Dia da semana que a aula acontece
    dia_semana = Column(String(30), nullable=False)

    # horario de inicio da aula
    horario = Column(Time, nullable=False)

    # Duração da aulas
    duracao = Column(Integer, nullable=True)

    # Capacidade maxima de alunos
    capacidade = Column(Integer, nullable=True)

    # Observações sobre o aluno
    observacoes = Column(Text, nullable=True)
