# Importa os recursos para criar e validar schemas
from pydantic import BaseModel, ConfigDict

# importa os tipos de data e hora
from datetime import date, datetime

# Dados recebidos para cadastrar um aluno
class AlunoCreate(BaseModel):
    nome: str
    data_nascimento: date | None = None
    sexo: str | None = None
    observacoes: str | None = None
    id_responsavel: int | None = None


# Dados devolvidos pela API
class AlunoResponse(BaseModel):
    # Permite converter objetos SQLAlchemy em respostas Pydantic
    model_config = ConfigDict(from_attributes=True)

    id_aluno: int
    nome: str
    data_nascimento: date | None = None
    sexo: str | None = None
    observacoes: str | None = None
    id_responsavel: int | None = None
    data_cadastro: datetime



