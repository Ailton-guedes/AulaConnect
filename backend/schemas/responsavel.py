# Importa recursos do Pydantic para validar os dados
from pydantic import BaseModel, ConfigDict, EmailStr

# Importa o tipo usado para representar datas e horários
from datetime import datetime

# Define os dados necessários para cadastrar um responsável
class ResponsavelCreate(BaseModel):
    nome: str
    telefone: str | None = None
    email: EmailStr | None = None
    cpf: str | None = None

# Define os dados devolvidos pela API após o cadastro
class ResponsavelResponse(BaseModel):
# Permite converter objetos SQLAlchemy em respostas Pydantic
    model_config = ConfigDict(from_attributes=True)

    id_responsavel: int
    nome: str
    telefone: str | None = None
    email: EmailStr | None = None
    cpf: str | None = None
    data_cadastro: datetime