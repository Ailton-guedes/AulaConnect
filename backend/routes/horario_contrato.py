
# Importa os recursos do FastAPI
from fastapi import APIRouter, Depends, HTTPException, status

# Permite trabalhar com sessões do banco de dados
from sqlalchemy.orm import Session

# Permite trabalhar com horários e intervalos
from datetime import datetime, date, timedelta

# Permite normalizar os nomes dos dias da semana
import unicodedata

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
    HorarioContratoUpdate,
    HorarioContratoResponse
)


# Define o grupo de rotas
router = APIRouter(
    prefix="/horarios-contrato",
    tags=["Horários do Contrato"]
)


# ==========================================================
# FUNÇÕES AUXILIARES
# ==========================================================

def normalizar_texto(texto):
    # Remove diferenças entre maiúsculas e minúsculas
    # e acentos dos dias da semana
    texto = unicodedata.normalize(
        "NFD",
        texto.strip().lower()
    )

    return "".join(
        caractere
        for caractere in texto
        if unicodedata.category(caractere) != "Mn"
    )


def minutos_do_dia(horario):
    # Converte um horário em minutos desde meia-noite
    return horario.hour * 60 + horario.minute


def periodos_sobrepostos(inicio_a, fim_a, inicio_b, fim_b):
    # Dois intervalos se sobrepõem quando
    # um começa antes do outro terminar
    return inicio_a < fim_b and inicio_b < fim_a


def obter_duracao(horario, aula):
    # Prioriza a duração registrada no próprio horário
    if horario.duracao_minutos is not None:
        return horario.duracao_minutos

    # Compatibilidade com os horários antigos
    if aula is not None and aula.duracao is not None:
        return aula.duracao

    # Não inventa uma duração para horários antigos
    raise HTTPException(
        status_code=409,
        detail=(
            "Existe um horário antigo sem duração definida. "
            "Atualize esse registro antes de cadastrar "
            "novos horários para o professor."
        )
    )


# ==========================================================
# CADASTRAR HORÁRIO SEMANAL
# ==========================================================

