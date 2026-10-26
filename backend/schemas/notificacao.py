# Importa recursos do Pydantic para validar os dados
from pydantic import BaseModel, ConfigDict, Field

# Importa o tipo para representar data e hora
from datetime import datetime


# Dados necessários para cadastrar uma notificação
class NotificacaoCreate(BaseModel):
    id_usuario: int | None = None
    titulo: str = Field(min_length=1, max_length=100)
    mensagem: str = Field(min_length=1)
    tipo: str | None = Field(default=None, max_length=30)

# Dados que API devolverá na resposta
class NotificacaoResponse(BaseModel):
    # Permite conerter ojetivos do SQLALchememy respostas
    model_config = ConfigDict(from_attributes=True)

    id_notificacao: int
    id_usuario: int | None = None
    titulo: str
    mensagem: str
    tipo: str | None = None
    lida: bool
    data_envio: datetime