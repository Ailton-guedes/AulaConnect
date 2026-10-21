
# Recursos do FastAPI para criar rotas e tratar erros
from fastapi import APIRouter, Depends, HTTPException, status

# Recurso para acessar o banco de dados
from sqlalchemy.orm import Session

# Importa a conexão com o banco
from backend.database.connection import get_db

# Importa os modelos do banco
from backend.models.aluno import Aluno
from backend.models.responsavel import Responsavel

# Importa os schemas de aluno
from backend.schemas.aluno import AlunoCreate, AlunoResponse

# Cria um grupo de rotas para alunos
router = APIRouter(
    prefix="/alunos",
    tags=["Alunos"]
)


# Cadastra um novo aluno
@router.post(
    "/",
    response_model=AlunoResponse,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_aluno(
    aluno: AlunoCreate,
    db: Session = Depends(get_db)
):
    # Se foi informado um responsável, verifica se ele existe
    if aluno.id_responsavel is not None:
        responsavel = db.query(Responsavel).filter(
            Responsavel.id_responsavel == aluno.id_responsavel
        ).first()

        # Impede o cadastro com um responsável inexistente
        if responsavel is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Responsável não encontrado."
            )

    # Cria o objeto aluno com os dados recebidos
    novo_aluno = Aluno(
        nome=aluno.nome,
        data_nascimento=aluno.data_nascimento,
        sexo=aluno.sexo,
        observacoes=aluno.observacoes,
        id_responsavel=aluno.id_responsavel
    )

    try:
        db.add(novo_aluno)
        db.commit()
        db.refresh(novo_aluno)
    except Exception:
        db.rollback()
        raise

    return novo_aluno


# Lista os alunos cadastrados
@router.get(
    "/",
    response_model=list[AlunoResponse]
)
def listar_alunos(
    db: Session = Depends(get_db)
):
    alunos = db.query(Aluno).all()
    return alunos