@router.post(
    "/",
    response_model=HorarioContratoResponse,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_horario(
    dados: HorarioContratoCreate,
    db: Session = Depends(get_db)
):

    # Busca o contrato informado
    contrato = db.query(Contrato).filter(
        Contrato.id_contrato == dados.id_contrato
    ).first()

    if contrato is None:
        raise HTTPException(
            status_code=404,
            detail="Contrato não encontrado."
        )

    # Somente contratos ativos podem receber horários
    if contrato.status != "ativo":
        raise HTTPException(
            status_code=400,
            detail="O contrato não está ativo."
        )

    # Todo novo horário precisa de um professor
    if contrato.id_professor is None:
        raise HTTPException(
            status_code=400,
            detail="O contrato não possui professor responsável."
        )

    # Busca o plano do contrato
    plano = db.query(Plano).filter(
        Plano.id_plano == contrato.id_plano
    ).first()

    if plano is None:
        raise HTTPException(
            status_code=404,
            detail="Plano do contrato não encontrado."
        )

    # Verifica a frequência semanal do plano
    if plano.aulas_por_semana is None:
        raise HTTPException(
            status_code=400,
            detail="O plano não possui frequência semanal definida."
        )

    # Conta os horários existentes no contrato
    quantidade_horarios = db.query(HorarioContrato).filter(
        HorarioContrato.id_contrato == contrato.id_contrato
    ).count()

    # Impede ultrapassar a frequência semanal contratada
    if quantidade_horarios >= plano.aulas_por_semana:
        raise HTTPException(
            status_code=409,
            detail=(
                "O contrato já atingiu o limite de "
                f"{plano.aulas_por_semana} aulas semanais."
            )
        )

    # ======================================================
    # VALIDAR AULA VINCULADA, QUANDO INFORMADA
    # ======================================================

    aula = None

    if dados.id_aula is not None:
        aula = db.query(Aula).filter(
            Aula.id_aula == dados.id_aula
        ).first()

        if aula is None:
            raise HTTPException(
                status_code=404,
                detail="Aula não encontrada."
            )

        dias_semana = {
            0: "segunda-feira",
            1: "terca-feira",
            2: "quarta-feira",
            3: "quinta-feira",
            4: "sexta-feira",
            5: "sabado",
            6: "domingo"
        }

        dia_aula = normalizar_texto(aula.dia_semana)
        dia_escolhido = dias_semana[dados.dia_semana]

        if dia_aula != dia_escolhido:
            raise HTTPException(
                status_code=400,
                detail=(
                    "O dia selecionado não corresponde "
                    "ao dia cadastrado para esta aula."
                )
            )

        if aula.horario != dados.horario_inicio:
            raise HTTPException(
                status_code=400,
                detail=(
                    "O horário selecionado não corresponde "
                    "ao horário cadastrado para esta aula."
                )
            )

    # ======================================================
    # IMPEDIR HORÁRIO REPETIDO NO CONTRATO
    # ======================================================

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

    # ======================================================
    # CALCULAR O PERÍODO RESERVADO
    # ======================================================

    inicio_novo = minutos_do_dia(dados.horario_inicio)

    fim_novo = (
        inicio_novo
        + dados.duracao_minutos
        + dados.deslocamento_minutos
    )

    # Nesta versão, a reserva deve terminar no mesmo dia
    if fim_novo > 24 * 60:
        raise HTTPException(
            status_code=400,
            detail=(
                "O horário da aula e o deslocamento "
                "ultrapassam o fim do dia."
            )
        )

    # ======================================================
    # CONSULTAR HORÁRIOS DO MESMO PROFESSOR
    # ======================================================

    horarios_professor = (
        db.query(HorarioContrato, Contrato, Aula)
        .join(
            Contrato,
            HorarioContrato.id_contrato == Contrato.id_contrato
        )
        .outerjoin(
            Aula,
            HorarioContrato.id_aula == Aula.id_aula
        )
        .filter(
            Contrato.id_professor == contrato.id_professor,
            Contrato.status == "ativo",
            Contrato.data_inicio < contrato.data_fim,
            Contrato.data_fim > contrato.data_inicio,
            HorarioContrato.dia_semana == dados.dia_semana
        )
        .all()
    )

    # ======================================================
    # VERIFICAR CONFLITOS DE HORÁRIO E DESLOCAMENTO
    # ======================================================

    for horario, contrato_existente, aula_existente in horarios_professor:

        # Recupera a duração da aula já cadastrada
        duracao_existente = obter_duracao(
            horario,
            aula_existente
        )

        # Deslocamento já reservado para esse atendimento
        deslocamento_existente = (
            horario.deslocamento_minutos
            if horario.deslocamento_minutos is not None
            else 30
        )

        inicio_existente = minutos_do_dia(
            horario.horario_inicio
        )

        fim_existente = (
            inicio_existente
            + duracao_existente
            + deslocamento_existente
        )

        # Impede qualquer sobreposição entre reservas
        if periodos_sobrepostos(
            inicio_novo,
            fim_novo,
            inicio_existente,
            fim_existente
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    "Conflito na agenda do professor. "
                    f"O contrato {contrato_existente.id_contrato} "
                    "já possui uma aula ou intervalo de "
                    "deslocamento nesse período."
                )
            )

    # ======================================================
    # CADASTRAR NOVO HORÁRIO
    # ======================================================

    novo_horario = HorarioContrato(
        id_contrato=dados.id_contrato,
        id_aula=dados.id_aula,
        dia_semana=dados.dia_semana,
        horario_inicio=dados.horario_inicio,
        duracao_minutos=dados.duracao_minutos,
        deslocamento_minutos=dados.deslocamento_minutos
    )

    try:
        db.add(novo_horario)
        db.commit()
        db.refresh(novo_horario)

    except Exception:
        db.rollback()
        raise

    return novo_horario


# ==========================================================
# LISTAR TODOS OS HORÁRIOS
# ==========================================================

@router.get(
    "/",
    response_model=list[HorarioContratoResponse]
)
def listar_horarios(
    db: Session = Depends(get_db)
):
    return db.query(HorarioContrato).all()


# ==========================================================
# CONSULTAR HORÁRIOS DE UM CONTRATO
# ==========================================================

@router.get(
    "/contrato/{id_contrato}",
    response_model=list[HorarioContratoResponse]
)
def listar_horarios_por_contrato(
    id_contrato: int,
    db: Session = Depends(get_db)
):

    contrato = db.query(Contrato).filter(
        Contrato.id_contrato == id_contrato
    ).first()

    if contrato is None:
        raise HTTPException(
            status_code=404,
            detail="Contrato não encontrado."
        )

    return db.query(HorarioContrato).filter(
        HorarioContrato.id_contrato == id_contrato
    ).order_by(
        HorarioContrato.dia_semana,
        HorarioContrato.horario_inicio
    ).all()


# ==========================================================
# ATUALIZAR HORÁRIO SEMANAL DO CONTRATO
# ==========================================================

