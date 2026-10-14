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
from backend.schemas.usuario import (
    UsuarioCreate,   # - UsuarioCreate: formato esperado para cadastrar
    UsuarioResponse, # - UsuarioResponse: formato público para listar sem expor senha
    UsuarioLogin,    # - UsuarioLogin: formato esperado no corpo da requisição de login
    TokenResponse    # - TokenResponse: formato de resposta contendo o JWT
)

# Importa as ferramentas de segurança:
from backend.security import (
    criar_hash_senha,  # - criar_hash_senha: para novos cadastros
    verificar_senha,   # - verificar_senha: para conferir no login se a senha digitada bate com o hash
    criar_token_acesso, # - criar_token_acesso: para gerar o token JWT após o login bem-sucedido
    obter_usuario_atual 
)
# Cria um grupo de rotas para usuários
router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

# rota para lista todos usuarios cadastrados
# Define os campos que API pode devolver
@router.get("/", response_model=list[UsuarioResponse])
def lista_usuarios(
    db: Session = Depends(get_db),
    usuario_atual: Usuario= Depends(obter_usuario_atual)
    ):


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
            detail="Este email já está cadastrado."
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
        db.add(novo_usuario)      # Adiciona o usuário à sessão do banco
        db.commit()               # Grava os dados no MySQL
        db.refresh(novo_usuario)  # Recupera os valores gerados pelo banco

    except Exception:
        db.rollback()  # Desfaz a transação se ocorrer algum erro
        raise
    # Retorna o usuário sem incluir a senha ou o hash
    return novo_usuario

# Post Autenicação / login
@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK
)
def  login(
    dados_login: UsuarioLogin,
    db: Session = Depends(get_db)
):
    # 1. Procura o usuário pelo e-mail informado
    usuario = db.query(Usuario).filter(
        Usuario.email == dados_login.email
    ).first()

    # 2. Segurança: se o usuário não existir OU se a senha não bater com o hash,
    # retornamos 401 Unauthorized com a mesma mensagem para ambos os casos.
    if not usuario or not verificar_senha(dados_login.senha, usuario.senha):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )

    # 3. Dados colocados dentro do payload do token JWT:
    # 'sub' (subject) identifica quem é o usuário
    payload = {
        "sub": str(usuario.id_usuario),
        "email": usuario.email,
        "tipo_usuario": usuario.tipo_usuario
    }

    # 4. Gera o token assinado usando a chave secreta
    token = criar_token_acesso(dados=payload)

    # 5. Retorna o token respeitando o schema TokenResponse
    return {
        "access_token": token,
        "token_type": "bearer"
    }