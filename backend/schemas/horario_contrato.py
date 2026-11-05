
# Importa os recursos do Pydantic para validar os dados
from pydantic import BaseModel, ConfigDict, Field

# Importa o tipo de dado para representar horários
from datetime import time


# Dados necessários para cadastrar um horário do contrato
class HorarioContratoCreate(BaseModel):

    # Identifica o contrato ao qual o horário pertence
    id_contrato: int

    # Identifica a aula (opcional)
    id_aula: int | None = None

    # Dia da semana: 0 = segunda e 6 = domingo
    dia_semana: int = Field(ge=0, le=6)

    # Horário em que a aula começará
    horario_inicio: time


# Dados retornados pela API
class HorarioContratoResponse(BaseModel):

    # Permite converter objetos do SQLAlchemy em respostas Pydantic
    model_config = ConfigDict(from_attributes=True)

    id_horario: int
    id_contrato: int
    id_aula: int | None = None
    dia_semana: int
    horario_inicio: time
