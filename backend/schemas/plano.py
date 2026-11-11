
# Importa os recursos do Pydantic
from pydantic import BaseModel, ConfigDict, Field

# Importa os tipos de data e valores monetários
from datetime import datetime
from decimal import Decimal
from typing import Literal


# Dados recebidos para cadastrar um novo plano
class PlanoCreate(BaseModel):

    # Nome do plano
    nome: str = Field(min_length=1, max_length=50)

    # Duração permitida: mensal, trimestral ou semestral
    duracao_meses: Literal[1, 3, 6]

    # Quantidade de aulas por semana
    aulas_por_semana: Literal[1, 2]

    # Valor mensal do plano
    # Temporariamente aceita zero até definir os preços
    valor_mensal: Decimal = Field(
        ge=0,
        max_digits=10,
        decimal_places=2
    )

    # Descrição opcional
    descricao: str | None = None

    # Indica se o plano está disponível
    ativo: bool = True


# Dados recebidos para atualizar um plano
class PlanoUpdate(BaseModel):

    # Todos os campos são opcionais na edição
    nome: str | None = Field(
        default=None,
        min_length=1,
        max_length=50
    )

    duracao_meses: Literal[1, 3, 6] | None = None

    aulas_por_semana: Literal[1, 2] | None = None

    valor_mensal: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=10,
        decimal_places=2
    )

    descricao: str | None = None

    ativo: bool | None = None


# Dados devolvidos pela API
class PlanoResponse(BaseModel):

    # Permite converter objetos do SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

    id_plano: int

    nome: str

    duracao_meses: int

    # Permite NULL para o plano antigo de teste
    aulas_por_semana: int | None

    valor_mensal: Decimal

    descricao: str | None

    ativo: bool | None

    data_cadastro: datetime | None
