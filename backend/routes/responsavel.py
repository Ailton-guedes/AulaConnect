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


# Rota para editar um responsável pelo ID
@router.put(
    "/{id_responsavel}",
    response_model=ResponsavelResponse
)
def editar_responsavel(
    id_responsavel: int,
    dados: ResponsavelCreate,
    db: Session = Depends(get_db)
):
    # Busca o responsável pelo ID informado
    responsavel = db.query(Responsavel).filter(
        Responsavel.id_responsavel == id_responsavel
    ).first()

    # Se não encontrar, retorna erro 404
    if responsavel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Responsável não encontrado."
        )

    # Atualiza os campos com os dados recebidos
    responsavel.nome = dados.nome
    responsavel.telefone = dados.telefone
    responsavel.email = dados.email
    responsavel.cpf = dados.cpf

    try:
        db.commit()
        db.refresh(responsavel)
    except Exception:
        db.rollback()
        raise

    return responsavel


# Rota para excluir um responsável pelo ID
@router.delete("/{id_responsavel}")
def excluir_responsavel(
    id_responsavel: int,
    db: Session = Depends(get_db)
):
    # Busca o responsável pelo ID informado
    responsavel = db.query(Responsavel).filter(
        Responsavel.id_responsavel == id_responsavel
    ).first()

    # Se não encontrar, retorna erro 404
    if responsavel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Responsável não encontrado."
        )

    try:
        db.delete(responsavel)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não foi possível excluir. Verifique se existem alunos vinculados a este responsável."
        )

    return {"Responsável excluído com sucesso."}
