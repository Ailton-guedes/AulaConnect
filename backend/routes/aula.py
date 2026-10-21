# Recursos do FastAPI para criar rotas e tratar erros
from fastapi import APIRouter, Depends, HTTPException, status

# Recurso para acessar o banco de dados
from sqlalchemy.orm import Session

# Importa a conexão com o banco
from backend.database.connection import get_db

# Importa os modelos do banco 
from backend.models.aula import Aula

# Importa os schemas de aula
from backend.schemas.aula import Aulacreate, AulaResponse, AulaUpdate

#Cria um grupo de rotas para aulas
router  = APIRouter(
    prefix="/aulas",
    tags=["Aulas"]
)

# Cadastrar uma nova aula 
@router.post(
    '/',
    response_model=AulaResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_aula(
    dados_aula: Aulacreate,
    db: Session = Depends(get_db)
):
# Cria um objeto Aula com os dados recebidos
    nova_aula = Aula(**dados_aula.model_dump())
    # Adiciona a aula á sessão do Banco
    db.add(nova_aula)
    # Salva a aula no banco de dados
    db.commit()
    # Atualiza o objeto com os dados gerados pelo banco, como o ID
    db.refresh(nova_aula)

    # Retorna a aula cadastrada
    return nova_aula

# Lista todas as aulas cadastradas
@router.get(
    "/",
    response_model=list[AulaResponse])
def listar_aulas(
    db: Session = Depends(get_db)
):
        # Consulta todas as aulas
    aulas = db.query(Aula).all()
    # Retorna a lista encontrada
    return aulas

# Consulta uma aula pelo identificador
@router.get(
    "/{id_aula}",
    response_model=AulaResponse
)
def buscar_aula(
    id_aula: int,
    db: Session = Depends(get_db)
):
# Procura a aula pelo ID informado
    aula = db.query(Aula).filter(Aula.id_aula == id_aula).first()
    
# Retorna erro se a aula não existir
    if aula is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aula não encontrada."
        )
    return aula
# Atualiza os dados de uma aula
@router.put(
    "/{id_aula}",
    response_model=AulaResponse
    )
def atualizar_aula(
    id_aula: int,
    dados_aula: AulaUpdate,
    db: Session = Depends(get_db)
):
# Procura a aula que será atualizada
    aula = db.query(Aula).filter(Aula.id_aula == id_aula).first()
    # Verificar de a aula existe
    if aula is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Aula não encontrada."
            )
        # Obtém somente os campos enviados na requisição
    dados = dados_aula.model_dump(exclude_unset=True)

    # Atualiza cada compo recebido
    for campo, valor in dados.items():
         setattr(aula, campo, valor)

    # Salva as alterações no banco
    db.commit()

    # Atualiza o objeto com os dados persistidos
    db.refresh(aula)

    return aula

# Exclui uma aula pelo identificador
@router.delete("/{id_aula}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_aula(id_aula: int, db: Session = Depends(get_db)):
    # Procura a aula que será excluída
    aula = db.query(Aula).filter(Aula.id_aula == id_aula).first()

    # Verifica se a aula existe
    if aula is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aula não encontrada."
        )

    # Remove a aula da sessão
    db.delete(aula)

    # Confirma a exclusão no banco
    db.commit()