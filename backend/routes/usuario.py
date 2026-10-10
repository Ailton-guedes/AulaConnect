# Importa a APIRouter para criar as rotas de usário
# HTTPException: permite devolver erros controlados, como e-mail já cadastrado.
# permite usar nomes para os códigos HTTP, como HTTP_201_CREATED.
from fastapi import APIRouter, Depends, HTTPException, status

# Importa a sessão do SQLAlchemy
from sqlalchemy.orm import Session

# Importa a função que cria a conexão/sessão com o banco
from backend.database.connection import get_db

# Importa o modelo Usuario, que representa a tabela usuario
from backend.models.usuario import Usuario 

# importa o Schema utilizado no cadastro
from backend.schemas.usuario import UsuarioCreate, UsuarioResponse
from backend.security import criar_hash_senha

# Cria um grupo de rotas para usuários
router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

# rota para lista todos usuarios cadastrados
# Define os campos que API pode devolver
@router.get("/", response_model=list[UsuarioResponse])
def lista_usuarios(db: Session = Depends(get_db)):

      # Consulta todos os registros da tabela usuarios
    usuarios = db.query(Usuario).all()

    # retorna os usuarios encontrados
    return usuarios

# POST - Cadastrar usuário
@router.post("/",
             response_model=UsuarioResponse,
             status_code=status.HTTP_201_CREATED # informa que um cadastro foi criado com sucesso
             )

def cadastrar_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db)    
):
    #Verifica se o e-mail já está cadastrado
    usuario_existente = db.query(Usuario).filter(
        Usuario.email == usuario.email
    ).first()

    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este e=mail já está cadastrado."
        )
    # Traforma a senha original em um hash seguro 
    senha_hash = criar_hash_senha(usuario.senha)
    
    # cria um novo objeto Usuário
    novo_usuario = Usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha=senha_hash,
        tipo_usuario=usuario.tipo_usuario

    )

    try:
        # Adiciona o usuário à sessão do banco
        db.add(novo_usuario)

        # Grava os dados no MySQL
        db.commit()

        # Recupera os valores gerados pelo banco
        db.refresh(novo_usuario)

    except Exception:
        # Desfaz a transação se ocorrer algum erro
        db.rollback()
        raise

    # Retorna o usuário sem incluir a senha ou o hash
    return novo_usuario