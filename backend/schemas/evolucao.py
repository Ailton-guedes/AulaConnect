# Importa recursos do Pydantic para validar os dados
from pydantic import BaseModel, ConfigDict

# Importa o tipo de dado para datas
from datetime import date

# Importa recursos do Pydantic para validar os dados
class EvolucaoCreate(BaseModel):
    id_aluno: int
    data_avalicao: date
    descricao: str
    observacoes: str | None = None

# Define os campos que a API devolverá na resposta
class EvolucaoResponse( BaseModel):
    # Permite converte objetos do SQLALchemy em respostas
    model_config = ConfigDict(from_attributes=True)

    id_evolucao: int
    id_aluno: int
    data_avaliacao: date
    descricao: str
    obsercacoes: str | None = None