# Importa os tipos de dados e recursos necessários do SQLAlchemy
from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, text

# Importa a Base usada pelos modelos do projeto
from backend.database.connection import Base


# Representa a tabela alunos no banco de dados MySQL
class Aluno(Base):
    __tablename__ = "alunos"

    # Identificador único do aluno
    id_aluno = Column(Integer, primary_key=True, autoincrement=True)

    # Nome completo do aluno
    nome = Column(String(100), nullable=False)

    # Data de nascimento do aluno
    data_nascimento = Column(Date, nullable=True)

    # Sexo do aluno
    sexo = Column(String(20), nullable=True)

    # Observações sobre o aluno
    observacoes = Column(Text, nullable=True)

    # Chave estrangeira que relaciona o aluno ao responsável
    id_responsavel = Column(
        Integer,
        ForeignKey("responsaveis.id_responsavel"),
        nullable=True
    )

    # Data e hora do cadastro, preenchidas pelo banco por padrão
    data_cadastro = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=True
    )