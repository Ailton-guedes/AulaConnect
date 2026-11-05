
# Importa os recursos do FastAPI
from fastapi import FastAPI, Depends

# Permite a comunicação entre Front-end e Back-end
from fastapi.middleware.cors import CORSMiddleware

# Importa a classe Session do SQLAlchemy
from sqlalchemy.orm import Session

# Importa a função que cria e fecha a sessão do banco
from backend.database.connection import get_db


# Importa as rotas de usuários
from backend.routes.usuario import router as usuario_router

# Importa as rotas de responsáveis
from backend.routes.responsavel import router as responsavel_router

# Importa as rotas de alunos
from backend.routes.aluno import router as aluno_router

# Importa as rotas de aulas
from backend.routes.aula import router as aula_router

# Importa as rotas de agendamentos
from backend.routes.angendamento import router as agendamento_router

# Importa as rotas de pagamentos
from backend.routes.pagamento import router as pagamento_router

# Importa as rotas de evoluções
from backend.routes.evolucao import router as evolucao_router

# Importa as rotas de notificações
from backend.routes.notificacao import router as notificacao_router

# Importa as rotas de planos
from backend.routes.plano import router as plano_router

# Importa as rotas de contratos
from backend.routes.contrato import router as contrato_router

# Importa as rotas de horários dos contratos
from backend.routes.horario_contrato import router as horario_contrato_router


# Cria a aplicação FastAPI
app = FastAPI()


# Configura o acesso do Front-end ao Back-end
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


# Registra as rotas da aplicação
app.include_router(usuario_router)
app.include_router(responsavel_router)
app.include_router(aluno_router)
app.include_router(aula_router)
app.include_router(agendamento_router)
app.include_router(pagamento_router)
app.include_router(evolucao_router)
app.include_router(notificacao_router)
app.include_router(plano_router)
app.include_router(contrato_router)
app.include_router(horario_contrato_router)


# Rota principal do sistema
@app.get("/")
def inicio():
    return {
        "mensagem": "AulaConnect está funcionando!"
    }


# Rota para testar a conexão do FastAPI com o banco
@app.get("/teste-banco")
def teste_banco(db: Session = Depends(get_db)):
    return {
        "mensagem": "FastAPI conectado ao banco com sucesso!"
    }
