
# Importa os recursos do Pydantic
from pydantic import BaseModel, ConfigDict, Field

# Importa os tipos de data e valores monetários
from datetime import date, datetime
from decimal import Decimal
from typing import Literal


# Situações permitidas para um contrato
StatusContrato = Literal[
    "ativo",
    "encerrado",
    "cancelado"
]


# Dados recebidos para cadastrar um contrato
class ContratoCreate(BaseModel):

    # Aluno que está contratando o plano
    id_aluno: int = Field(gt=0)

    # Plano escolhido pelo responsável
    id_plano: int = Field(gt=0)

    # Data de início do contrato
    data_inicio: date

    # Valor mensal acordado com o responsável
    valor_mensal: Decimal = Field(
        ge=0,
        max_digits=10,
        decimal_places=2
    )


# Dados recebidos para atualizar um contrato
class ContratoUpdate(BaseModel):

    # Permite alterar a situação do contrato
    status: StatusContrato | None = None


# Dados devolvidos pela API
class ContratoResponse(BaseModel):

    # Permite converter objetos SQLAlchemy em respostas
    model_config = ConfigDict(from_attributes=True)

    id_contrato: int

    id_aluno: int

    id_plano: int

    data_inicio: date

    data_fim: date

    valor_mensal: Decimal

    status: StatusContrato

    data_cadastro: datetime
