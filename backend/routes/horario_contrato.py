
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
from backend.models.plano import Plano

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
    
    # Impede adicionar horários em contratos inativos
    if contrato.status != "ativo":
        raise HTTPException(
            status_code=400,
            detail="O contrato não está ativo."
        )

    # Consulta o plano vinculado ao contrato
    plano = db.query(Plano).filter(
        Plano.id_plano == contrato.id_plano
    ).first()

    if plano is None:
        raise HTTPException(
            status_code=404,
            detail="Plano do contrato não encontrado."
        )

    # Planos antigos sem frequência definida
    # não podem receber novos horários
    if plano.aulas_por_semana is None:
        raise HTTPException(
            status_code=400,
            detail="O plano não possui frequência semanal definida."
        )

    # Conta os horários já cadastrados no contrato
    quantidade_horarios = db.query(HorarioContrato).filter(
        HorarioContrato.id_contrato == contrato.id_contrato
    ).count()

    # Impede ultrapassar o limite de aulas semanais
    if quantidade_horarios >= plano.aulas_por_semana:
        raise HTTPException(
            status_code=409,
            detail=(
                "O contrato já atingiu o limite de "
                f"{plano.aulas_por_semana} aulas semanais."
            )
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

        # Relaciona os números aos dias da semana
        dias_semana = {
            0: "segunda-feira",
            1: "terça-feira",
            2: "quarta-feira",
            3: "quinta-feira",
            4: "sexta-feira",
            5: "sábado",
            6: "domingo"
        }

        # Converte o dia informado para texto
        dia_escolhido = dias_semana[dados.dia_semana]

        # Normaliza o texto cadastrado no banco
        dia_aula = aula.dia_semana.strip().lower()

        # Verifica se o dia corresponde ao da aula
        if dia_aula != dia_escolhido:
            raise HTTPException(
                status_code=400,
                detail=(
                    "O dia selecionado não corresponde "
                    "ao dia cadastrado para esta aula."
                )
            )

        # Verifica se o horário corresponde ao da aula
        if aula.horario != dados.horario_inicio:
            raise HTTPException(
                status_code=400,
                detail=(
                    "O horário selecionado não corresponde "
                    "ao horário cadastrado para esta aula."
                )
            )
                # Verifica se a aula possui capacidade definida
        if aula.capacidade is None or aula.capacidade <= 0:
            raise HTTPException(
                status_code=400,
                detail="A aula não possui uma capacidade válida."
            )

        # Conta os alunos vinculados à mesma aula
        # considerando contratos ativos com períodos sobrepostos
        alunos_matriculados = (
            db.query(HorarioContrato)
            .join(
                Contrato,
                HorarioContrato.id_contrato == Contrato.id_contrato
            )
            .filter(
                HorarioContrato.id_aula == dados.id_aula,
                Contrato.status == "ativo",
                Contrato.data_inicio < contrato.data_fim,
                Contrato.data_fim > contrato.data_inicio
            )
            .with_entities(Contrato.id_aluno)
            .distinct()
            .count()
        )

        # Impede ultrapassar a capacidade máxima da aula
        if alunos_matriculados >= aula.capacidade:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Esta aula já atingiu sua capacidade "
                    "máxima de alunos."
                )
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
