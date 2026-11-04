
# Importa os tipos de dados necessários do SQLAlchemy
from sqlalchemy import Column, Integer, String, DECIMAL, Boolean, text

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

    # Nome do plano: Mensal, Trimestral ou Semestral
    nome = Column(
        String(50),
        nullable=False
    )

    # Duração do plano em meses
    duracao_meses = Column(
        Integer,
        nullable=False
    )

    # Valor mensal do plano
    valor_mensal = Column(
        DECIMAL(10, 2),
        nullable=False
    )

    # Indica se o plano está disponível para contratação
    ativo = Column(
        Boolean,
        server_default=text("1")
    )
