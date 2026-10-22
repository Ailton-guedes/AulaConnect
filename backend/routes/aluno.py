
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

# Rota para editar os dados de um aluno existente
@router.put("/{id_aluno}", response_model= AlunoResponse)
def editar_aluno(
    id_aluno: int,
    dados_aluno: AlunoCreate,
    db:Session = Depends(get_db)
):
# Busca o aluno pelo ID informado na URL
    aluno = db.query(Aluno).filter(
        Aluno.id_aluno == id_aluno
    ).first()
# Se não encontrar, retorna erro 404
    if aluno is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado."
        )
# Se um responsável foi informado, verifica se ele existe
    if dados_aluno.id_responsavel is not None:
        responsavel = db.query(Responsavel).filter(
            Responsavel.id_responsavel == dados_aluno.id_responsavel
        ).first()

        if responsavel is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Responsável não encontrado."
            )
# Atualiza os campos do aluno com os dados recebidos
    aluno.nome = dados_aluno.nome
    aluno.data_nascimento = dados_aluno.data_nascimento
    aluno.sexo = dados_aluno.sexo
    aluno.observacoes = dados_aluno.observacoes
    aluno.id_responsavel = dados_aluno.id_responsavel

# Salva as alterações no banco
    try:
        db.commit()
        db.refresh(aluno)
    except Exception:
        db.rollback()
        raise
# Retorna aluno atualizado
    return aluno

 # Rota para excluir um aluno pelo ID
@router.delete("/{Id_aluno}")
def excluir_aluno(
    id_aluno: int,
    db: Session = Depends(get_db)
):
# Buscar o aluno que será excluído
    aluno = db.query(Aluno).filter(
        Aluno.id_aluno == id_aluno
    ).first()
# Verifica se o aluno existe
    if aluno is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado."
        )
    try:
        db.delete(aluno)
    except Exception:
        db.rollback()
        raise

    return {"Aluno excluido com sucesso"}