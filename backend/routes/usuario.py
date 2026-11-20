# Importa a APIRouter para criar as rotas de usário
# HTTPException: permite devolver erros controlados, como e-mail já cadastrado.
# permite usar nomes para os códigos HTTP, como HTTP_201_CREATED.
from fastapi import APIRouter, Depends, HTTPException, status

# Essa classe permite receber os campos username e password enviados pelo formulário Authorize do Swagger.
from fastapi.security import OAuth2PasswordRequestForm

# Importa a sessão do SQLAlchemy
from sqlalchemy.orm import Session

# Importa a função que cria a conexão/sessão com o banco
from backend.database.connection import get_db

# Importa o modelo Usuario, que representa a tabela usuario
from backend.models.usuario import Usuario 

# importa o Schema utilizado no cadastro
from backend.schemas.usuario import (
    UsuarioCreate,   # - UsuarioCreate: formato esperado para cadastrar
    UsuarioUpdate,
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

# Lista os usuários cadastrados
# A consulta é permitida apenas para administradores
@router.get("/", response_model=list[UsuarioResponse])
def lista_usuarios(
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):

    # Verifica se o usuário autenticado é administrador
    if usuario_atual.tipo_usuario != "Adm":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem consultar usuários."
        )

    # Retorna os usuários cadastrados no banco
    return db.query(Usuario).all()

# POST - Cadastrar usuário
@router.post("/",
             response_model=UsuarioResponse,
             status_code=status.HTTP_201_CREATED # informa que um cadastro foi criado com sucesso
             )

def cadastrar_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):

    # Verifica se o usuário autenticado é administrador
    if usuario_atual.tipo_usuario != "Adm":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem cadastrar usuários."
        )
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

# PUT - Atualizar os dados de um usuário
@router.put(
    "/{id_usuario}",
    response_model=UsuarioResponse,
    status_code=status.HTTP_200_OK
)
def atualizar_usuario(
    id_usuario: int,
    dados_usuario: UsuarioUpdate,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):

    # Apenas administradores podem editar usuários
    if usuario_atual.tipo_usuario != "Adm":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem editar usuários."
        )

    # Procura o usuário pelo ID
    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == id_usuario
    ).first()

    # Verifica se o usuário existe
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )

    # Impede que o administrador retire seu próprio perfil
    if (
        usuario.id_usuario == usuario_atual.id_usuario
        and dados_usuario.tipo_usuario != "Adm"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode remover seu próprio perfil de administrador."
        )

    # Verifica se o novo e-mail pertence a outro usuário
    email_existente = db.query(Usuario).filter(
        Usuario.email == dados_usuario.email,
        Usuario.id_usuario != id_usuario
    ).first()

    if email_existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este e-mail já pertence a outro usuário."
        )

    # Atualiza os campos permitidos
    usuario.nome = dados_usuario.nome
    usuario.email = dados_usuario.email
    usuario.tipo_usuario = dados_usuario.tipo_usuario

    try:
        # Salva as alterações no MySQL
        db.commit()

        # Atualiza os dados do objeto
        db.refresh(usuario)

    except Exception:
        # Desfaz a operação em caso de erro
        db.rollback()
        raise

    # Retorna os dados atualizados sem expor a senha
    return usuario

# POST - Autenticação / login usando OAuth2
@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK
)
def login(
    dados_login: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # O formulário OAuth2 envia "username".
    # Neste projeto, usaremos esse campo para receber o e-mail.
    usuario = db.query(Usuario).filter(
        Usuario.email == dados_login.username
    ).first()

    # Confere se o usuário existe e se a senha corresponde ao hash.
    if not usuario or not verificar_senha(
        dados_login.password,
        usuario.senha
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Dados que serão armazenados no token JWT.
    payload = {
        "sub": str(usuario.id_usuario),
        "email": usuario.email,
        "tipo_usuario": usuario.tipo_usuario
    }

    # Gera o token de acesso.
    token = criar_token_acesso(dados=payload)

    # Retorna o token ao cliente.
    return {
        "access_token": token,
        "token_type": "bearer"
    }
# DELETE - Excluir um usuário do sistema
@router.delete(
    "/{id_usuario}",
    status_code=status.HTTP_200_OK
)
def excluir_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):

    # Apenas administradores podem excluir usuários
    if usuario_atual.tipo_usuario != "Adm":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem excluir usuários."
        )

    # Impede que o administrador exclua sua própria conta
    if usuario_atual.id_usuario == id_usuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode excluir sua própria conta."
        )

    # Busca o usuário pelo ID informado
    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == id_usuario
    ).first()

    # Verifica se o usuário existe
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )

    # Tenta excluir o registro do MySQL
    try:
        db.delete(usuario)
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Não foi possível excluir o usuário. "
                "Verifique se existem registros vinculados a ele."
            )
        )

    # Retorna uma mensagem de confirmação
    return {
        "mensagem": "Usuário excluído com sucesso."
    }