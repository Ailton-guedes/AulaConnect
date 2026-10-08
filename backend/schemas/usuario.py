# Importa o BaseModel do Pydantic.
# Ele será usado para definir os dados
# que a API receberá.
from pydantic import BaseModel

# Define os dados necessários para cadastrar um usuário.
class UsuarioCreate(BaseModel):
    # Nome do usuário
    nome: str

    # E-mail do usuário
    email: str  

    # Senha do usuário
    senha: str 

    # Tipo/perfil do usuário
    # Exemplos: administrador, professor, responsável
    tipo_usuario: str