// Importa os hoors do React
import { useEffect, useState } from "react";

// Importa a função que realiza requisições ao FastAPI
import apiRequest from "../services/api";
// Importa os estilos exclusivos da página Pagamentos
import "../styles/Pagamentos.css";
// Gera um QR Code a partir do código Pix
import { QRCodeSVG } from "qrcode.react";

// Página responsável pelo gerenciamento dos pagamentos
function Pagamentos() {
    // Lista de pagamentos retornados pelo MySQL
    const [pagamentos, setPagamentos] = useState([]);

    // Indica se os pagamentos ainda estão sendo carregados
    const [carregando, setCarregando] = useState(true);

    // Armazena uma mensagem caso a consulta apresente erro
    const [erro, setErro] = useState("");
    // Armazena o ID do pagamento que está sendo editado.
    // null significa que o formulário está no modo de cadastro.
    const [pagamentoEditando, setPagamentoEditando] = useState(null);

    // ==================================================
    // ESTADOS DO FORMULÁRIO DE PAGAMENTOS
    // ==================================================

    // Armazena o ID do aluno selecionado
    const [alunoSelecionado, setAlunoSelecionado] = useState("");

    // Armazena o valor do pagamento
    const [valor, setValor] = useState("");

    // Armazena a data de vencimento
    const [dataVencimento, setDataVencimento] = useState("");

    // Armazena a data em que o pagamento foi realizado
    const [dataPagamento, setDataPagamento] = useState("");

    // Armazena a situação do pagamento
    const [statusPagamento, setStatusPagamento] = useState("pendente");

    // Define Pix como forma de pagamento padrão
    const [formaPagamento, setFormaPagamento] = useState("pix");
    // ==================================================
    // CONTROLE DO CADASTRO DE PAGAMENTOS
    // ==================================================

    // Indica quando um pagamento está sendo enviado ao backend
    const [salvando, setSalvando] = useState(false);

    // Armazena mensagens de sucesso ou erro no cadastro
    const [mensagemCadastro, setMensagemCadastro] = useState("");

    // Armazena os alunos cadastrados no sistema
    const [alunos, setAlunos] = useState([]);

    // Armazena o ID do pagamento que está gerando o Pix
    const [gerandoPix, setGerandoPix] = useState(null);

    // Armazena os dados da cobrança Pix gerada
    const [cobrancaPix, setCobrancaPix] = useState(null);

    // Armazena mensagens de erro na geração do Pix
    const [erroPix, setErroPix] = useState("");

        // Executa a consulta quando a página é carregada
    useEffect(() => {

        // Função responsável por buscar os pagamentos
        async function carregarPagamentos() {

            try {

                // Consulta o endpoint GET /pagamentos/
                const dados = await apiRequest("/pagamentos/");

                // Teste temporário para verificar os dados retornados
                console.log("Pagamentos recebidos:", dados);

                // Armazena os pagamentos recebidos
                setPagamentos(dados);

                // Consulta os alunos cadastrados no FastAPI
                const dadosAlunos = await apiRequest("/alunos/");

                // Armazena os alunos para utilizar no formulário
                setAlunos(dadosAlunos);

                // Teste temporário para conferir os alunos retornados
                console.log("Alunos recebidos em Pagamentos:", dadosAlunos);

            } catch (erroConsulta) {

                // Mostra o erro no console
                console.error(
                    "Erro ao carregar pagamentos:",
                    erroConsulta
                );

                // Guarda uma mensagem para o usuário
                setErro("Não foi possível carregar os pagamentos.");

            } finally {

                // Finaliza o estado de carregamento
                setCarregando(false);

            }
        }

        // Executa a função de consulta
        carregarPagamentos();

    }, []);

// ==================================================
// CADASTRAR PAGAMENTO
// ==================================================

// Função executada quando o formulário for enviado
async function cadastrarPagamento(e) {

    // Impede que o navegador recarregue a página
    e.preventDefault();

    // Verifica se um aluno foi selecionado
    if (!alunoSelecionado) {
        setMensagemCadastro("Selecione um aluno.");
        return;
    }

    // Verifica se o valor informado é válido
    if (!valor || !Number.isFinite(Number(valor)) || Number(valor) <= 0) {
        setMensagemCadastro("Informe um valor válido.");
        return;
    }

    // Verifica se a data de vencimento foi preenchida
    if (!dataVencimento) {
        setMensagemCadastro("Informe a data de vencimento.");
        return;
    }

    // Exige a data quando o pagamento estiver pago
    if (statusPagamento === "pago" && !dataPagamento) {
        setMensagemCadastro("Informe a data do pagamento.");
        return;
    }

    // Prepara os dados para o FastAPI
    const novoPagamento = {
        id_aluno: Number(alunoSelecionado),
        valor: Number(valor).toFixed(2),
        data_vencimento: dataVencimento,
        data_pagamento: statusPagamento === "pago" ? dataPagamento : null,
        status: statusPagamento,
        forma_pagamento: statusPagamento === "pago"
            ? (formaPagamento || null)
            : null
    };

    // Exibe os dados temporariamente para conferência
    console.log("Dados preparados para cadastro:", novoPagamento);

    // Limpa mensagens anteriores
setMensagemCadastro("");

// Informa que o cadastro está em andamento
setSalvando(true);

try {

    // Verifica se estamos editando um pagamento existente
const estaEditando = pagamentoEditando !== null;

// Define a URL conforme a operação
const url = estaEditando
    ? `/pagamentos/${pagamentoEditando}`
    : "/pagamentos/";

// Define o método HTTP
const metodo = estaEditando ? "PUT" : "POST";

// Envia os dados para o FastAPI
const pagamentoSalvo = await apiRequest(url, {
    method: metodo,
    body: JSON.stringify(novoPagamento)
});

    // ==================================================
// ATUALIZAR A LISTA DE PAGAMENTOS
// ==================================================

// Verifica se estamos editando ou cadastrando
if (estaEditando) {

    // Atualiza o pagamento existente na lista
    setPagamentos((pagamentosAtuais) =>
        pagamentosAtuais.map((pagamento) =>
            pagamento.id_pagamento === pagamentoEditando
                ? pagamentoSalvo
                : pagamento
        )
    );

    // Informa que a edição foi realizada
    setMensagemCadastro("Pagamento atualizado com sucesso!");

} else {

    // Adiciona o novo pagamento à lista
    setPagamentos((pagamentosAtuais) => [
        ...pagamentosAtuais,
        pagamentoSalvo
    ]);

    // Informa que o cadastro foi realizado
    setMensagemCadastro("Pagamento cadastrado com sucesso!");
}

// Retorna o formulário ao modo de cadastro
setPagamentoEditando(null);

// LIMPAR FORMULÁRIO APÓS CADASTRO
setAlunoSelecionado("");// Limpa o aluno selecionado
setValor("");// Limpa o valor informado
setDataVencimento("");// Limpa a data de vencimento
setDataPagamento("");// Limpa a data do pagamento
setStatusPagamento("pendente");// Retorna o status para pendente
setFormaPagamento("pix");// Limpa a forma de pagamento


} catch (erroCadastro) {

    // Exibe o erro no console
    console.error("Erro ao cadastrar pagamento:", erroCadastro);

    // Informa ao usuário que ocorreu um erro
    setMensagemCadastro("Não foi possível cadastrar o pagamento.");

} finally {

    // Libera novamente o botão de cadastro
    setSalvando(false);

}

}

   // ==================================================
// FORMATAR DATAS PARA O PADRÃO BRASILEIRO
// ==================================================

// Recebe uma data no formato AAAA-MM-DD
function formatarData(data) {

    // Verifica se existe uma data informada
    if (!data) {
        return "Não informado";
    }

    // Separa ano, mês e dia
    const [ano, mes, dia] = data.split("-");

    // Retorna a data no padrão brasileiro
    return `${dia}/${mes}/${ano}`;
}

// ==================================================
// CARREGAR PAGAMENTO PARA EDIÇÃO
// ==================================================

// Recebe os dados do pagamento selecionado
function editarPagamento(pagamento) {

    // Armazena o ID do pagamento em edição
    setPagamentoEditando(pagamento.id_pagamento);

    // Preenche os campos do formulário
    setAlunoSelecionado(String(pagamento.id_aluno));

    setValor(String(pagamento.valor));

    setDataVencimento(pagamento.data_vencimento || "");

    setStatusPagamento(pagamento.status);

    setFormaPagamento(pagamento.forma_pagamento || "");

    setDataPagamento(pagamento.data_pagamento || "");

    // Limpa mensagens anteriores
    setMensagemCadastro("");
}

// ==================================================
// CANCELAR EDIÇÃO DE PAGAMENTO
// ==================================================

function cancelarEdicao() {

    // Retorna o formulário ao modo de cadastro
    setPagamentoEditando(null);

    // Limpa os campos do formulário
    setAlunoSelecionado("");
    setValor("");
    setDataVencimento("");
    setDataPagamento("");
    setStatusPagamento("pendente");
    setFormaPagamento("");

    // Limpa mensagens anteriores
    setMensagemCadastro("");
}

// ==================================================
// EXCLUIR PAGAMENTO
// ==================================================

async function excluirPagamento(idPagamento) {

    // Solicita confirmação antes de excluir
    const confirmar = window.confirm(
        "Tem certeza que deseja excluir este pagamento?"
    );

    // Cancela a operação caso o usuário escolha "Cancelar"
    if (!confirmar) {
        return;
    }

    try {

        // Envia a solicitação de exclusão ao FastAPI
        await apiRequest(`/pagamentos/${idPagamento}`, {
            method: "DELETE"
        });

        // Remove o pagamento excluído da lista exibida
        setPagamentos((pagamentosAtuais) =>
            pagamentosAtuais.filter(
                (pagamento) =>
                    pagamento.id_pagamento !== idPagamento
            )
        );

        // Se o pagamento excluído estava sendo editado,
        // limpa o formulário e cancela a edição
        if (pagamentoEditando === idPagamento) {
            cancelarEdicao();
        }

        // Exibe mensagem de sucesso
        setMensagemCadastro("Pagamento excluído com sucesso!");

    } catch (erroExclusao) {

        // Exibe o erro no console
        console.error(
            "Erro ao excluir pagamento:",
            erroExclusao
        );

        // Informa que a exclusão não foi concluída
        setMensagemCadastro("Não foi possível excluir o pagamento.");
    }
}

// ==================================================
// GERAR COBRANÇA PIX
// ==================================================

async function gerarPix(idPagamento) {

    // Indica qual pagamento está sendo processado
    setGerandoPix(idPagamento);

    // Limpa mensagens e cobranças anteriores
    setErroPix("");
    setCobrancaPix(null);

    try {

        // Consulta a rota protegida do FastAPI
        const dadosPix = await apiRequest(
            `/pagamentos/${idPagamento}/pix`
        );

        // Armazena a cobrança recebida
        setCobrancaPix(dadosPix);

    } catch (erroGeracao) {

        // Exibe o erro no console
        console.error("Erro ao gerar Pix:", erroGeracao);

        // Informa que não foi possível gerar a cobrança
        setErroPix("Não foi possível gerar a cobrança Pix.");

    } finally {

        // Libera o botão após finalizar a requisição
        setGerandoPix(null);
    }
}

// Prepara uma cobrança Pix para envio por e-mail
function enviarPixPorEmail() {
    if (!cobrancaPix) {
        alert("Gere uma cobrança Pix primeiro.");
        return;
    }

    const destinatario = "testesailton@gmail.com";

    const assunto = `Cobrança AulaConnect - Pagamento ${cobrancaPix.id_pagamento}`;

    const mensagem = `
Olá!

Segue a cobrança referente às aulas.

Valor: R$ ${Number(cobrancaPix.valor).toFixed(2)}
Vencimento: ${cobrancaPix.data_vencimento}

Código Pix Copia e Cola:
${cobrancaPix.codigo_pix}

Após realizar o pagamento, envie o comprovante ao professor.

Atenciosamente,
Equipe Personal kids
`;

   // Monta o link para abrir a composição do Gmail
const linkEmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(destinatario)}&su=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`;

// Abre o Gmail em uma nova aba
window.open(linkEmail, "_blank");
}

    return (
        <div className="pagina-pagamentos">

            {/* Cabeçalho da página */}
            <div className="titulo-pagina">
                <h2>Gerenciamento de Pagamentos</h2>
                <p>
                    Controle os pagamentos e vencimentos dos alunos.
                </p>
            </div>

            {/* Organiza o cadastro e a listagem lado a lado */}
            <div className="layout-pagamentos">

                {/* Painel de cadastro */}
                <div className="painel-pagina">
                    <h3>
                    {pagamentoEditando !== null
                    ? "Editar pagamento"
                    : "Cadastrar pagamento"}
                    </h3>

    {/* Formulário para cadastrar pagamentos */}
    <form
        className="formulario-pagamento"
        onSubmit={cadastrarPagamento}
>
    {/* Campo para selecionar um aluno cadastrado */}
    <div className="campo-formulario">

        <label htmlFor="alunoPagamento">
            Aluno:
        </label>

        <select
            id="alunoPagamento"
            value={alunoSelecionado}
            onChange={(e) => setAlunoSelecionado(e.target.value)}
        >

            <option value="">
                Selecione um aluno
            </option>

            {/* Percorre os alunos retornados pelo backend */}
            {alunos.map((aluno) => (

                <option
                    key={aluno.id_aluno}
                    value={aluno.id_aluno}
                >
                    {aluno.nome}
                </option>

            ))}

        </select>

    </div>

    {/* Campo para informar o valor do pagamento */}
<div className="campo-formulario">

    <label htmlFor="valorPagamento">
        Valor do pagamento (R$):
    </label>

    <input
        type="number"
        id="valorPagamento"
        placeholder="Ex: 150.00"
        min="0.01"
        step="0.01"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
    />

</div>

{/* Campo para informar a data de vencimento */}
<div className="campo-formulario">

    <label htmlFor="dataVencimento">
        Data de vencimento:
    </label>

    <input
        type="date"
        id="dataVencimento"
        value={dataVencimento}
        onChange={(e) => setDataVencimento(e.target.value)}
    />

</div>

{/* Campo para selecionar a situação do pagamento */}
<div className="campo-formulario">

    <label htmlFor="statusPagamento">
        Status do pagamento:
    </label>

    <select
        id="statusPagamento"
        value={statusPagamento}
        onChange={(e) => setStatusPagamento(e.target.value)}
    >

        <option value="pendente">
            Pendente
        </option>

        <option value="pago">
            Pago
        </option>

    </select>

</div>

{/* Campo para selecionar a forma de pagamento */}
<div className="campo-formulario">

    <label htmlFor="formaPagamento">
        Forma de pagamento:
    </label>

    <select
        id="formaPagamento"
        value={formaPagamento}
        onChange={(e) => setFormaPagamento(e.target.value)}
    >

        <option value="">
            Selecione a forma de pagamento
        </option>

        <option value="pix">
            Pix
        </option>

        <option value="dinheiro">
            Dinheiro
        </option>

        <option value="cartao">
            Cartão
        </option>

        <option value="transferencia">
            Transferência bancária
        </option>

    </select>

</div>

{/* Exibe a data do pagamento somente quando estiver pago */}
{statusPagamento === "pago" && (

    <div className="campo-formulario">

        <label htmlFor="dataPagamento">
            Data do pagamento:
        </label>

        <input
            type="date"
            id="dataPagamento"
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
            required
        />

    </div>

)}
    {/* Botão para cadastrar ou atualizar pagamento */}
<button
    type="submit"
    disabled={salvando}
>
    {salvando
        ? "Salvando..."
        : pagamentoEditando !== null
            ? "Salvar alterações"
            : "Cadastrar pagamento"}
</button>


{/* Exibe o botão Cancelar somente durante a edição */}
{pagamentoEditando !== null && (

    <button
        type="button"
        className="btn-cancelar-pagamento"
        onClick={cancelarEdicao}
        disabled={salvando}
    >
        Cancelar edição
    </button>




)}


    {/* Exibe mensagens de validação ou cadastro */}
    {mensagemCadastro && (
    <p role="alert" className="mensagem-cadastro">
        {mensagemCadastro}
    </p>
)}

</form>
</div>

            {/* Área principal dos pagamentos */}
            <div className="painel-pagina">
                <h3>Pagamentos cadastrados</h3>

                {/* Exibe uma mensagem enquanto consulta o backend */}
{carregando && (
    <p>Carregando pagamentos...</p>
)}

{/* Exibe uma mensagem caso a consulta apresente erro */}
{erro && (
    <p role="alert">{erro}</p>
)}

{/* Exibe uma mensagem quando não existem pagamentos */}
{!carregando && !erro && pagamentos.length === 0 && (
    <p>Nenhum pagamento cadastrado.</p>
)}

{/* Exibe a lista de pagamentos cadastrados */}
{!carregando && !erro && pagamentos.length > 0 && (

    

    /* Contêiner responsável por organizar os cards */
    <div className="lista-pagamentos">

        {pagamentos.map((pagamento) => (

            <div
                className="item-pagamento"
                key={pagamento.id_pagamento}
            >

                {/* Identificação do aluno pelo nome */}
                <p>
                    <strong>Aluno: </strong>

                    {alunos.find(
                    (aluno) => aluno.id_aluno === pagamento.id_aluno
                    )?.nome || "Aluno não encontrado"}
                </p>

               
                {/* Valor do pagamento formatado em reais */}
                <p>
                    <strong>Valor: </strong>

                        {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                        }).format(Number(pagamento.valor))}
                </p>

                {/* Data de vencimento */}
                <p>
                    <strong>Vencimento: </strong>
                    {formatarData(pagamento.data_vencimento)}
                </p>

                {/* Exibe a data em que o pagamento foi realizado */}
                <p>
                    <strong>Data do pagamento: </strong>

                    {pagamento.status === "pago"
                    ? formatarData(pagamento.data_pagamento)
                    : "Aguardando pagamento"}
                </p>

                {/* Exibe a situação do pagamento com identificação visual */}
                <p>
                    <strong>Status: </strong>

                    <span
                        className={
                            pagamento.status === "pago"
                                ? "status-pago"
                                : "status-pendente"
                        }
                    >
                        {pagamento.status === "pago"
                            ? "Pago"
                            : "Pendente"}
                    </span>
                </p>
{/* Área dos botões de ações */}
<div className="acoes-pagamento">

{/* Permite gerar Pix somente para pagamentos pendentes */}
{pagamento.status === "pendente" && (

    <button
        type="button"
        className="btn-gerar-pix"
        onClick={() => gerarPix(pagamento.id_pagamento)}
        disabled={gerandoPix !== null}
    >
        {gerandoPix === pagamento.id_pagamento
            ? "Gerando Pix..."
            : "Gerar Pix"}
    </button>

)}

    {/* Botão para editar o pagamento */}
    <button
    type="button"
    className="btn-editar-pagamento"
    onClick={() => editarPagamento(pagamento)}
>
        Editar
    </button>

    {/* Botão para excluir o pagamento */}
<button
    type="button"
    className="btn-excluir-pagamento"
    onClick={() => excluirPagamento(pagamento.id_pagamento)}
    disabled={salvando}
>
    Excluir
</button>

</div>
                    </div>

        ))}

    </div>
)}

{/* Exibe mensagens de erro na geração do Pix */}
{erroPix && (
    <p role="alert">{erroPix}</p>
)}

{/* Exibe a cobrança Pix gerada pelo backend */}
{cobrancaPix && (

    <div className="resultado-pix">

        {/* Cabeçalho da cobrança */}
        <div className="pix-cabecalho">
            <h3>Cobrança Pix</h3>
            <span className="status-pendente">
                Aguardando pagamento
            </span>
        </div>

        {/* Informações da cobrança */}
        <div className="pix-informacoes">

            <p>Pagamento #{cobrancaPix.id_pagamento}</p>

            <h2>
                {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                }).format(Number(cobrancaPix.valor))}
            </h2>

            <p>
                Vencimento: {formatarData(cobrancaPix.data_vencimento)}
            </p>

        </div>

        {/* QR Code gerado com os dados retornados pelo FastAPI */}
        <div className="pix-qrcode">

            <QRCodeSVG
                value={cobrancaPix.codigo_pix}
                size={190}
                level="M"
                marginSize={2}
            />

            <p>Escaneie o QR Code no aplicativo do banco</p>

        </div>

        {/* Código Pix Copia e Cola */}
        <div className="pix-codigo">

            <label htmlFor="codigoPix">
                Código Pix Copia e Cola
            </label>

            <textarea
                id="codigoPix"
                value={cobrancaPix.codigo_pix}
                readOnly
                rows={3}
            />

        </div>

        {/* Ações da cobrança */}
        <div className="pix-acoes">

            <button
                type="button"
                className="btn-copiar-pix"
                onClick={async () => {
                    try {
                        await navigator.clipboard.writeText(
                            cobrancaPix.codigo_pix
                        );

                        alert("Código Pix copiado com sucesso!");

                    } catch (erroCopia) {
                        console.error("Erro ao copiar Pix:", erroCopia);
                        alert("Não foi possível copiar o código Pix.");
                    }
                }}
            >
                Copiar código Pix
            </button>

            <button
    type="button"
    className="btn-enviar-pix"
    onClick={enviarPixPorEmail}
>
    Enviar Cobrança
</button>
{/* Fecha o painel Pix e retorna à lista */}
<button
    type="button"
    className="btn-fechar-pix"
    onClick={() => {
        setCobrancaPix(null);
        setErroPix("");
    }}
>
    Fechar cobrança
</button>
        </div>

        {/* Aviso sobre o ambiente de teste */}
        <p className="pix-aviso">
            Cobrança gerada em ambiente de teste.
            O pagamento não é confirmado automaticamente.
        </p>

    </div>

)}
            </div> 

            </div> 
        </div> 
    );
}

// Permite utilizar a página em outros arquivos
export default Pagamentos;