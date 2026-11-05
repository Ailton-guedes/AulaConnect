
# Importa os recursos necessários do FastAPI
from fastapi import APIRouter, Depends, HTTPException, status

# Permite trabalhar com sessões do banco de dados
from sqlalchemy.orm import Session

# Importa a conexão com o MySQL
from backend.database.connection import get_db

# Biblioteca utilizada para calcular a duração dos contratos
from dateutil.relativedelta import relativedelta

# Importa os modelos do banco de dados
from backend.models.aluno import Aluno
from backend.models.plano import Plano
from backend.models.contrato import Contrato

# Importa os schemas de validação e resposta
from backend.schemas.contrato import (
    ContratoCreate,
    ContratoResponse
)


# Configura as rotas de contratos
router = APIRouter(
    prefix="/contratos",
    tags=["Contratos"]
)


# ==========================================================
# CADASTRAR CONTRATO
# ==========================================================

@router.post(
    "/",
    response_model=ContratoResponse,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_contrato(
    dados: ContratoCreate,
    db: Session = Depends(get_db)
):

    # Verifica se o aluno informado existe
    aluno = db.query(Aluno).filter(
        Aluno.id_aluno == dados.id_aluno
    ).first()

    if aluno is None:
        raise HTTPException(
            status_code=404,
            detail="Aluno não encontrado."
        )

    # Verifica se o plano informado existe
    plano = db.query(Plano).filter(
        Plano.id_plano == dados.id_plano
    ).first()

    if plano is None:
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

    # Calcula a data final com base na duração do plano
    # Exemplo: 04/11/2026 + 6 meses = 04/05/2027
    nova_data_fim = dados.data_inicio + relativedelta(
        months=plano.duracao_meses
    )

    # Verifica se o aluno já possui um contrato ativo
    # com datas que se sobrepõem ao novo contrato
    contrato_existente = db.query(Contrato).filter(
        Contrato.id_aluno == dados.id_aluno,
        Contrato.status == "ativo",
        Contrato.data_inicio < nova_data_fim,
        Contrato.data_fim > dados.data_inicio
    ).first()

    # Impede contratos ativos com períodos sobrepostos
    if contrato_existente is not None:
        raise HTTPException(
            status_code=409,
            detail="O aluno já possui um contrato ativo neste período."
        )

    # Cria o novo contrato
    novo_contrato = Contrato(
        id_aluno=dados.id_aluno,
        id_plano=dados.id_plano,
        data_inicio=dados.data_inicio,
        data_fim=nova_data_fim,
        valor_mensal=dados.valor_mensal,
        status="ativo"
    )

    # Salva o contrato no MySQL
    try:
        db.add(novo_contrato)
        db.commit()
        db.refresh(novo_contrato)

    except Exception:
        db.rollback()
        raise

    # Retorna os dados do contrato cadastrado
    return novo_contrato


# ==========================================================
# LISTAR TODOS OS CONTRATOS
# ==========================================================

@router.get(
    "/",
    response_model=list[ContratoResponse]
)
def listar_contratos(
    db: Session = Depends(get_db)
):

    # Busca todos os contratos em ordem de cadastro
    contratos = db.query(Contrato).order_by(
        Contrato.id_contrato
    ).all()

    return contratos


# ==========================================================
# CONSULTAR CONTRATOS DE UM ALUNO
# ==========================================================

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

    if aluno is None:
        raise HTTPException(
            status_code=404,
            detail="Aluno não encontrado."
        )

    # Busca os contratos do aluno, começando pelos recentes
    contratos = db.query(Contrato).filter(
        Contrato.id_aluno == id_aluno
    ).order_by(
        Contrato.data_inicio.desc(),
        Contrato.id_contrato.desc()
    ).all()

    return contratos


# ==========================================================
# CONSULTAR CONTRATO PELO ID
# ==========================================================

@router.get(
    "/{id_contrato}",
    response_model=ContratoResponse
)
def buscar_contrato(
    id_contrato: int,
    db: Session = Depends(get_db)
):

    # Busca o contrato pelo identificador
    contrato = db.query(Contrato).filter(
        Contrato.id_contrato == id_contrato
    ).first()

    # Retorna erro caso não exista
    if contrato is None:
        raise HTTPException(
            status_code=404,
            detail="Contrato não encontrado."
        )

    # Retorna o contrato encontrado
    return contrato
