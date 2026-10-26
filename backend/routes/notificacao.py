
# Importa os recursos necessários do FastAPI
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Importa a conexão com o banco de dados
from backend.database.connection import get_db

# Importa os modelos necessários
from backend.models.notificacao import Notificacao
from backend.models.usuario import Usuario

# Importa os schemas de entrada e resposta
from backend.schemas.notificacao import (
    NotificacaoCreate,
    NotificacaoResponse
)


# Cria o roteador de notificações
router = APIRouter(
    prefix="/notificacoes",
    tags=["Notificações"]
)


# Rota para cadastrar uma notificação
@router.post(
    "/",
    response_model=NotificacaoResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_notificacao(
    dados: NotificacaoCreate,
    db: Session = Depends(get_db)
):
    # Se foi informado um usuário, verifica se ele existe
    if dados.id_usuario is not None:
        usuario = db.query(Usuario).filter(
            Usuario.id_usuario == dados.id_usuario
        ).first()

        if usuario is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado."
            )

    # Cria o registro da notificação
    nova_notificacao = Notificacao(**dados.model_dump())

    try:
        db.add(nova_notificacao)
        db.commit()
        db.refresh(nova_notificacao)
    except Exception:
        db.rollback()
        raise

    return nova_notificacao


# Rota para listar todas as notificações
@router.get("/", response_model=list[NotificacaoResponse])
def listar_notificacoes(db: Session = Depends(get_db)):
    return db.query(Notificacao).all()


# Rota para marcar uma notificação como lida
@router.patch(
    "/{id_notificacao}/lida",
    response_model=NotificacaoResponse
)
def marcar_como_lida(
    id_notificacao: int,
    db: Session = Depends(get_db)
):
    # Busca a notificação pelo ID
    notificacao = db.query(Notificacao).filter(
        Notificacao.id_notificacao == id_notificacao
    ).first()

    if notificacao is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada."
        )

    # Atualiza o campo que indica se a notificação foi lida
    notificacao.lida = True

    try:
        db.commit()
        db.refresh(notificacao)
    except Exception:
        db.rollback()
        raise

    return notificacao