@router.put(
    "/{id_horario}",
    response_model=HorarioContratoResponse
)
def atualizar_horario(
    id_horario: int,
    dados: HorarioContratoUpdate,
    db: Session = Depends(get_db)
):

    # Busca o horário que será atualizado
    horario = db.query(HorarioContrato).filter(
        HorarioContrato.id_horario == id_horario
    ).first()

    if horario is None:
        raise HTTPException(
            status_code=404,
            detail="Horário não encontrado."
        )

    # Busca o contrato vinculado ao horário
    contrato = db.query(Contrato).filter(
        Contrato.id_contrato == horario.id_contrato
    ).first()

    if contrato is None:
        raise HTTPException(
            status_code=404,
            detail="Contrato não encontrado."
        )

    # Somente contratos ativos podem ter horários alterados
    if contrato.status != "ativo":
        raise HTTPException(
            status_code=400,
            detail="O contrato não está ativo."
        )

    if contrato.id_professor is None:
        raise HTTPException(
            status_code=400,
            detail="O contrato não possui professor responsável."
        )

    # ======================================================
    # VALIDAR AULA VINCULADA
    # ======================================================

    if horario.id_aula is not None:

        aula = db.query(Aula).filter(
            Aula.id_aula == horario.id_aula
        ).first()

        if aula is None:
            raise HTTPException(
                status_code=404,
                detail="Aula vinculada não encontrada."
            )

        dias_semana = {
            0: "segunda-feira",
            1: "terca-feira",
            2: "quarta-feira",
            3: "quinta-feira",
            4: "sexta-feira",
            5: "sabado",
            6: "domingo"
        }

        # Confere o dia da aula vinculada
        if normalizar_texto(aula.dia_semana) != dias_semana[dados.dia_semana]:
            raise HTTPException(
                status_code=400,
                detail="O dia não corresponde à aula vinculada."
            )

        # Confere o horário da aula vinculada
        if aula.horario != dados.horario_inicio:
            raise HTTPException(
                status_code=400,
                detail="O horário não corresponde à aula vinculada."
            )

    # ======================================================
    # CALCULAR O NOVO PERÍODO RESERVADO
    # ======================================================

    inicio_novo = minutos_do_dia(dados.horario_inicio)

    fim_novo = (
        inicio_novo
        + dados.duracao_minutos
        + dados.deslocamento_minutos
    )

    if fim_novo > 24 * 60:
        raise HTTPException(
            status_code=400,
            detail="A aula e o deslocamento ultrapassam o fim do dia."
        )

    # ======================================================
    # VERIFICAR HORÁRIO REPETIDO NO MESMO CONTRATO
    # ======================================================

    horario_repetido = db.query(HorarioContrato).filter(
        HorarioContrato.id_contrato == contrato.id_contrato,
        HorarioContrato.id_horario != id_horario,
        HorarioContrato.dia_semana == dados.dia_semana,
        HorarioContrato.horario_inicio == dados.horario_inicio
    ).first()

    if horario_repetido is not None:
        raise HTTPException(
            status_code=409,
            detail="Este horário já está cadastrado no contrato."
        )

    # ======================================================
    # CONSULTAR HORÁRIOS DO PROFESSOR
    # ======================================================

    horarios_professor = (
        db.query(HorarioContrato, Contrato, Aula)
        .join(
            Contrato,
            HorarioContrato.id_contrato == Contrato.id_contrato
        )
        .outerjoin(
            Aula,
            HorarioContrato.id_aula == Aula.id_aula
        )
        .filter(
            Contrato.id_professor == contrato.id_professor,
            Contrato.status == "ativo",
            Contrato.data_inicio < contrato.data_fim,
            Contrato.data_fim > contrato.data_inicio,
            HorarioContrato.dia_semana == dados.dia_semana,
            HorarioContrato.id_horario != id_horario
        )
        .all()
    )

    # ======================================================
    # VERIFICAR CONFLITOS DE AULA E DESLOCAMENTO
    # ======================================================

    for horario_existente, contrato_existente, aula_existente in horarios_professor:

        duracao_existente = obter_duracao(
            horario_existente,
            aula_existente
        )

        deslocamento_existente = (
            horario_existente.deslocamento_minutos
            if horario_existente.deslocamento_minutos is not None
            else 30
        )

        inicio_existente = minutos_do_dia(
            horario_existente.horario_inicio
        )

        fim_existente = (
            inicio_existente
            + duracao_existente
            + deslocamento_existente
        )

        if periodos_sobrepostos(
            inicio_novo,
            fim_novo,
            inicio_existente,
            fim_existente
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    "Conflito na agenda do professor. "
                    f"O contrato {contrato_existente.id_contrato} "
                    "já possui uma aula ou deslocamento nesse período."
                )
            )

    # ======================================================
    # SALVAR AS ALTERAÇÕES
    # ======================================================

    horario.dia_semana = dados.dia_semana
    horario.horario_inicio = dados.horario_inicio
    horario.duracao_minutos = dados.duracao_minutos
    horario.deslocamento_minutos = dados.deslocamento_minutos

    try:
        db.commit()
        db.refresh(horario)

    except Exception:
        db.rollback()
        raise

    return horario

