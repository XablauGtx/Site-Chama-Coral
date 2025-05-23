// chamada.js

const nomeInput = document.getElementById("nome");
const naipeSelect = document.getElementById("naipe");
const listaPresencas = document.getElementById("lista-presencas");

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

    // --- NOVO: Verificação de duplicidade ---
    const nomeNormalizado = nome.toLowerCase(); // Normaliza o nome para comparação (ignora maiúsculas/minúsculas)
    const jaRegistrado = registros.some(r => r.nome.toLowerCase() === nomeNormalizado);

    if (jaRegistrado) {
        alert("Você já registrou sua presença para esta data com este nome!");
        nomeInput.value = ""; // Opcional: Limpa o campo do nome
        return; // Sai da função, impedindo o registro
    }
    // ----------------------------------------

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
    listaPresencas.innerHTML = ""; // Limpa antes de adicionar

    if (registros.length === 0) {
        listaPresencas.innerHTML = '<div class="loading">⚠️ Nenhum registro ainda.</div>';
        return;
    }

    registros.forEach(r => {
        const div = document.createElement("div");
        div.className = "registro-item";
        div.textContent = `${r.nome} - ${r.naipe} (Registrado às ${r.horaRegistro || 'Indefinido'})`;
        listaPresencas.appendChild(div);
    });
}

// Chame registrarPresenca() através de um botão no seu HTML
// Por exemplo: <button onclick="registrarPresenca()">Registrar Presença</button>

// Chamada para carregar presenças ao inicializar a página
carregarPresencas();