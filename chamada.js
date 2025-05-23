// chamada.js

const nomeInput = document.getElementById("nome");
const naipeSelect = document.getElementById("naipe");
const listaPresencas = document.getElementById("lista-presencas"); // Este será o container principal

function getDataChave() {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0]; // Data atual (formato YYYY-MM-DD)
}

function registrarPresenca() {
    const nome = nomeInput.value.trim();
    const naipe = naipeSelect.value;
    const data = getDataChave();

    if (!nome || !naipe) {
        alert("Preencha todos os campos!");
        return;
    }

    const agora = new Date();
    const horaRegistro = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const registros = JSON.parse(localStorage.getItem(data) || "[]");

    const nomeNormalizado = nome.toLowerCase();
    const jaRegistrado = registros.some(r => r.nome.toLowerCase() === nomeNormalizado);

    if (jaRegistrado) {
        alert("Você já registrou sua presença para esta data com este nome!");
        nomeInput.value = "";
        return;
    }

    const registro = {
        nome: nome,
        naipe: naipe,
        horaRegistro: horaRegistro
    };

    registros.push(registro);
    localStorage.setItem(data, JSON.stringify(registros));

    alert("Presença registrada com sucesso!");

    nomeInput.value = "";
    naipeSelect.value = "";

    carregarPresencas(); // Atualiza a lista de presenças
}

function carregarPresencas() {
    const data = getDataChave();
    const registros = JSON.parse(localStorage.getItem(data) || "[]");
    listaPresencas.innerHTML = ""; // Limpa o conteúdo existente

    if (registros.length === 0) {
        listaPresencas.innerHTML = '<div class="loading">⚠️ Nenhum registro ainda.</div>';
        return;
    }

    // Organiza os participantes por naipe
    const naipesAgrupados = {
        Soprano: [],
        Contralto: [],
        Tenor: [],
        Baixo: []
    };

    registros.forEach(r => {
        if (naipesAgrupados[r.naipe]) {
            naipesAgrupados[r.naipe].push(r);
        }
    });

    // Percorre os naipes e cria as seções
    for (const naipe in naipesAgrupados) {
        const participantesDoNaipe = naipesAgrupados[naipe];

        if (participantesDoNaipe.length > 0) {
            const sectionNaipe = document.createElement("div");
            sectionNaipe.className = `naipe-section ${naipe.toLowerCase()}`; // Adiciona classe para estilo

            const headerNaipe = document.createElement("h3");
            headerNaipe.textContent = `${naipe} (${participantesDoNaipe.length} participantes)`;
            sectionNaipe.appendChild(headerNaipe);

            const ul = document.createElement("ul"); // Usar uma lista não ordenada para os nomes
            
            participantesDoNaipe.forEach(p => {
                const li = document.createElement("li");
                li.textContent = `${p.nome} (Registrado às ${p.horaRegistro || 'Indefinido'})`;
                ul.appendChild(li);
            });
            sectionNaipe.appendChild(ul);
            listaPresencas.appendChild(sectionNaipe);
        }
    }
}

// Chame registrarPresenca() através de um botão no seu HTML
// Por exemplo: <button onclick="registrarPresenca()">Registrar Presença</button>

// Chamada para carregar presenças ao inicializar a página
carregarPresencas();