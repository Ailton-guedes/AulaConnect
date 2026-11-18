# Importa as classes necessárias para validar os dados
from pydantic import BaseModel, ConfigDict

# Importa os tipos de data e horário
from datetime import date, time


# ==========================================================
# DADOS PARA CADASTRAR UM AGENDAMENTO
# ==========================================================

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
    presenca: str | None = None


# ==========================================================
# DADOS RETORNADOS PELA API
# ==========================================================

class AgendamentoResponse(BaseModel):

    # Permite converter objetos do SQLAlchemy em respostas Pydantic
    model_config = ConfigDict(from_attributes=True)

    # Identificador do agendamento
    id_agendamento: int

    # Aluno relacionado ao agendamento
    id_aluno: int

    # Aula vinculada ao agendamento
    id_aula: int | None = None

    # Contrato que originou o agendamento
    id_contrato: int | None = None

    # Horário semanal que originou o agendamento
    # Pode ser nulo para aulas experimentais ou registros antigos
    id_horario: int | None = None

    # Data e horário da aula
    data_aula: date
    horario_inicio: time | None = None

    # Tipo e situação do agendamento
    tipo_agendamento: str
    status: str

    # Frequência registrada
    presenca: str | None = None


# ==========================================================
# REGISTRAR PRESENÇA OU FALTA
# ==========================================================

class PresencaUpdate(BaseModel):

    # Aceita somente presente ou falta
    presenca: str