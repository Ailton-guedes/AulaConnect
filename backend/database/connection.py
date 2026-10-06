import pymysql

# Conectando ao MySQL com pymysql usando suas credenciais
con = pymysql.connect(
    host='localhost',
    user='root',
    password='',
    database='aulaconnect'
)

try:
    with con.cursor() as cursor:
        # Pega a versão do servidor MySQL
        cursor.execute("SELECT VERSION();")
        versao = cursor.fetchone()
        print("Conectado ao servidor MySQL versão:", versao[0])

        # Pega o nome do banco atual conectado
        cursor.execute("SELECT DATABASE();")
        banco = cursor.fetchone()
        print("Conectado ao banco de dados:", banco[0])

finally:
    con.close()
    print("Conexão ao MySQL foi encerrada com sucesso!")