# Importa os recursos para criar e validar schemas
from pydantic import BaseModel, ConfigDict

# importa os tipos de data e hora
from datetime import time

# Dados recebidos para cadastrar uma nova aula
class Aulacreate(BaseModel):
    descricao: str 
    dia_semana: str
    horario: time
    duracao: int | None = None
    capacidade: int | None = None
    observacoes: str | None = None

    # Dados devolvidos pela API
class AulaResponse(BaseModel):
 # Permite converter objetos SQLAlchemy em respostas Pydantic
    model_config = ConfigDict(from_attributes=True)

    id_aula: int 
    descricao: str
    dia_semana: str
    horario: time
    duracao: int | None = None
    capacidade: int | None = None
    observacoes: str | None = None

# Dados recebidos para atualizar uma aula
class AulaUpdate(BaseModel):
    descricao: str | None = None
    dia_semana: str | None = None
    horario: time | None = None
    duracao: int | None = None
    capacidade: int | None = None
    observacoes: str | None = None