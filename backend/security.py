# Importa o CryptContext, responsável por
# criar e verificar hashes de senha.
from passlib.context import CryptContext

# Importa manipulação de datas para definir a validade do token
from datetime import datetime, timedelta, timezone

# Importa a biblioteca jose para codificar e decodificar tokens JWT
from jose import JWTError, jwt

# Importações do FastAPI para proteger rotas e levantar exceções HTTP
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.usuario import Usuario

#Confugura o algoritimo que será utilizado para proteger as senhas.
pwd_context= CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# CONFIGURAÇÕES DO TOKEN JWT
# Chave mestra usada para assinar o crachá digital.
SECRET_KEY = "aulaconnect_chave_secreta_super_segura_desenvolvimento"

# Algoritmo de hash para a assinatura digital do token
ALGORITHM = "HS256"

# Tempo em minutos que o usuário pode navegar logado antes de precisar relogar
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# indica onde o FastAPI procura a rota de login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="usuarios/login")

# Função responsável por transformar
# uma senha comum em um hast
def criar_hash_senha(senha: str):
    return pwd_context.hash(senha)

# Função responsável por verificar se uma senha
# corresponde ao hast armazenado no banco

def verificar_senha(senha: str, senha_hash: str):
    return pwd_context.verify(senha, senha_hash)

# FUNÇÃO DE CRIAÇÃO DO TOKEN JWT
# Função que empacota as informações do usuário dentro do token
def criar_token_acesso(dados: dict)-> str:
    dados_a_codificar = dados.copy()# Cria uma cópia do dicionário recebido para não alterar o original por acidente
    # Define o momento exato em que o token deixará de valer (hora atual UTC + 60 min)
    momento_expiracao = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    dados_a_codificar.update({"exp": momento_expiracao}) # O campo 'exp' é o padrão universal de JWT para registrar a expiração
    # Criptografa/assina o pacote e transforma numa string única que o cliente usará
    token_gerado = jwt.encode(dados_a_codificar, SECRET_KEY, algorithm=ALGORITHM)
    return token_gerado

def obter_usuario_atual(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
) -> Usuario:
    erro_credenciais = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inváilido ou experido.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decodifica o crachá digital com a chave secreta
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id_usuario: str = payload.get("sub")
        if id_usuario is None:
            raise erro_credenciais

    except JWTError:
        raise erro_credenciais

    # Busca o usuario no Mysql
    usuario = db.query(Usuario).filter(Usuario.id_usuario == int(id_usuario)).first()
    if usuario is None:
        raise erro_credenciais

    return usuario