# Importa as ferramentas de validação do Pydantic
from pydantic import BaseModel, ConfigDict, Field

# Importa os tipos para as datas e valores monetários
from datetime import date
from decimal import Decimal

# Define os dados necessários para cadastrar um pagamento
class PagamentoCreate(BaseModel):
    id_aluno: int
    valor: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    data_vencimento: date
    data_pagamento: date | None = None
    status: str = Field(min_length=1, max_length=30)
    forma_pagamento: str | None = Field(default=None, max_length=30)

# Define os dados devolvidos pela API

class PagamentoResponse(BaseModel):
    # Permite converter objetos SQLAlchemy em respostas Pydantic
    model_config = ConfigDict(from_attributes=True)

    id_pagamento: int
    id_aluno: int
    valor: Decimal
    data_vencimento: date
    data_pagamento: date | None = None
    status: str
    forma_pagamento: str | None = None


