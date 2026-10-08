# Importa o CryptContext, responsável por
# criar e verificar hashes de senha.
from passlib.context import CryptContext

#Confugura o algoritimo que será utilizado
# para proteger as senhas.
pwd_context= CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# Função responsável por transformar
# uma senha comum em um hast
def criar_hash_senha(senha: str):

    return pwd_context.hash(senha)

# Função responsável por verificar se uma senha
# corresponde ao hast armazenado no banco

def verificar_senha(senha: str, senha_hash: str):

    return pwd_context.verify(senha, senha_hash)