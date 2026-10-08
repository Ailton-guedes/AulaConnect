# importando o FastAPI, usada para criar a nossa API

from fastapi import FastAPI, Depends

# importa a classe Session do SQLalchemy
# Ela representa uma sesão de comunicação com banco
from sqlalchemy.orm import Session

# Importa a função que cria e fecha a sessão do banco
from backend.database.connection import get_db

# Importando as rotas de usuário
from backend.routes.usuario import router as usuario_router


# Cria a aplicação FastAPI
app = FastAPI()


# conecta as rotas de usuários á aplicação
app.include_router(usuario_router)

# Rota principal do sitema
@app.get("/")
def inicio():
    return {
        "mensagem": "AulaConnect funcionando!"
    }

# Rota para testa a conexão do FastAPI com o banco
@app.get("/teste-banco")
def teste_banco(db: Session = Depends(get_db)):
    return {
         "mensagem": "FastAPI conectado ao banco com sucesso!"
    }