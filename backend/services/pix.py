import os
# Importa Decimal para trabalhar com valores monetários
from decimal import Decimal


# Formata o valor de uma cobrança para o padrão Pix
def formatar_valor_pix(valor: Decimal) -> str:

    # Verifica se o valor é maior que zero
    if valor <= 0:
        raise ValueError("O valor do Pix deve ser maior que zero.")

    # Retorna o valor com duas casas decimais
    # Exemplo: 150.00
    return f"{valor:.2f}"

# Monta um campo no formato utilizado pelo BR Code
def montar_campo_pix(identificador: str, valor: str) -> str:

    # Calcula a quantidade de bytes do valor
    tamanho = len(valor.encode("utf-8"))

    # Cada campo admite tamanho de até 99 bytes
    if tamanho > 99:
        raise ValueError(
            "O campo Pix não pode ultrapassar 99 bytes."
        )

    # Retorna o identificador, o tamanho e o conteúdo
    return f"{identificador}{tamanho:02d}{valor}"

# Calcula o código de verificação CRC16 utilizado pelo Pix
def calcular_crc16(conteudo: str) -> str:

    # Valor inicial definido pelo algoritmo CRC16/CCITT-FALSE
    crc = 0xFFFF

    # Polinômio utilizado no cálculo
    polinomio = 0x1021

    # Percorre cada byte do conteúdo
    for byte in conteudo.encode("utf-8"):

        # Combina o byte com o valor atual do CRC
        crc ^= byte << 8

        # Processa os 8 bits do byte
        for _ in range(8):

            # Verifica se o bit mais significativo está ativo
            if crc & 0x8000:

                # Aplica o polinômio
                crc = (crc << 1) ^ polinomio

            else:

                # Apenas desloca os bits
                crc <<= 1

            # Mantém o resultado limitado a 16 bits
            crc &= 0xFFFF

    # Retorna quatro caracteres hexadecimais maiúsculos
    return f"{crc:04X}"

    # Gera o código Pix Copia e Cola no padrão BR Code
def gerar_pix_copia_cola(
    chave_pix: str,
    nome_recebedor: str,
    cidade_recebedor: str,
    valor: Decimal,
    identificador: str = "***"
) -> str:

    # Identifica o formato do código Pix
    payload = montar_campo_pix("00", "01")

    # Identifica o arranjo de pagamento Pix
    dados_pix = (
        montar_campo_pix("00", "br.gov.bcb.pix")
        + montar_campo_pix("01", chave_pix)
    )

    # Adiciona a chave Pix ao código principal
    payload += montar_campo_pix("26", dados_pix)

    # Código da categoria do estabelecimento
    payload += montar_campo_pix("52", "0000")

    # Código da moeda brasileira (Real)
    payload += montar_campo_pix("53", "986")

    # Valor da cobrança
    payload += montar_campo_pix(
        "54",
        formatar_valor_pix(valor)
    )

    # País do recebedor
    payload += montar_campo_pix("58", "BR")

    # Nome do recebedor
    payload += montar_campo_pix("59", nome_recebedor)

    # Cidade do recebedor
    payload += montar_campo_pix("60", cidade_recebedor)

    # Identificador da cobrança
    dados_adicionais = montar_campo_pix("05", identificador)

    payload += montar_campo_pix("62", dados_adicionais)

    # Adiciona o identificador do campo CRC16
    payload += "6304"

    # Calcula e adiciona o CRC16
    payload += calcular_crc16(payload)

    # Retorna o código Pix completo
    return payload
# Lê os dados do recebedor das variáveis de ambiente
def obter_configuracao_pix():

    chave_pix = os.getenv("PIX_CHAVE", "").strip()
    nome_recebedor = os.getenv("PIX_NOME", "").strip()
    cidade_recebedor = os.getenv("PIX_CIDADE", "").strip()

    # Verifica se todos os dados foram configurados
    if not all([chave_pix, nome_recebedor, cidade_recebedor]):
        raise ValueError(
            "Configuração Pix incompleta. "
            "Verifique PIX_CHAVE, PIX_NOME e PIX_CIDADE."
        )

    return chave_pix, nome_recebedor, cidade_recebedor