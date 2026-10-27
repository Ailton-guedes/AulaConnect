
# Importa os tipos de dados necessários do SQLAlchemy
from sqlalchemy import Column, Integer, Date, Text, ForeignKey

# Importa a classe Base usada nos modelos do projeto
from backend.database.connection import Base


# Representa a tabela evolucoes do MySQL
class Evolucao(Base):
    __tablename__ = "evolucoes"

    # Identificador único da evolução
    id_evolucao = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    # Aluno associado à evolução
    id_aluno = Column(
        Integer,
        ForeignKey("alunos.id_aluno"),
        nullable=False
    )

    # Data em que o aluno foi avaliado
    data_avaliacao = Column(Date, nullable=False)

    # Descrição do progresso observado
    descricao = Column(Text, nullable=False)

    # Observações adicionais, se houver
    observacoes = Column(Text, nullable=True)
