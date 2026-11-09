
# Recursos do FastAPI para criar rotas e tratar erros
from fastapi import APIRouter, Depends, HTTPException, status

# Recursos do SQLAlchemy
from sqlalchemy import func
from sqlalchemy.orm import Session

# Importa a conexão com o banco de dados
from backend.database.connection import get_db

# Importa os modelos necessários
from backend.models.agendamento import Agendamento
from backend.models.aluno import Aluno
from backend.models.aula import Aula
from backend.models.contrato import Contrato

# Importa os schemas de validação e resposta
from backend.schemas.agendamento import (
    AgendamentoCreate,
    AgendamentoResponse,
    PresencaUpdate
)


# Define o grupo de rotas de agendamentos
router = APIRouter(
    prefix="/agendamento",
    tags=["Agendamento"]
)


# ==========================================
# VALIDAÇÃO DOS AGENDAMENTOS
# ==========================================

def validar_agendamento(
    dados: AgendamentoCreate,
    db: Session,
    id_agendamento_atual: int | None = None
):
    # A frequência só pode ser alterada pela rota PATCH
    if "presenca" in dados.model_fields_set:
        raise HTTPException(
        status_code=400,
        detail="Utilize a rota específica para registrar presença."
    )

    # Verifica se o aluno informado existe
    aluno = db.query(Aluno).filter(
        Aluno.id_aluno == dados.id_aluno
    ).first()

    if aluno is None:
        raise HTTPException(
            status_code=404,
            detail="Aluno não encontrado."
        )

    # Verifica se a aula informada existe
    if dados.id_aula is not None:

        aula = db.query(Aula).filter(
            Aula.id_aula == dados.id_aula
        ).first()

        if aula is None:
            raise HTTPException(
                status_code=404,
                detail="Aula não encontrada."
            )

    # Verifica se o tipo de agendamento é permitido
    if dados.tipo_agendamento not in ("regular", "experimental"):
        raise HTTPException(
            status_code=422,
            detail="O tipo deve ser 'regular' ou 'experimental'."
        )

    # Aulas experimentais não devem possuir contrato
    if dados.tipo_agendamento == "experimental":

        if dados.id_contrato is not None:
            raise HTTPException(
                status_code=400,
                detail="Aula experimental não deve possuir contrato."
            )

    # ==========================================
    # NOVO AJUSTE 1: VALIDAR A PRESENÇA
    # ==========================================

    # Aceita apenas presente, falta ou None
    if dados.presenca not in (None, "presente", "falta"):
        raise HTTPException(
            status_code=422,
            detail="A presença deve ser 'presente', 'falta' ou nula."
        )

    # Verifica o contrato, quando informado
    if dados.id_contrato is not None:

        contrato = db.query(Contrato).filter(
            Contrato.id_contrato == dados.id_contrato
        ).first()

        if contrato is None:
            raise HTTPException(
                status_code=404,
                detail="Contrato não encontrado."
            )

        # O contrato deve pertencer ao aluno
        if contrato.id_aluno != dados.id_aluno:
            raise HTTPException(
                status_code=400,
                detail="O contrato não pertence ao aluno informado."
            )

        # O contrato precisa estar ativo
        if contrato.status != "ativo":
            raise HTTPException(
                status_code=400,
                detail="O contrato não está ativo."
            )

        # Verifica a vigência do contrato
        if not (
            contrato.data_inicio <= dados.data_aula < contrato.data_fim
        ):
            raise HTTPException(
                status_code=400,
                detail="A data da aula está fora da vigência do contrato."
            )

    # ==========================================
    # VERIFICAÇÃO DE CONFLITOS
    # ==========================================

    # Verifica conflitos somente quando existe horário
    if dados.horario_inicio is not None:

        # Procura outra aula do mesmo aluno
        # na mesma data e no mesmo horário
        conflito = db.query(Agendamento).filter(
            Agendamento.id_aluno == dados.id_aluno,
            Agendamento.data_aula == dados.data_aula,
            Agendamento.horario_inicio == dados.horario_inicio,
            func.lower(Agendamento.status) != "cancelado"
        )

        # Durante a edição, ignora o próprio agendamento
        if id_agendamento_atual is not None:
            conflito = conflito.filter(
                Agendamento.id_agendamento != id_agendamento_atual
            )

        # Impede salvar quando existe conflito
        if conflito.first() is not None:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Este aluno já possui uma aula "
                    "agendada nesta data e horário."
                )
            )


# ==========================================
# CADASTRAR AGENDAMENTO
# ==========================================

