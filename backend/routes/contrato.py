
# Recursos necessários do FastAPI
from fastapi import APIRouter, Depends, HTTPException, status

# Sessão do banco de dados
from sqlalchemy.orm import Session
from backend.database.connection import get_db

# Biblioteca para calcular meses
from dateutil.relativedelta import relativedelta

# Modelos do banco
from backend.models.aluno import Aluno
from backend.models.plano import Plano
from backend.models.contrato import Contrato

# Schemas de contratos
from backend.schemas.contrato import ContratoCreate, ContratoResponse


# Configuração das rotas
router = APIRouter(
    prefix="/contratos",
    tags=["Contratos"]
)


# Cadastrar um contrato
@router.post(
    "/",
    response_model=ContratoResponse,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_contrato(
    dados: ContratoCreate,
    db: Session = Depends(get_db)
):

    # Verifica se o aluno existe
    aluno = db.query(Aluno).filter(
        Aluno.id_aluno == dados.id_aluno
    ).first()

    if not aluno:
        raise HTTPException(
            status_code=404,
            detail="Aluno não encontrado."
        )

    # Verifica se o plano existe
    plano = db.query(Plano).filter(
        Plano.id_plano == dados.id_plano
    ).first()

    if not plano:
        raise HTTPException(
            status_code=404,
            detail="Plano não encontrado."
        )

    # Impede contratar um plano desativado
    if not plano.ativo:
        raise HTTPException(
            status_code=400,
            detail="Este plano está desativado."
        )

    # Impede cadastrar um segundo contrato ativo
    # com período sobreposto para o mesmo aluno
    contrato_existente = db.query(Contrato).filter(
        Contrato.id_aluno == dados.id_aluno,
        Contrato.status == "ativo",
        Contrato.data_inicio <= (
            dados.data_inicio
            + relativedelta(months=plano.duracao_meses)
        ),
        Contrato.data_fim >= dados.data_inicio
    ).first()

    if contrato_existente:
        raise HTTPException(
            status_code=409,
            detail="O aluno já possui um contrato ativo neste período."
        )

    # Calcula automaticamente a data de vencimento
    data_fim = dados.data_inicio + relativedelta(
        months=plano.duracao_meses
    )

    # Cria o contrato
    novo_contrato = Contrato(
        id_aluno=dados.id_aluno,
        id_plano=dados.id_plano,
        data_inicio=dados.data_inicio,
        data_fim=data_fim,
        valor_mensal=dados.valor_mensal,
        status="ativo"
    )

    # Salva no MySQL
    db.add(novo_contrato)
    db.commit()
    db.refresh(novo_contrato)

    return novo_contrato


# Listar todos os contratos
@router.get("/", response_model=list[ContratoResponse])
def listar_contratos(
    db: Session = Depends(get_db)
):
    return db.query(Contrato).order_by(
        Contrato.id_contrato
    ).all()


# Consultar contrato pelo ID
@router.get(
    "/{id_contrato}",
    response_model=ContratoResponse
)
def buscar_contrato(
    id_contrato: int,
    db: Session = Depends(get_db)
):

    contrato = db.query(Contrato).filter(
        Contrato.id_contrato == id_contrato
    ).first()

    if not contrato:
        raise HTTPException(
            status_code=404,
            detail="Contrato não encontrado."
        )

# Lista todos os contratos de um aluno específico
@router.get(
    "/aluno/{id_aluno}",
    response_model=list[ContratoResponse]
)
def listar_contratos_aluno(
    id_aluno: int,
    db: Session = Depends(get_db)
):
    # Verifica se o aluno existe
    aluno = db.query(Aluno).filter(
        Aluno.id_aluno == id_aluno
    ).first()

    if not aluno:
        raise HTTPException(
            status_code=404,
            detail="Aluno não encontrado."
        )

    # Busca todos os contratos do aluno,
    # começando pelos mais recentes
    contratos = db.query(Contrato).filter(
        Contrato.id_aluno == id_aluno
    ).order_by(
        Contrato.data_inicio.desc(),
        Contrato.id_contrato.desc()
    ).all()

    return contratos
    
