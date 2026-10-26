# Recursos do FastAPI para criar rotas e tratar erros
from fastapi import APIRouter, Depends, HTTPException, status

# Permite trabalhar com sesões do banco do dados
from sqlalchemy.orm import Session

# Importa a conexão e a dependência do banco
from backend.database.connection import get_db

# Importa os modelos necessarios
from backend.models.agendamento import Agendamento
from backend.models.aluno import Aluno
from backend.models.aula import Aula

# importa os schemas de validação e resposta
from backend.schemas.agendamento import (
    AgendamentoCreate,
    AgendamentoResponse
)

# Define o grupo de rotas de agendamentos
router = APIRouter(
    prefix="/agendamento",
    tags=["Agendamento"]
)

# Rota para cadastrar um pagamento
@router.post(
    "/",
    response_model=AgendamentoResponse,
    status_code=status.HTTP_201_CREATED
)
def cadastar_agendamento(
    agendamento: AgendamentoCreate,
    db: Session = Depends(get_db)
):

    # Verifica se o aluno informado existe
    
    aluno = db.query(Aluno).filter(
        Aluno.id_aluno == agendamento.id_aluno
    ).first()

    if aluno is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado."
        )
    # Se uma aula foi informada, verifica se ela existe
    if agendamento.id_aula is not None:
        aula = db.query(Aula).filter(
            Aula.id_aula == agendamento.id_aula
        ).first()

        if aula is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Aula não encontrada."
            )

    novo_agendamento = Agendamento(
        id_aluno=agendamento.id_aluno,
        id_aula=agendamento.id_aula,
        data_aula=agendamento.data_aula,
        status=agendamento.status
    )

    # salva o agendamento no banco de dados
    try:
        db.add(novo_agendamento)
        db.commit()
        db.refresh(novo_agendamento)
    except Exception:
        db.rollback()
        raise

    return novo_agendamento

# Rota para listar todos od agendamentos
@router.get(
    "/",
    response_model=list[AgendamentoResponse]
)
def lista_agendamentos(
    db: Session = Depends(get_db)
):
    agendamentos = db.query(Agendamento).all()
    return agendamentos

# Rota para editar um agendamento existente
@router.put("/{id_agendamento}",response_model=AgendamentoResponse)
def editar_agendamento(
    id_agendamento: int,
    dados: AgendamentoCreate,
    db: Session = Depends(get_db)
):
    # Busca o agendamento pelo ID
    agendamento = db.query(Agendamento).filter(
        Agendamento.id_agendamento == id_agendamento
    ).first()

    # Verificar se o agendamento existe
    if agendamento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrtado"
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
    # se uma aula foi informada, verifica se ela existe

    if dados.id_aula is not None:
        aula = db.query(Aula).filter(
            Aula.id_aula == dados.id_aula
        ).first()

        if aula is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Aula não encontrada."
            )
    # Atualiza os campos do agendamento
    agendamento.id_aluno = dados.id_aluno
    agendamento.id_aula = dados.id_aula
    agendamento.data_aula = dados.data_aula
    agendamento.status = dados.status

    # Salva as alterações no banco

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

    # Verificar se o agendamento existe
    if agendamento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado."
        )
# Exclui o registro e salva a alteração
    try:
        db.delete(agendamento)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"Agendamento excluido com sucesso."}