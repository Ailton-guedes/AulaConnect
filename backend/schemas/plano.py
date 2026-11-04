
# Importa os recursos do Pydantic
from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal


# Dados recebidos para cadastrar um plano
class PlanoCreate(BaseModel):

    # Nome do plano
    nome: str

    # Duração em meses (mínimo de 1 mês)
    duracao_meses: int = Field(gt=0)

    # Valor mensal do plano
    valor_mensal: Decimal = Field(ge=0, decimal_places=2)

    # Indica se o plano está ativo
    ativo: bool = True


# Dados devolvidos pela API
class PlanoResponse(BaseModel):

    # Permite converter objetos do SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

    id_plano: int
    nome: str
    duracao_meses: int
    valor_mensal: Decimal
    ativo: bool | None = True
