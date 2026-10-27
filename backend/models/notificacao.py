
# Importa os tipos de dados necessários do SQLAlchemy
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    text
)

# Importa a classe Base do projeto
from backend.database.connection import Base


# Representa a tabela de notificações no MySQL
class Notificacao(Base):
    __tablename__ = "notificacoes"

    # Identificador único da notificação
    id_notificacao = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    # Usuário que receberá a notificação
    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=True
    )

    # Título e conteúdo da mensagem
    titulo = Column(String(100), nullable=False)
    mensagem = Column(Text, nullable=False)

    # Categoria da notificação
    tipo = Column(String(30), nullable=True)

    # Indica se o usuário já leu a notificação
    lida = Column(Boolean, default=False)

    # Data e hora de criação da notificação
    data_envio = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP")
    )
