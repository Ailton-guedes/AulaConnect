# importando o FastAPI, usada para criar a nossa API

from fastapi import FastAPI, Depends

# importa a classe Session do SQLalchemy
# Ela representa uma sesão de comunicação com banco
from sqlalchemy.orm import Session

# Importa a função que cria e fecha a sessão do banco
from backend.database.connection import get_db

# Importando as rotas de usuário
from backend.routes.usuario import router as usuario_router
# Importando as rotas de responsável
from backend.routes.responsavel import router as responsavel_router
# Importando as rotas de Aluno
from backend.routes.aluno import router as aluno_router
# Importando as rotas de Aula
from backend.routes.aula import router as aula_router 
# Importando as rotas de agendamentos
from backend.routes.angendamento import router as agendamento_router
# Imortando as rotas de pagamentos
from backend.routes.pagamento import router as pagamento_router


# Cria a aplicação FastAPI
app = FastAPI()


app.include_router(usuario_router) # conecta as rotas de usuários
app.include_router(responsavel_router) # conecta as rotas de responsável
app.include_router(aluno_router) # conecta as rotas de aluno
app.include_router(aula_router) # conecta as rotas de aula
app.include_router(agendamento_router) # conecta as rotas de agendamento
app.include_router(pagamento_router) # conecta as rotas de pagamentos
# Rota principal do sistema
@app.get("/")
def inicio():
    return {
        "AulaConmect está funcionando!"
    }

# Rota para testa a conexão do FastAPI com o banco
@app.get("/teste-banco")
def teste_banco(db: Session = Depends(get_db)):
    return {
         "FastAPI conectado ao banco com sucesso!"
    }