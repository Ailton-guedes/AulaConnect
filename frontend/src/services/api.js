// endereço principal da API AulaConnect
const API_URL = "http://127.0.0.1:8000";

// Função para realizar requisições á API
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

// Verifica se a requisição foi realizada com sucesso
if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.detail || "Erro ao comunicar com a API");
}

// Retorna os dados recebidos da API
return response.json();
}

export default apiRequest;