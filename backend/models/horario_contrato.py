
# Importa os tipos de dados necessários do SQLAlchemy
from sqlalchemy import (
    Column,
    Integer,
    Time,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint
)

# Importa a Base utilizada pelos modelos do projeto
from backend.database.connection import Base


# Representa a tabela horarios_contrato do MySQL
class HorarioContrato(Base):

    # Nome da tabela existente no banco de dados
    __tablename__ = "horarios_contrato"

    # Restrições da tabela
    __table_args__ = (
        # Impede horários repetidos no mesmo contrato
        UniqueConstraint(
            "id_contrato",
            "dia_semana",
            "horario_inicio"
        ),

        # Permite apenas dias de segunda (0) a domingo (6)
        CheckConstraint("dia_semana BETWEEN 0 AND 6"),
    )

    # Identificador único do horário
    id_horario = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    # Contrato ao qual o horário pertence
    id_contrato = Column(
        Integer,
        ForeignKey("contratos.id_contrato"),
        nullable=False
    )

    # Aula associada ao horário
    id_aula = Column(
        Integer,
        ForeignKey("aulas.id_aula"),
        nullable=True
    )

    # Dia da semana: 0 = segunda, 6 = domingo
    dia_semana = Column(
        Integer,
        nullable=False
    )

    # Horário de início da aula
    horario_inicio = Column(
        Time,
        nullable=False
    )