@router.post(
    "/",
    response_model=AgendamentoResponse,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_agendamento(
    agendamento: AgendamentoCreate,
    db: Session = Depends(get_db)
):

    # Valida os dados antes de cadastrar
    validar_agendamento(agendamento, db)

    # Cria o novo registro
    novo_agendamento = Agendamento(
        id_aluno=agendamento.id_aluno,
        id_aula=agendamento.id_aula,
        id_contrato=agendamento.id_contrato,
        data_aula=agendamento.data_aula,
        horario_inicio=agendamento.horario_inicio,
        tipo_agendamento=agendamento.tipo_agendamento,
        # Todo novo agendamento começa sem frequência registrada
        status=agendamento.status,
        presenca=None
    )

    # Salva no banco de dados
    try:
        db.add(novo_agendamento)
        db.commit()
        db.refresh(novo_agendamento)

    except Exception:
        db.rollback()
        raise

    return novo_agendamento


# ==========================================
# LISTAR AGENDAMENTOS
# ==========================================

@router.get(
    "/",
    response_model=list[AgendamentoResponse]
)
def listar_agendamentos(
    db: Session = Depends(get_db)
):

    # Busca todos os agendamentos cadastrados
    agendamentos = db.query(Agendamento).all()

    return agendamentos


# ==========================================
# EDITAR AGENDAMENTO
# ==========================================

@router.put(
    "/{id_agendamento}",
    response_model=AgendamentoResponse
)
def editar_agendamento(
    id_agendamento: int,
    dados: AgendamentoCreate,
    db: Session = Depends(get_db)
):

    # Busca o agendamento pelo ID
    agendamento = db.query(Agendamento).filter(
        Agendamento.id_agendamento == id_agendamento
    ).first()

    # Verifica se o agendamento existe
    if agendamento is None:
        raise HTTPException(
            status_code=404,
            detail="Agendamento não encontrado."
        )

    # ==========================================
    # PROTEÇÃO CONTRA REMARCAÇÃO INDEVIDA
    # ==========================================

    # Identifica alteração na data ou no horário
    alterou_data_ou_horario = (
        agendamento.data_aula != dados.data_aula
        or agendamento.horario_inicio != dados.horario_inicio
    )

    # Impede remarcar aulas concluídas ou canceladas
    if (
        alterou_data_ou_horario
        and agendamento.status.lower() != "agendado"
    ):
        raise HTTPException(
            status_code=400,
            detail="Somente aulas agendadas podem ser remarcadas."
        )

    # Valida os novos dados e ignora o próprio
    # agendamento na verificação de conflitos
    validar_agendamento(
        dados,
        db,
        id_agendamento_atual=id_agendamento
    )

    # Atualiza os campos do registro
    agendamento.id_aluno = dados.id_aluno
    agendamento.id_aula = dados.id_aula
    agendamento.id_contrato = dados.id_contrato
    agendamento.data_aula = dados.data_aula
    agendamento.horario_inicio = dados.horario_inicio
    agendamento.tipo_agendamento = dados.tipo_agendamento
    agendamento.status = dados.status

    # Salva as alterações
    try:
        db.commit()
        db.refresh(agendamento)

    except Exception:
        db.rollback()
        raise

    return agendamento
# ==========================================
# REGISTRAR PRESENÇA OU FALTA
# ==========================================

@router.patch(
    "/{id_agendamento}/presenca",
    response_model=AgendamentoResponse
)
def registrar_presenca(
    id_agendamento: int,
    dados: PresencaUpdate,
    db: Session = Depends(get_db)
):

    # Busca o agendamento pelo ID
    agendamento = db.query(Agendamento).filter(
        Agendamento.id_agendamento == id_agendamento
    ).first()

    # Verifica se o agendamento existe
    if agendamento is None:
        raise HTTPException(
            status_code=404,
            detail="Agendamento não encontrado."
        )

    # Permite registrar frequência somente
    # em aulas com status concluído
    if agendamento.status.lower() != "concluido":
        raise HTTPException(
            status_code=400,
            detail="Somente aulas concluídas podem receber frequência."
        )

    # Valida os valores permitidos
    if dados.presenca not in ("presente", "falta"):
        raise HTTPException(
            status_code=422,
            detail="A presença deve ser 'presente' ou 'falta'."
        )

    # Atualiza a frequência do aluno
    agendamento.presenca = dados.presenca

    # Salva no MySQL
    try:
        db.commit()
        db.refresh(agendamento)

    except Exception:
        db.rollback()
        raise

    return agendamento


# ==========================================
# EXCLUIR AGENDAMENTO
# ==========================================

@router.delete("/{id_agendamento}")
def excluir_agendamento(
    id_agendamento: int,
    db: Session = Depends(get_db)
):

    # Busca o agendamento pelo ID
    agendamento = db.query(Agendamento).filter(
        Agendamento.id_agendamento == id_agendamento
    ).first()

    # Verifica se existe
    if agendamento is None:
        raise HTTPException(
            status_code=404,
            detail="Agendamento não encontrado."
        )

    # Exclui o registro
    try:
        db.delete(agendamento)
        db.commit()

    except Exception:
        db.rollback()
        raise

    return {
        "mensagem": "Agendamento excluído com sucesso."
    }
