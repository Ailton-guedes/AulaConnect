
# Recursos do FastAPI para criar rotas e tratar erros
from fastapi import APIRouter, Depends, HTTPException, status

# Permite trabalhar com sessões do banco de dados
from sqlalchemy.orm import Session

# Importa a conexão com o banco
from backend.database.connection import get_db

# Importa os modelos necessários
from backend.models.agendamento import Agendamento
from backend.models.aluno import Aluno
from backend.models.aula import Aula
from backend.models.contrato import Contrato

# Importa os schemas de validação e resposta
from backend.schemas.agendamento import (
    AgendamentoCreate,
    AgendamentoResponse
)

# Define o grupo de rotas de agendamentos
router = APIRouter(
    prefix="/agendamento",
    tags=["Agendamento"]
)


# Função auxiliar para validar os dados do agendamento
def validar_agendamento(dados: AgendamentoCreate, db: Session):

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

    # Aulas experimentais não precisam de contrato
    if dados.tipo_agendamento == "experimental":
        if dados.id_contrato is not None:
            raise HTTPException(
                status_code=400,
                detail="Aula experimental não deve possuir contrato."
            )

    # Se um contrato foi informado, verifica sua validade
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

        # Apenas contratos ativos podem receber novas aulas
        if contrato.status != "ativo":
            raise HTTPException(
                status_code=400,
                detail="O contrato não está ativo."
            )

        # Verifica se a data está dentro da vigência
        # A data final não é incluída no período
        if not (
            contrato.data_inicio <= dados.data_aula < contrato.data_fim
        ):
            raise HTTPException(
                status_code=400,
                detail="A data da aula está fora da vigência do contrato."
            )


# Rota para cadastrar um agendamento
@router.post(
    "/",
    response_model=AgendamentoResponse,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_agendamento(
    agendamento: AgendamentoCreate,
    db: Session = Depends(get_db)
):

    # Valida aluno, aula, tipo e contrato
    validar_agendamento(agendamento, db)

    # Cria o agendamento com os novos campos
    novo_agendamento = Agendamento(
        id_aluno=agendamento.id_aluno,
        id_aula=agendamento.id_aula,
        id_contrato=agendamento.id_contrato,
        data_aula=agendamento.data_aula,
        horario_inicio=agendamento.horario_inicio,
        tipo_agendamento=agendamento.tipo_agendamento,
        status=agendamento.status
    )

    # Salva o agendamento no banco
    try:
        db.add(novo_agendamento)
        db.commit()
        db.refresh(novo_agendamento)
    except Exception:
        db.rollback()
        raise

    return novo_agendamento


# Rota para listar todos os agendamentos
@router.get(
    "/",
    response_model=list[AgendamentoResponse]
)
def listar_agendamentos(
    db: Session = Depends(get_db)
):
    agendamentos = db.query(Agendamento).all()
    return agendamentos


# Rota para editar um agendamento existente
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

    if agendamento is None:
        raise HTTPException(
            status_code=404,
            detail="Agendamento não encontrado."
        )

    # Valida os novos dados antes de atualizar
    validar_agendamento(dados, db)

    # Atualiza os campos
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


# Rota para excluir um agendamento
@router.delete("/{id_agendamento}")
def excluir_agendamento(
    id_agendamento: int,
    db: Session = Depends(get_db)
):

    # Busca o agendamento pelo ID
    agendamento = db.query(Agendamento).filter(
        Agendamento.id_agendamento == id_agendamento
    ).first()

    if agendamento is None:
        raise HTTPException(
            status_code=404,
            detail="Agendamento não encontrado."
        )

    # Exclui o registro e salva a alteração
    try:
        db.delete(agendamento)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"mensagem": "Agendamento excluído com sucesso."}
