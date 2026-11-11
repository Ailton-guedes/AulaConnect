
# Importa os tipos de dados necessários do SQLAlchemy
from sqlalchemy import (
    Column,
    Integer,
    String,
    DECIMAL,
    Boolean,
    Text,
    DateTime,
    text
)

# Importa a Base utilizada pelos modelos do AulaConnect
from backend.database.connection import Base


# Representa a tabela planos do MySQL
class Plano(Base):

    # Nome da tabela no banco de dados
    __tablename__ = "planos"

    # Identificador único do plano
    id_plano = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    # Nome do plano
    nome = Column(
        String(50),
        nullable=False
    )

    # Duração do plano em meses: 1, 3 ou 6
    duracao_meses = Column(
        Integer,
        nullable=False
    )

    # Quantidade de aulas por semana: 1 ou 2
    # Permite NULL para preservar planos antigos de teste
    aulas_por_semana = Column(
        Integer,
        nullable=True
    )

    # Valor mensal configurado pelo professor
    valor_mensal = Column(
        DECIMAL(10, 2),
        nullable=False
    )

    # Descrição do plano
    descricao = Column(
        Text,
        nullable=True
    )

    # Indica se o plano está disponível para contratação
    ativo = Column(
        Boolean,
        nullable=True,
        server_default=text("1")
    )

    # Data em que o plano foi cadastrado
    data_cadastro = Column(
        DateTime,
        nullable=True,
        server_default=text("CURRENT_TIMESTAMP")
    )
