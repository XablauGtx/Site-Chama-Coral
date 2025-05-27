// chamada.js

const nomeInput = document.getElementById("nome");
const naipeSelect = document.getElementById("naipe");
const listaPresencas = document.getElementById("lista-presencas");

// CORREÇÃO 1: Formatação correta da data (apenas YYYY-MM-DD)
function getDataChave() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`; // Retorna a data no formato YYYY-MM-DD
}

async function registrarPresenca() {
    const nome = nomeInput.value.trim();
    const naipe = naipeSelect.value;
    const dataAtual = getDataChave();

    if (!nome || !naipe) {
        alert("Preencha todos os campos!");
        return;
    }

    const agora = new Date();
    const horaRegistro = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    try {
        const snapshot = await db.collection('registrosChamada')
                                 .where('data', '==', dataAtual)
                                 .where('nome', '==', nome)
                                 .get();

        if (!snapshot.empty) {
            alert("Você já registrou sua presença para esta data com este nome!");
            nomeInput.value = "";
            return;
        }

        const registro = {
            nome: nome,
            naipe: naipe,
            horaRegistro: horaRegistro,
            data: dataAtual,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('registrosChamada').add(registro);
        alert("Presença registrada com sucesso!");

        nomeInput.value = "";
        naipeSelect.value = "";

        carregarPresencas();
    } catch (error) {
        console.error("Erro ao registrar presença no Firebase: ", error);
        alert("Ocorreu um erro ao registrar sua presença. Tente novamente.");
    }
}

async function carregarPresencas() {
    const dataAtual = getDataChave();
    listaPresencas.innerHTML = ""; // Limpa o conteúdo existente

    try {
        const snapshot = await db.collection('registrosChamada')
                                 .where('data', '==', dataAtual)
                                 .orderBy('timestamp', 'asc')
                                 .get();

        if (snapshot.empty) {
            listaPresencas.innerHTML = '<div class="loading">⚠️ Nenhum registro ainda para hoje.</div>';
            return;
        }

        const naipesAgrupados = {
            Soprano: [],
            Contralto: [],
            Tenor: [],
            Baixo: []
        };

        snapshot.forEach(doc => {
            const r = doc.data();
            if (naipesAgrupados[r.naipe]) {
                naipesAgrupados[r.naipe].push(r);
            }
        });

        for (const naipe in naipesAgrupados) {
            const participantesDoNaipe = naipesAgrupados[naipe];

            if (participantesDoNaipe.length > 0) {
                const sectionNaipe = document.createElement("div");
                sectionNaipe.className = `naipe-section ${naipe.toLowerCase()}`;

                const headerNaipe = document.createElement("h3");
                // CORREÇÃO 2: Interpolação correta das variáveis
                headerNaipe.textContent = `${naipe} (${participantesDoNaipe.length} participantes)`;
                sectionNaipe.appendChild(headerNaipe);

                const ul = document.createElement("ul");

                participantesDoNaipe.forEach(p => {
                    const li = document.createElement("li");
                    li.textContent = `${p.nome} (Registrado às ${p.horaRegistro || 'Indefinido'})`;
                    ul.appendChild(li);
                });
                sectionNaipe.appendChild(ul);
                listaPresencas.appendChild(sectionNaipe);
            }
        }
    } catch (error) {
        console.error("Erro ao carregar presenças do Firebase: ", error);
        listaPresencas.innerHTML = '<div class="loading" style="color: #cc0000;">❌ Erro ao carregar registros.</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Exibir a data atual no cabeçalho
    const dataEventoSpan = document.getElementById('data-evento');
    if (dataEventoSpan) {
        const hoje = new Date();
        dataEventoSpan.textContent = hoje.toLocaleDateString('pt-BR');
    }
    carregarPresencas(); // Carrega a lista ao carregar a página
});