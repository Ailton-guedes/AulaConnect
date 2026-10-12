# Importa o CryptContext, responsável por
# criar e verificar hashes de senha.
from passlib.context import CryptContext

# Importa manipulação de datas para definir a validade do token
from datetime import datetime, timedelta, timezone

# Importa a biblioteca jose para codificar e decodificar tokens JWT
from jose import jwt

#Confugura o algoritimo que será utilizado para proteger as senhas.
pwd_context= CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# CONFIGURAÇÕES DO TOKEN JWT
# Chave mestra usada para assinar o crachá digital.
SECRET_KEY = ""

# Algoritmo de hash para a assinatura digital do token
ALGORITHM = "HS256"

# Tempo em minutos que o usuário pode navegar logado antes de precisar relogar
ACCESS_TOKEN_EXPIRE_MINUTES = 60


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
# Cria uma cópia do dicionário recebido para não alterar o original por acidente
    dados_a_codificar = dados.copy()

# Define o momento exato em que o token deixará de valer (hora atual UTC + 60 min)
    momento_expiracao = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

# O campo 'exp' é o padrão universal de JWT para registrar a expiração
    dados_a_codificar.update({"exp": momento_expiracao})

    # Criptografa/assina o pacote e transforma numa string única que o cliente usará
    token_gerado = jwt.encode(dados_a_codificar, SECRET_KEY, algorithm=ALGORITHM)

    return token_gerado