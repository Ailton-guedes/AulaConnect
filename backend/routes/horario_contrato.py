
# Importa os recursos do FastAPI
from fastapi import APIRouter, Depends, HTTPException, status

# Permite trabalhar com sessões do banco de dados
from sqlalchemy.orm import Session

# Importa a conexão com o MySQL
from backend.database.connection import get_db

# Importa os modelos necessários
from backend.models.horario_contrato import HorarioContrato
from backend.models.contrato import Contrato
from backend.models.aula import Aula

# Importa os schemas de validação
from backend.schemas.horario_contrato import (
    HorarioContratoCreate,
    HorarioContratoResponse
)


# Define o grupo de rotas
router = APIRouter(
    prefix="/horarios-contrato",
    tags=["Horários do Contrato"]
)


# Rota para cadastrar um horário semanal
@router.post(
    "/",
    response_model=HorarioContratoResponse,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_horario(
    dados: HorarioContratoCreate,
    db: Session = Depends(get_db)
):

    # Verifica se o contrato existe
    contrato = db.query(Contrato).filter(
        Contrato.id_contrato == dados.id_contrato
    ).first()

    if contrato is None:
        raise HTTPException(
            status_code=404,
            detail="Contrato não encontrado."
        )

    # Verifica se a aula existe, quando informada
    if dados.id_aula is not None:
        aula = db.query(Aula).filter(
            Aula.id_aula == dados.id_aula
        ).first()

        if aula is None:
            raise HTTPException(
                status_code=404,
                detail="Aula não encontrada."
            )

    # Impede cadastrar o mesmo horário duas vezes
    horario_existente = db.query(HorarioContrato).filter(
        HorarioContrato.id_contrato == dados.id_contrato,
        HorarioContrato.dia_semana == dados.dia_semana,
        HorarioContrato.horario_inicio == dados.horario_inicio
    ).first()

    if horario_existente is not None:
        raise HTTPException(
            status_code=409,
            detail="Este horário já está cadastrado para o contrato."
        )

    # Cria o novo horário semanal
    novo_horario = HorarioContrato(
        id_contrato=dados.id_contrato,
        id_aula=dados.id_aula,
        dia_semana=dados.dia_semana,
        horario_inicio=dados.horario_inicio
    )

    # Salva no banco de dados
    try:
        db.add(novo_horario)
        db.commit()
        db.refresh(novo_horario)
    except Exception:
        db.rollback()
        raise

    return novo_horario


# Rota para listar todos os horários
@router.get(
    "/",
    response_model=list[HorarioContratoResponse]
)
def listar_horarios(
    db: Session = Depends(get_db)
):
    return db.query(HorarioContrato).all()


# Rota para consultar horários de um contrato
@router.get(
    "/contrato/{id_contrato}",
    response_model=list[HorarioContratoResponse]
)
def listar_horarios_por_contrato(
    id_contrato: int,
    db: Session = Depends(get_db)
):

    # Verifica se o contrato existe
    contrato = db.query(Contrato).filter(
        Contrato.id_contrato == id_contrato
    ).first()

    if contrato is None:
        raise HTTPException(
            status_code=404,
            detail="Contrato não encontrado."
        )

    # Retorna os horários cadastrados para o contrato
    return db.query(HorarioContrato).filter(
        HorarioContrato.id_contrato == id_contrato
    ).order_by(
        HorarioContrato.dia_semana,
        HorarioContrato.horario_inicio
    ).all()
