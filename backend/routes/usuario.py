# Importa a APIRouter para criar as rotas de usário
from fastapi import APIRouter, Depends

# Importa a sessão do SQLAlchemy
from sqlalchemy.orm import Session

# Importa a função que cria a conexão/sessão com o banco
from backend.database.connection import get_db

# Importa o modelo Usuario, que representa a tabela usuario
from backend.models.usuario import Usuario

# importa o Schema utilizado no cadastro
from backend.schemas.usuario import UsuarioCreate

# Cria um grupo de rotas para usuários
router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

# rota para lista todos usuarios cadastrados
@router.get("/")
def lista_usuarios(db: Session = Depends(get_db)):

      # Consulta todos os registros da tabela usuarios
    usuarios = db.query(Usuario).all()

    # retorna os usuarios encontrados
    return usuarios

# POST - Cadastrar usuário
@router.post("/")
def cadastrar_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db)
):

    # cria um novo objeto Usuário
    novo_usuario = Usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha=usuario.senha,
        tipo_usuario=usuario.tipo_usuario

    )
      # Adiciona o usuário à sessão
    db.add(novo_usuario)

    # Confirma a gravação no banco
    db.commit()

    # Atualiza o objeto com o ID gerado pelo MySQL
    db.refresh(novo_usuario)

    # Retorna o usuário cadastrado
    return novo_usuario