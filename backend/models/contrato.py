
# Importa os tipos de dados do SQLAlchemy
from sqlalchemy import Column, Integer, String, Date, DateTime, DECIMAL, ForeignKey, text

# Importa a Base utilizada pelos modelos do projeto
from backend.database.connection import Base


# Representa a tabela contratos do MySQL
class Contrato(Base):

    # Nome da tabela no banco de dados
    __tablename__ = "contratos"

    # Identificador único do contrato
    id_contrato = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    # Aluno vinculado ao contrato
    id_aluno = Column(
        Integer,
        ForeignKey("alunos.id_aluno"),
        nullable=False
    )

    # Plano escolhido pelo aluno
    id_plano = Column(
        Integer,
        ForeignKey("planos.id_plano"),
        nullable=False
    )

    # Data de início do contrato
    data_inicio = Column(Date, nullable=False)

    # Data de vencimento do contrato
    data_fim = Column(Date, nullable=False)

    # Valor mensal acordado
    valor_mensal = Column(DECIMAL(10, 2), nullable=False)

    # Situação atual do contrato
    status = Column(
        String(30),
        nullable=False,
        server_default=text("'ativo'")
    )

    # Data em que o contrato foi cadastrado
    data_cadastro = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP")
    )
