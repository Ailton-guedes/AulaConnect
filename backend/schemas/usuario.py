
# Importa o BaseModel para definir os dados da API
from pydantic import BaseModel, ConfigDict

# Importa o tipo utilizado para representar data e hora
from datetime import datetime


# Dados recebidos no cadastro de usuário
class UsuarioCreate(BaseModel):

    nome: str
    email: str
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
