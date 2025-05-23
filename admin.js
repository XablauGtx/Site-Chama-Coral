// admin.js

function entrarAdmin() {
    const senha = document.getElementById('senha-admin').value;
    if (senha === "chama123") {
        document.getElementById('relatorio').style.display = 'block';
        document.getElementById('dados-relatorio').style.display = 'block';
        document.querySelector('.card').style.display = 'none'; // Oculta o card da senha
    } else {
        alert("Senha incorreta. Tente novamente.");
    }
}

function carregarDados() {
    const dataSelecionada = document.getElementById("data-select").value;
    document.getElementById("data-ensaio").innerText = dataSelecionada.split('-').reverse().join('/');

    // Alterado para usar a data selecionada como a chave para o localStorage
    const registros = JSON.parse(localStorage.getItem(dataSelecionada) || "[]");

    if (registros.length === 0) {
        document.getElementById("total-participantes").innerText = 0;
        document.getElementById("soprano-count").innerText = 0;
        document.getElementById("contralto-count").innerText = 0;
        document.getElementById("tenor-count").innerText = 0;
        document.getElementById("baixo-count").innerText = 0;
        // Opcionalmente, limpe o corpo da tabela se não houver registros para a data selecionada
        document.getElementById("lista-participantes").querySelector("tbody").innerHTML = "";
        alert("Nenhum registro encontrado para essa data.");
        return;
    }

    let sopranoCount = 0;
    let contraltoCount = 0;
    let tenorCount = 0;
    let baixoCount = 0;

    const tbody = document.getElementById("lista-participantes").querySelector("tbody");
    tbody.innerHTML = ""; // Limpa a tabela antes de adicionar novos registros

    registros.forEach(r => {
        switch (r.naipe) {
            case "Soprano":
                sopranoCount++;
                break;
            case "Contralto":
                contraltoCount++;
                break;
            case "Tenor":
                tenorCount++;
                break;
            case "Baixo":
                baixoCount++;
                break;
        }

        const tr = document.createElement("tr");
        // A estrutura HTML gerada pelo seu JS está correta para o CSS funcionar
        tr.innerHTML = `
            <td>${r.nome}</td>
            <td><span class="naipe ${r.naipe.toLowerCase()}">${r.naipe}</span></td>
            <td>${r.horaRegistro || 'Indefinido'}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("total-participantes").innerText = registros.length;
    document.getElementById("soprano-count").innerText = sopranoCount;
    document.getElementById("contralto-count").innerText = contraltoCount;
    document.getElementById("tenor-count").innerText = tenorCount;
    document.getElementById("baixo-count").innerText = baixoCount;

    document.getElementById('dados-relatorio').style.display = 'block'; // Mostrar relatório
}


function exportarCSV() {
    const data = document.getElementById("data-select").value; // Usa a data selecionada
    const registros = JSON.parse(localStorage.getItem(data) || "[]");

    if (registros.length === 0) {
        alert("Não há registros para exportar para a data selecionada.");
        return;
    }

    // Inclui Hora de Registro no CSV
    const csvContent = "data:text/csv;charset=utf-8,"
        + "Nome,Naipe,Hora de Registro\n"
        + registros.map(r => `${r.nome},${r.naipe},${r.horaRegistro || 'Indefinido'}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `presenca_${data}.csv`); // Usa a data selecionada no nome do arquivo
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}

// Função para obter a data atual (considerando a data selecionada como a chave para registros)
// Esta função não é mais usada diretamente para chaves do localStorage em carregarDados/exportarCSV,
// pois a data selecionada do dropdown é usada.
// Ainda é útil para gerar a opção do dia atual no dropdown.
function getDataChave() {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD
}

// Função para preencher o seletor de data automaticamente
function preencherSelecaoDatas() {
    const dataSelect = document.getElementById("data-select");
    const hoje = new Date();

    // Adiciona a data atual
    const dataAtual = hoje.toISOString().split('T')[0]; // YYYY-MM-DD
    const optionAtual = document.createElement("option");
    optionAtual.value = dataAtual;
    optionAtual.textContent = `Hoje (${dataAtual.split('-').reverse().join('/')})`; // Exibe DD/MM/YYYY
    dataSelect.appendChild(optionAtual);

    // Adiciona as próximas 6 sextas-feiras
    for (let i = 1; i <= 6; i++) {
        const proximaSexta = new Date(hoje);
        // Calcula a próxima sexta-feira: (5 - diaAtual + 7) % 7 obtém os dias até a próxima sexta (0 para sexta, 1 para quinta, etc.)
        // + 7 * (i - 1) garante que seja a i-ésima sexta-feira a partir de agora.
        proximaSexta.setDate(hoje.getDate() + (5 - hoje.getDay() + 7) % 7 + 7 * (i - 1));
        const option = document.createElement("option");
        option.value = proximaSexta.toISOString().split('T')[0]; // YYYY-MM-DD
        option.textContent = `Sexta-feira, ${proximaSexta.toLocaleDateString("pt-BR")}`; // Exibe a data localizada
        dataSelect.appendChild(option);
    }
}

// Chama a função ao carregar a página
window.onload = function() {
    preencherSelecaoDatas();
    // Garanta que se uma data for pré-selecionada (ex: "Hoje"), os dados sejam carregados automaticamente
    // Você pode chamar carregarDados() aqui se quiser que ele carregue os dados para a data padrão selecionada ao carregar a página.
    // carregarDados(); // Descomente se quiser carregar dados para a data padrão selecionada ao carregar a página
};