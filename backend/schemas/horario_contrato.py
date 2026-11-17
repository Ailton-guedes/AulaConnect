
# Importa os recursos do Pydantic para validar os dados
from pydantic import BaseModel, ConfigDict, Field

# Importa o tipo de dado para representar horários
from datetime import time


# ==========================================================
# DADOS PARA CADASTRAR UM HORÁRIO DO CONTRATO
# ==========================================================

class HorarioContratoCreate(BaseModel):

    # Identifica o contrato ao qual o horário pertence
    id_contrato: int = Field(gt=0)

    # Identifica a aula, quando informada
    id_aula: int | None = Field(default=None, gt=0)

    # Dia da semana: 0 = segunda e 6 = domingo
    dia_semana: int = Field(ge=0, le=6)

    # Horário em que a aula começará
    horario_inicio: time

    # Duração da aula: entre 30 e 40 minutos
    duracao_minutos: int = Field(
        ge=30,
        le=40,
        description="Duração da aula entre 30 e 40 minutos"
    )

    # Intervalo de deslocamento após a aula
    # Padrão de 30 minutos
    deslocamento_minutos: int = Field(
        default=30,
        ge=20,
        le=30,
        multiple_of=5,
        description="Deslocamento de 20, 25 ou 30 minutos"
    )


# ==========================================================
# DADOS PARA ATUALIZAR UM HORÁRIO EXISTENTE
# ==========================================================

class HorarioContratoUpdate(BaseModel):

    # Novo dia da semana
    dia_semana: int = Field(ge=0, le=6)

    # Novo horário de início da aula
    horario_inicio: time

    # Nova duração da aula
    duracao_minutos: int = Field(
        ge=30,
        le=40,
        description="Duração da aula entre 30 e 40 minutos"
    )

    # Novo tempo de deslocamento
    deslocamento_minutos: int = Field(
        ge=20,
        le=30,
        multiple_of=5,
        description="Deslocamento de 20, 25 ou 30 minutos"
    )


# ==========================================================
# DADOS RETORNADOS PELA API
# ==========================================================

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

    # Duração da aula
    # Aceita NULL dos horários antigos
    duracao_minutos: int | None = None

    # Intervalo de deslocamento
    deslocamento_minutos: int
