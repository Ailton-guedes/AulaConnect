# importa os recursos necessários do AQLALchemy
from sqlalchemy import Column, Integer, String,DateTime, text

# importa a base usada pelos modelos do projeto
from backend.database.connection import Base

# Representa a tabela responsaveis no banco MySQL
class Responsavel(Base):
    __tablename__ = "responsaveis"

    # Identificador único gerado pelo banco
    id_responsavel = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    # Nome obrigatório do responsável
    nome = Column(String(100),nullable=False)
    telefone = Column(String(25), nullable=True)
    email = Column(String(100), nullable=True)
    cpf = Column(String(11), nullable=True)

    # Data preenchida automaticamente pelo MySQL
    data_cadastro = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP")
    )