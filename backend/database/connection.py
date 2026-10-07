# Importa o create_engine, que será responsável por criar
# a conexão entre nossa aplicação Python e o banco MySQL.
from sqlalchemy import create_engine

# Importa o sessionmaker, usado para criar sessões de comunicação
# com o banco de dados.
# declarative_base será usado como base para criar nossos modelos
# (que representarão as tabelas do banco).
from sqlalchemy.orm import sessionmaker, declarative_base


# Define as informações necessárias para acessar o banco de dados.
#
# mysql+pymysql -> informa que vamos usar MySQL através do PyMySQL.
# root           -> usuário do MySQL.
# (vazio)        -> senha do usuário root.
# localhost      -> banco está na própria máquina.
# aulaconnect    -> nome do banco de dados.
DATABASE_URL = "mysql+pymysql://root:@localhost/aulaconnect"


# Cria o "engine" do SQLAlchemy.
# Ele será responsável por gerenciar a comunicação
# entre nossa aplicação e o banco de dados.
engine = create_engine(DATABASE_URL)


# Cria uma fábrica de sessões.
# Cada sessão será utilizada quando precisarmos consultar,
# inserir, alterar ou excluir informações no banco.
SessionLocal = sessionmaker(
    autocommit=False,  # Não confirma alterações automaticamente.
    autoflush=False,   # Não envia alterações automaticamente ao banco.
    bind=engine        # Vincula as sessões ao nosso engine.
)


# Cria a classe Base.
# Todos os nossos modelos/tabelas do sistema irão herdar dessa Base.
#
# Por exemplo:
# class Usuario(Base):
#     ...
#
# O SQLAlchemy usará essa Base para conhecer nossas tabelas.
Base = declarative_base()

# Cria uma sessão para trabalhar com o banco de dados.
def get_db():
 # Cria uma nova sessão
    db = SessionLocal()

    try:
        # Entrega a sessão para quem prescisar utilizar o banco
        yield db

    finally:
    # Fecha a sessão depois que terminar de utiliza-la
        db.close()