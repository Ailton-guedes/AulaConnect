# Importa as classes necessárias para validar os dados
from pydantic import BaseModel, ConfigDict

# Importa os tipos de data e horário
from datetime import date, time


# Define os dados necessários para cadastrar um agendamento
class AgendamentoCreate(BaseModel):

    # Aluno que participará da aula
    id_aluno: int

    # Aula vinculada ao agendamento
    id_aula: int | None = None

    # Contrato do aluno (opcional para aulas experimentais)
    id_contrato: int | None = None

    # Data em que a aula acontecerá
    data_aula: date

    # Horário de início da aula
    horario_inicio: time | None = None

    # Tipo de agendamento: regular ou experimental
    tipo_agendamento: str = "regular"

    # Situação do agendamento
    status: str

    # Frequência do aluno 
    presenca: str | None =  None


# Define os dados retornados pela API
class AgendamentoResponse(BaseModel):

    # Permite converter objetos do SQLAlchemy em respostas Pydantic
    model_config = ConfigDict(from_attributes=True)

    id_agendamento: int
    id_aluno: int
    id_aula: int | None = None
    id_contrato: int | None = None
    data_aula: date
    horario_inicio: time | None = None
    tipo_agendamento: str
    status: str
    presenca: str | None = None

# Dados recebidos para registrar a frequência do aluno
class PresencaUpdate(BaseModel):

    # Aceita somente presente ou falta
    presenca: str