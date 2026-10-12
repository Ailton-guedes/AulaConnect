
# Importa o BaseModel para definir os dados da API
from pydantic import BaseModel, ConfigDict, EmailStr

# Importa o tipo utilizado para representar data e hora
from datetime import datetime


# Dados recebidos no cadastro de usuário
class UsuarioCreate(BaseModel):

    nome: str
    email: EmailStr
    senha: str
    tipo_usuario: str


# Dados que a API pode devolver ao consultar um usuário
class UsuarioResponse(BaseModel):

    # Permite ler os dados de um objeto do SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

    id_usuario: int
    nome: str
    email: str
    tipo_usuario: str
    data_cadastro: datetime

# 3. DADOS DE ENTRADA DO LOGIN: O que o usuário envia para autenticar
class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str

# 4. DADOS DE SAÍDA DO LOGIN: O que a API devolve após autenticar com sucesso
class TokenResponse(BaseModel):
    access_token: str   # O token JWT em si (a credencial criptografada)
    token_type: str = "bearer" # O padrão da indústria para envio de tokens HTTP
