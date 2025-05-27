// admin.js

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML
    const senhaAdminInput = document.getElementById('senha-admin');
    const loginCard = document.getElementById('login-card');
    const btnLoginAdmin = document.getElementById('btn-login-admin'); // NOVO: Referência ao botão de login
    const relatorioDataSelector = document.getElementById('relatorio-data-selector');
    const dataRelatorioInput = document.getElementById('dataRelatorio'); // Input type="date"
    const btnCarregarRelatorio = document.getElementById('btnCarregarRelatorio');
    const relatorioCompleto = document.getElementById('relatorio-completo');
    const dataEnsaioSpan = document.getElementById('data-ensaio');
    const totalParticipantesSpan = document.getElementById('total-participantes');
    const sopranoCountSpan = document.getElementById('soprano-count');
    const contraltoCountSpan = document.getElementById('contralto-count');
    const tenorCountSpan = document.getElementById('tenor-count');
    const baixoCountSpan = document.getElementById('baixo-count');
    const listaParticipantesAdmin = document.getElementById('lista-participantes-admin');
    const btnExportarCSV = document.getElementById('btnExportarCSV');


    function entrarAdmin() {
        if (senhaAdminInput.value === "chama123") {
            loginCard.style.display = 'none';
            relatorioDataSelector.style.display = 'block';
            relatorioCompleto.style.display = 'block';

            // Define a data padrão como a data atual no formato YYYY-MM-DD
            const hoje = new Date();
            const dia = String(hoje.getDate()).padStart(2, '0');
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const ano = hoje.getFullYear();
            const dataPadrao = `${ano}-${mes}-${dia}`;
            dataRelatorioInput.value = dataPadrao; // Define o valor do input type="date"
            
            carregarDados(dataPadrao); // Carrega os dados para a data atual
        } else {
            alert("Senha incorreta. Tente novamente.");
            senhaAdminInput.value = '';
        }
    }

    async function carregarDados(dataDesejada) {
        // Limpa a lista de participantes e mostra o cabeçalho
        listaParticipantesAdmin.innerHTML = '';
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('participante-admin-header');
        headerDiv.innerHTML = `
            <div class="col-nome">Nome</div>
            <div class="col-naipe">Naipe</div>
            <div class="col-registro">Hora de Registro</div>
        `;
        listaParticipantesAdmin.appendChild(headerDiv);

        // Atualiza a data exibida no relatório
        dataEnsaioSpan.innerText = dataDesejada.split('-').reverse().join('/'); // Formato DD/MM/YYYY

        let registrosDoDia = [];
        let sopranoCount = 0;
        let contraltoCount = 0;
        let tenorCount = 0;
        let baixoCount = 0;

        try {
            // A consulta principal: busca registros da data desejada, ordenados por timestamp
            const snapshot = await db.collection('registrosChamada')
                                     .where('data', '==', dataDesejada) // dataDesejada deve ser YYYY-MM-DD
                                     .orderBy('timestamp', 'asc')
                                     .get();

            if (snapshot.empty) {
                alert("Nenhum registro encontrado para essa data.");
                totalParticipantesSpan.innerText = 0;
                sopranoCountSpan.innerText = 0;
                contraltoCountSpan.innerText = 0;
                tenorCountSpan.innerText = 0;
                baixoCountSpan.innerText = 0;
                listaParticipantesAdmin.innerHTML += '<p style="text-align: center; padding: 20px; color: #555;">Nenhum participante encontrado para esta data.</p>';
                return;
            }

            snapshot.forEach(doc => {
                const r = doc.data();
                registrosDoDia.push(r);

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

                const itemDiv = document.createElement('div');
                itemDiv.classList.add('participante-admin-item');
                itemDiv.innerHTML = `
                    <div class="col-nome">${r.nome}</div>
                    <div class="col-naipe"><span class="tag-naipe ${r.naipe.toLowerCase()}">${r.naipe}</span></div>
                    <div class="col-registro">${r.horaRegistro || 'Indefinido'}</div>
                `;
                listaParticipantesAdmin.appendChild(itemDiv);
            });

            // Atualiza os contadores na UI
            totalParticipantesSpan.innerText = registrosDoDia.length;
            sopranoCountSpan.innerText = sopranoCount;
            contraltoCountSpan.innerText = contraltoCount;
            tenorCountSpan.innerText = tenorCount;
            baixoCountSpan.innerText = baixoCount;

        } catch (error) {
            console.error("Erro ao carregar dados do Firebase: ", error);
            alert("Erro ao carregar os dados. Verifique a conexão ou as regras de segurança do Firebase.");
            // Reseta contadores e exibe mensagem de erro
            totalParticipantesSpan.innerText = 0;
            sopranoCountSpan.innerText = 0;
            contraltoCountSpan.innerText = 0;
            tenorCountSpan.innerText = 0;
            baixoCountSpan.innerText = 0;
            listaParticipantesAdmin.innerHTML = '<p style="text-align: center; padding: 20px; color: #cc0000;">Erro ao carregar dados. Tente novamente.</p>';
        }
    }

    async function exportarCSV() {
        const dataParaExportar = dataRelatorioInput.value; // Obtém a data do input type="date"
        if (!dataParaExportar) {
            alert("Por favor, selecione uma data para exportar.");
            return;
        }

        let registrosParaCSV = [];
        try {
            const snapshot = await db.collection('registrosChamada')
                                     .where('data', '==', dataParaExportar)
                                     .orderBy('timestamp', 'asc')
                                     .get();

            snapshot.forEach(doc => {
                registrosParaCSV.push(doc.data());
            });

        } catch (error) {
            console.error("Erro ao buscar dados para CSV: ", error);
            alert("Não foi possível buscar dados para exportar. Verifique sua conexão.");
            return;
        }

        if (registrosParaCSV.length === 0) {
            alert("Não há registros para exportar para a data selecionada.");
            return;
        }

        const csvContent = "data:text/csv;charset=utf-8,"
            + "Nome,Naipe,Hora de Registro\n"
            + registrosParaCSV.map(r => `${r.nome},${r.naipe},${r.horaRegistro || 'Indefinido'}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `presenca_${dataParaExportar}.csv`);
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
    }

    // Adiciona event listeners aos botões
    btnLoginAdmin.addEventListener('click', entrarAdmin); // Correção para o botão de login
    btnCarregarRelatorio.addEventListener('click', () => {
        const dataSelecionada = dataRelatorioInput.value;
        if (dataSelecionada) {
            carregarDados(dataSelecionada);
        } else {
            alert('Por favor, selecione uma data para carregar o relatório.');
        }
    });
    btnExportarCSV.addEventListener('click', exportarCSV);
});