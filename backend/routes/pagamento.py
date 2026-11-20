
# ==========================================================
# AULACONNECT - ROTAS DE PAGAMENTOS
# ==========================================================

# Importa os recursos necessários do FastAPI e SQLAlchemy
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Importa a conexão com o banco de dados
from backend.database.connection import get_db

# Importa o modelo de usuário para verificar permissões
from backend.models.usuario import Usuario

# Importa a função que valida o token JWT
from backend.security import obter_usuario_atual

# Importa as funções responsáveis pela geração do Pix
from backend.services.pix import (
    gerar_pix_copia_cola,
    obter_configuracao_pix
)

# Importa os modelos do banco de dados
from backend.models.pagamento import Pagamento
from backend.models.aluno import Aluno

# Importa os schemas de entrada e resposta
from backend.schemas.pagamento import (
    PagamentoCreate,
    PagamentoResponse
)

# Cria o roteador de pagamentos
router = APIRouter(
    prefix="/pagamentos",
    tags=["Pagamentos"]
)


# ==========================================================
# 1. CADASTRAR PAGAMENTO
# ==========================================================

@router.post(
    "/",
    response_model=PagamentoResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_pagamento(
    pagamento: PagamentoCreate,
    db: Session = Depends(get_db)
):

    # Verifica se o aluno informado existe
    aluno = db.query(Aluno).filter(
        Aluno.id_aluno == pagamento.id_aluno
    ).first()

    if aluno is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado."
        )

    # Cria o pagamento com os dados recebidos
    novo_pagamento = Pagamento(**pagamento.model_dump())

    try:
        db.add(novo_pagamento)
        db.commit()
        db.refresh(novo_pagamento)

    except Exception:
        db.rollback()
        raise

    return novo_pagamento


# ==========================================================
# 2. LISTAR PAGAMENTOS
# ==========================================================

@router.get(
    "/",
    response_model=list[PagamentoResponse]
)
def listar_pagamentos(
    db: Session = Depends(get_db)
):

    # Busca todos os pagamentos cadastrados
    return db.query(Pagamento).all()


# ==========================================================
# 3. EDITAR PAGAMENTO
# ==========================================================

@router.put(
    "/{id_pagamento}",
    response_model=PagamentoResponse
)
def editar_pagamento(
    id_pagamento: int,
    dados: PagamentoCreate,
    db: Session = Depends(get_db)
):

    # Busca o pagamento pelo ID
    pagamento = db.query(Pagamento).filter(
        Pagamento.id_pagamento == id_pagamento
    ).first()

    # Verifica se o pagamento existe
    if pagamento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado."
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

    # Atualiza os campos do pagamento
    for campo, valor in dados.model_dump().items():
        setattr(pagamento, campo, valor)

    try:
        db.commit()
        db.refresh(pagamento)

    except Exception:
        db.rollback()
        raise

    return pagamento


# ==========================================================
# 4. EXCLUIR PAGAMENTO
# ==========================================================

@router.delete("/{id_pagamento}")
def excluir_pagamento(
    id_pagamento: int,
    db: Session = Depends(get_db)
):

    # Busca o pagamento pelo ID
    pagamento = db.query(Pagamento).filter(
        Pagamento.id_pagamento == id_pagamento
    ).first()

    # Verifica se o pagamento existe
    if pagamento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado."
        )

    try:
        db.delete(pagamento)
        db.commit()

    except Exception:
        db.rollback()
        raise

    return {
        "mensagem": "Pagamento excluído com sucesso."
    }


# ==========================================================
# 5. GERAR COBRANÇA PIX COPIA E COLA
# ==========================================================

@router.get("/{id_pagamento}/pix")
def gerar_cobranca_pix(
    id_pagamento: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):

    # Permite gerar cobranças apenas ao administrador
    if usuario_atual.tipo_usuario != "Adm":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem gerar cobranças Pix."
        )

    # Busca o pagamento no MySQL
    pagamento = db.query(Pagamento).filter(
        Pagamento.id_pagamento == id_pagamento
    ).first()

    # Verifica se o pagamento existe
    if pagamento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado."
        )

    # Impede gerar Pix para pagamentos que não estão pendentes
    if pagamento.status != "pendente":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "A cobrança Pix só pode ser gerada "
                "para pagamentos pendentes."
            )
        )

    try:

        # Obtém os dados do recebedor configurados
        # nas variáveis de ambiente
        chave, nome, cidade = obter_configuracao_pix()

        # Cria um identificador para o pagamento
        identificador = f"PAG{id_pagamento}"

        # Gera o código Pix Copia e Cola
        codigo_pix = gerar_pix_copia_cola(
            chave_pix=chave,
            nome_recebedor=nome,
            cidade_recebedor=cidade,
            valor=pagamento.valor,
            identificador=identificador
        )

    # Captura erros na configuração ou geração do Pix
    except ValueError as erro:

        # Mostra o erro original no terminal
        # Temporário para facilitar os testes
        print(
            f"Erro ao gerar cobrança Pix: "
            f"{type(erro).__name__}: {erro}"
        )

        # Retorna uma mensagem genérica ao frontend
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível gerar a cobrança Pix."
        ) from erro

    # Retorna os dados da cobrança gerada
    return {
        "id_pagamento": pagamento.id_pagamento,
        "id_aluno": pagamento.id_aluno,
        "valor": pagamento.valor,
        "data_vencimento": pagamento.data_vencimento,
        "codigo_pix": codigo_pix,
        "identificador": identificador
    }
