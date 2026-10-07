
# Importa os tipos de dados e recursos necessários do SQLAlchemy
from sqlalchemy import Column, Integer, String, DateTime, text

# Importa a Base definida no arquivo de conexão com o banco
from backend.database.connection import Base


# Define o modelo Python que representa a tabela usuarios no MySQL
class Usuario(Base):

    # Nome da tabela que já existe no banco de dados
    __tablename__ = "usuarios"

    # Identificador único do usuário.
    # Corresponde à coluna id_usuario do MySQL.
    # O banco gera o valor automaticamente (AUTO_INCREMENT).
    id_usuario = Column(Integer, primary_key=True, autoincrement=True)

    # Nome do usuário: obrigatório e limitado a 100 caracteres
    nome = Column(String(100), nullable=False)

    # E-mail: obrigatório, limitado a 100 caracteres e único
    email = Column(String(100), nullable=False, unique=True)

    # Senha armazenada no banco
   
    senha = Column(String(255), nullable=False)

    # Perfil do usuário, como administrador, professor ou responsável
    tipo_usuario = Column(String(50), nullable=False)

    # Data e hora do cadastro.
    # O banco define a data atual quando nenhum valor é informado.
    data_cadastro = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP")
    )
