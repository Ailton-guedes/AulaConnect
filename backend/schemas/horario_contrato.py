
# Importa os recursos do Pydantic para validar os dados
from pydantic import BaseModel, ConfigDict, Field

# Importa o tipo de dado para representar horários
from datetime import time


# Dados necessários para cadastrar um horário do contrato
class HorarioContratoCreate(BaseModel):

    # Identifica o contrato ao qual o horário pertence
    id_contrato: int = Field(gt=0)

    # Identifica a aula, quando informada
    id_aula: int | None = Field(default=None, gt=0)

    # Dia da semana: 0 = segunda e 6 = domingo
    dia_semana: int = Field(ge=0, le=6)

    # Horário em que a aula começará
    horario_inicio: time


# Dados retornados pela API
class HorarioContratoResponse(BaseModel):

    # Permite converter objetos SQLAlchemy em respostas
    model_config = ConfigDict(from_attributes=True)

    # Identificador do horário cadastrado
    id_horario: int

    # Contrato vinculado
    id_contrato: int

    # Aula vinculada, quando existir
    id_aula: int | None = None

    # Dia da semana
    dia_semana: int

    # Horário de início
    horario_inicio: time
