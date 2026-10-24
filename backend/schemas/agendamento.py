# Importa as classes necessárias para validar os dados
from pydantic import BaseModel, ConfigDict

# Importa o tipo date para representar a data da aula
from datetime import date

# Define os dados necessários para cadastrar um agendamento
class AgendamentoCreate(BaseModel):
    id_aluno: int
    id_aula: int | None = None
    data_aula: date
    status: str

# Define os dados retornados pela API
class AgendamentoResponse(BaseModel):
    # Permite converter ojetivos do SQLALchamy em resposta Pydntic
    model_config = ConfigDict(from_attributes=True)

    id_agendamento: int
    id_aluno: int
    id_aula: int | None = None
    data_aula: date
    status: str