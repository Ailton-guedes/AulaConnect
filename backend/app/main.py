# importando o FastAPI, usada para criar a nossa API

from fastapi import FastAPI, Depends

# Permite a comunicaçõa entre Front-end e o Back-end
from fastapi.middleware.cors import CORSMiddleware

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
# Importando as rotas de evolução
from backend.routes.evolucao import router as evolucao_router
# Importando as rotas de notificações
from backend.routes.notificacao import router as notificacao_router
# Importando as rotas de planos
from backend.routes import plano
# importando as rotas de contratos
from backend.routes import contrato


# Cria a aplicação FastAPI
app = FastAPI()

# Configuração de acesso do Front-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuario_router) # conecta as rotas de usuários
app.include_router(responsavel_router) # conecta as rotas de responsável
app.include_router(aluno_router) # conecta as rotas de aluno
app.include_router(aula_router) # conecta as rotas de aula
app.include_router(agendamento_router) # conecta as rotas de agendamento
app.include_router(pagamento_router) # conecta as rotas de pagamentos
app.include_router(evolucao_router) # conecta as rotas de evolução
app.include_router(notificacao_router)# conecta as rotas de notificações
app.include_router(plano.router) # conecta as rotas de plano
app.include_router(contrato.router) # conecta as rotas de contrato

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