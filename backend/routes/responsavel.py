# Recursos do FastAPI para criar rotas e tratar erros
from fastapi import APIRouter, Depends, HTTPException, status

# Recurso para acessar o banco de dados
from sqlalchemy.orm import Session

# Importa a conexão com o banco
from backend.database.connection import get_db


# Importa o modelo e os schemas de responsável
from backend.models.responsavel import Responsavel
from backend.schemas.responsavel import (
    ResponsavelCreate,
    ResponsavelResponse
)

# Cria um grupo de rotas para responsáveis
router = APIRouter(
    prefix="/responsaveis",
    tags=["Responsáveis"]
)

# Cadastra um novo responsável
@router.post(
    "/",
    response_model=ResponsavelResponse,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_responsavel(
    responsavel: ResponsavelCreate,
    db: Session = Depends(get_db)
):
        # Verifica se o CPF já está cadastrado, quando informado
    if responsavel.cpf:
        cpf_existente = db.query(Responsavel).filter(
            Responsavel.cpf == responsavel.cpf
        ).first()

        if cpf_existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este CPF já está cadastrado."
            )

    # Cria o objeto com os dados recebidos
    novo_responsavel = Responsavel(
        nome=responsavel.nome,
        telefone=responsavel.telefone,
        email=responsavel.email,
        cpf=responsavel.cpf
    )

    try:
        db.add(novo_responsavel)
        db.commit()
        db.refresh(novo_responsavel)
    except Exception:
        db.rollback()
        raise

    return novo_responsavel

# Lista os responsáveis cadastrados
@router.get(
    "/",
    response_model=list[ResponsavelResponse]
)
def listar_responsaveis(
    db: Session = Depends(get_db)
):
    responsaveis = db.query(Responsavel).all()
    return responsaveis
