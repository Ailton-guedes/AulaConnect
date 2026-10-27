
# Importa os recursos necessários do FastAPI e do SQLAlchemy
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Importa a conexão com o banco de dados
from backend.database.connection import get_db

# Importa os modelos do banco
from backend.models.pagamento import Pagamento
from backend.models.aluno import Aluno

# Importa os schemas de entrada e resposta
from backend.schemas.pagamento import PagamentoCreate, PagamentoResponse

# Cria o roteador de pagamentos
router = APIRouter(
    prefix="/pagamentos",
    tags=["Pagamentos"]
)


# Rota para cadastrar um pagamento
@router.post(
    "/",
    response_model=PagamentoResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_pagamento(
    pagamento: PagamentoCreate,
    db: Session = Depends(get_db)
):
    # Verifica se o aluno informado existe
    aluno = db.query(Aluno).filter(
        Aluno.id_aluno == pagamento.id_aluno
    ).first()

    if aluno is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado."
        )

    # Cria o pagamento com os dados recebidos
    novo_pagamento = Pagamento(**pagamento.model_dump())

    try:
        db.add(novo_pagamento)
        db.commit()
        db.refresh(novo_pagamento)
    except Exception:
        db.rollback()
        raise

    return novo_pagamento


# Rota para listar todos os pagamentos
@router.get("/", response_model=list[PagamentoResponse])
def listar_pagamentos(db: Session = Depends(get_db)):
    return db.query(Pagamento).all()


# Rota para editar um pagamento existente
@router.put(
    "/{id_pagamento}",
    response_model=PagamentoResponse
)
def editar_pagamento(
    id_pagamento: int,
    dados: PagamentoCreate,
    db: Session = Depends(get_db)
):
    # Busca o pagamento pelo ID
    pagamento = db.query(Pagamento).filter(
        Pagamento.id_pagamento == id_pagamento
    ).first()

    # Verifica se o pagamento existe
    if pagamento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado."
        )

    # Verifica se o aluno informado existe
    aluno = db.query(Aluno).filter(
        Aluno.id_aluno == dados.id_aluno
    ).first()

    if aluno is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado."
        )

    # Atualiza os campos do pagamento
    for campo, valor in dados.model_dump().items():
        setattr(pagamento, campo, valor)

    try:
        db.commit()
        db.refresh(pagamento)
    except Exception:
        db.rollback()
        raise

    return pagamento


# Rota para excluir um pagamento
@router.delete("/{id_pagamento}")
def excluir_pagamento(
    id_pagamento: int,
    db: Session = Depends(get_db)
):
    # Busca o pagamento pelo ID
    pagamento = db.query(Pagamento).filter(
        Pagamento.id_pagamento == id_pagamento
    ).first()

    # Verifica se o pagamento existe
    if pagamento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado."
        )

    try:
        db.delete(pagamento)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"mensagem": "Pagamento excluído com sucesso."}
