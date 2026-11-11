
# Importa os recursos necessários do FastAPI
from fastapi import APIRouter, Depends, HTTPException, status

# Importa a sessão do banco de dados
from sqlalchemy.orm import Session
from backend.database.connection import get_db

# Importa o modelo e os schemas de Plano
from backend.models.plano import Plano
from backend.schemas.plano import (
    PlanoCreate,
    PlanoUpdate,
    PlanoResponse
)


# Configura as rotas de planos
router = APIRouter(
    prefix="/planos",
    tags=["Planos"]
)


# Cadastra um novo plano
@router.post(
    "/",
    response_model=PlanoResponse,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_plano(
    dados: PlanoCreate,
    db: Session = Depends(get_db)
):

    # Verifica se já existe um plano com o mesmo nome
    plano_existente = db.query(Plano).filter(
        Plano.nome == dados.nome
    ).first()

    if plano_existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um plano com este nome."
        )

    # Cria o plano com todos os campos recebidos
    novo_plano = Plano(
        nome=dados.nome,
        duracao_meses=dados.duracao_meses,
        aulas_por_semana=dados.aulas_por_semana,
        valor_mensal=dados.valor_mensal,
        descricao=dados.descricao,
        ativo=dados.ativo
    )

    # Salva o plano no banco de dados
    db.add(novo_plano)
    db.commit()
    db.refresh(novo_plano)

    return novo_plano


# Lista todos os planos cadastrados
@router.get("/", response_model=list[PlanoResponse])
def listar_planos(
    db: Session = Depends(get_db)
):
    return db.query(Plano).order_by(
        Plano.id_plano
    ).all()


# Consulta um plano pelo ID
@router.get("/{id_plano}", response_model=PlanoResponse)
def buscar_plano(
    id_plano: int,
    db: Session = Depends(get_db)
):

    plano = db.query(Plano).filter(
        Plano.id_plano == id_plano
    ).first()

    if not plano:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plano não encontrado."
        )

    return plano


# Atualiza os dados de um plano existente
@router.put("/{id_plano}", response_model=PlanoResponse)
def atualizar_plano(
    id_plano: int,
    dados: PlanoUpdate,
    db: Session = Depends(get_db)
):

    # Busca o plano no banco de dados
    plano = db.query(Plano).filter(
        Plano.id_plano == id_plano
    ).first()

    if not plano:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plano não encontrado."
        )

    # Obtém somente os campos enviados na requisição
    dados_atualizados = dados.model_dump(
        exclude_unset=True
    )

    # Impede valores nulos em campos obrigatórios
    campos_obrigatorios = {
        "nome",
        "duracao_meses",
        "valor_mensal"
    }

    for campo, valor in dados_atualizados.items():
        if campo in campos_obrigatorios and valor is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"O campo {campo} não pode ser nulo."
            )

    # Verifica se o novo nome já pertence a outro plano
    if "nome" in dados_atualizados:
        plano_existente = db.query(Plano).filter(
            Plano.nome == dados_atualizados["nome"],
            Plano.id_plano != id_plano
        ).first()

        if plano_existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Já existe outro plano com este nome."
            )

    # Atualiza os campos informados
    for campo, valor in dados_atualizados.items():
        setattr(plano, campo, valor)

    # Salva as alterações
    db.commit()
    db.refresh(plano)

    return plano
