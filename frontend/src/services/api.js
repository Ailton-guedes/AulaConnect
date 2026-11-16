
// Endereço principal da API AulaConnect
const API_URL = "http://127.0.0.1:8000";

// Função para realizar requisições à API
async function apiRequest(endpoint, options = {}) {

    // Recupera o token JWT salvo após o login
    const token = sessionStorage.getItem("access_token");

    // Organiza os cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // Envia o token quando estiver disponível
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Realiza a requisição ao FastAPI
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Verifica se a requisição foi realizada com sucesso
    if (!response.ok) {
        const erro = await response.json();

        throw new Error(
            typeof erro.detail === "string"
                ? erro.detail
                : "Erro ao comunicar com a API"
        );
    }

    // Retorna os dados recebidos da API
    return response.json();
}

export default apiRequest;