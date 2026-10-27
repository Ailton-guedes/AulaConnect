# Importa os tipos de coluna necessários dp AQLAlchemy
from sqlalchemy import Column, Integer, String, Date, Numeric,ForeignKey

# Importa a Base dos modelos do projeto
from backend.database.connection import Base

# Representa a tabela pagamentos do MySQL
class Pagamento(Base):
    __tablename__ ="pagamentos"

    # Identificador único do pagamento
    id_pagamento = Column(
        Integer,
        primary_key=True,
        autoincrement=True   
    )
    # Aluno associado ao pagamento
    id_aluno = Column(
        Integer,
        ForeignKey("alunos.id_aluno"),
        nullable=False
    )
    # Valor do pagamento, com duas casas decimais
    valor = Column(Numeric(10,2), nullable=False)
    # Data limite para realizar o pagamento
    data_vencimento = Column(Date, nullable=False)
    # Data em que o pagamento foi realizado
    data_pagamento = Column(Date, nullable=True)
    # Situação do pagento: por exemplo, PENDENTE ou PAGO
    status = Column(String(30), nullable=False)
    # Forma utilizada para pagar, se informada
    forma_pagamento = Column(String(30), nullable=True)