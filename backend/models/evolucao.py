# Importa os tipos de dados necessários do SQLAlchemy
from sqlalchemy import Column, Integer, Date, Text, ForeignKey

# Importa a classe Base usada nos modelos do projeto
from backend.database.connection import Base

# Representa a tabela evoluções do MySQL
class Evolucao(Base):
    __tablename__ = "evoluções"

    # Identificador único da evolução
    id_evolucao = Column(Integer, primary_key=True, autoincrement=True)

# Aluno relacionado a esta evolução
id_aluno = Column(Integer, ForeignKey("aluno.id_aluno"), nullable=False)

# Data em que o aluno foi avaliado 
data_avaliacao = Column(Date, nullable=False)

# Descrição do progresso observado
descricao = Column(Text, nullable=False)

# Observações adcionais, se houver
observacoes = Column(Text, nullable=True)