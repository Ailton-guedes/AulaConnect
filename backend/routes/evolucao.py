# Importa os recursos necessários do FastAPI
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Importa a conexão com o banco de dados
from backend.database.connection import get_db

# Importa os modelos do banco
from backend.models.evolucao import Evolucao
from backend.models.aluno import Aluno

# Importa os schemas de entrada e resposta
from backend.schemas.evolucao import EvolucaoCreate, EvolucaoResponse

# Cria o roteador de evoluções
router = APIRouter(
    prefix="/evoluções",
    tags=["Evoluções"]
)
# Rota para cadastrar uma evolução
@router.post(
    "/",
    response_model=EvolucaoResponse,
    status_code=status.HTTP_201_CREATED)
def criar_evolucao(
    dados: EvolucaoCreate,
    db: Session = Depends(get_db)
):
# Verifica se o aluno informado existe
    aluno = db.query(Aluno).filter(
        Aluno.id_aluno == dados.id_aluno
    ).first()

    if aluno is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado."
        )
# Cria a evolução com os dados recebidos
    nova_evolucao = Evolucao(**dados.model_dump())

    try:
        db.add(nova_evolucao)
        db.commit()
        db.refresh(nova_evolucao)
    except Exception:
        db.rollback()
        raise

    return nova_evolucao

 # Rota para listar todas as evoluções
@router.get(
     "/",
    response_model=list[EvolucaoResponse])
def listar_evolucoes(
    db: Session = Depends(get_db)
):
    return db.query(Evolucao).all()
# Rota para editar uma evolução existente
@router.put(
    "/{id_evolucao}",
    response_model=EvolucaoResponse)
def editar_evolucao(
    id_evolucao: int,
    dados: EvolucaoCreate,
    db: Session = Depends(get_db)
):
# Busca a evolução pelo ID
    evolucao = db.query(Evolucao).filter(
        Evolucao.id_evolucao == id_evolucao
    ).first()

    if evolucao is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evolução não encontrada."
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
# Atualiza os campos da evolução
    for campo, valor in dados.model_dump().items():
        setattr(evolucao, campo, valor)

    try:
        db.commit()
        db.refresh(evolucao)
    except Exception:
        db.rollback()
        raise

    return evolucao

# Rota para excluir uma evolução
@router.delete("/{id_evolucao}")
def excluir_evolucao(
    id_evolucao: int,
    db: Session = Depends(get_db)
):
    # Busca a evolução pelo ID
    evolucao = db.query(Evolucao).filter(
        Evolucao.id_evolucao == id_evolucao
    ).first()

    if evolucao is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evolução não encontrada."
        )

    try:
        db.delete(evolucao)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"mensagem": "Evolução excluída com sucesso."}