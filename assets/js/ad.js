// assets/js/ad.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Referências aos Elementos ---
    const authSection = document.getElementById('auth-section');
    const adminContent = document.getElementById('admin-content');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginErrorMessage = document.getElementById('login-error-message');
    const logoutBtn = document.getElementById('logout-btn');

    const partituraForm = document.getElementById('partitura-form');
    const partituraIdInput = document.getElementById('partitura-id');
    const tipoInput = document.getElementById('tipo');
    const tituloInput = document.getElementById('titulo');
    const compositorInput = document.getElementById('compositor');
    const instrumentoInput = document.getElementById('instrumento');
    const generoInput = document.getElementById('genero');
    const descricaoInput = document.getElementById('descricao');
    const precoInput = document.getElementById('preco');
    const imagemCapaUrlInput = document.getElementById('imagem_capa_url');
    const camposPartituraDiv = document.getElementById('campos-partitura');

    const savePartituraBtn = document.getElementById('save-partitura-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const formMessage = document.getElementById('form-message');
    const partiturasTableBody = document.querySelector('#partituras-table tbody');

    let editingPartituraId = null;

    // --- Lógica do Formulário Dinâmico ---
    function togglePartituraFields() {
        if (tipoInput.value === 'partitura') {
            camposPartituraDiv.style.display = 'block';
        } else {
            camposPartituraDiv.style.display = 'none';
        }
    }
    tipoInput.addEventListener('change', togglePartituraFields);

    // --- Autenticação ---
    auth.onAuthStateChanged(user => {
        if (user) {
            authSection.style.display = 'none';
            adminContent.style.display = 'block';
            loadProdutos();
        } else {
            authSection.style.display = 'block';
            adminContent.style.display = 'none';
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value);
            loginErrorMessage.textContent = '';
        } catch (error) {
            loginErrorMessage.textContent = `Erro no login: ${error.message}`;
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await auth.signOut();
    });

    // --- Funções CRUD (Agora para "Produtos") ---

    const loadProdutos = async () => {
        partiturasTableBody.innerHTML = '<tr><td colspan="4">Carregando produtos...</td></tr>';
        try {
            // ALTERAÇÃO: Busca na coleção "produtos"
            const snapshot = await db.collection('produtos').orderBy('titulo').get();
            partiturasTableBody.innerHTML = '';
            snapshot.forEach(doc => {
                const produto = doc.data();
                const row = partiturasTableBody.insertRow();
                row.insertCell(0).textContent = produto.titulo;
                row.insertCell(1).textContent = produto.tipo; // NOVO: exibe o tipo
                row.insertCell(2).textContent = `R$ ${parseFloat(produto.preco).toFixed(2)}`;
                
                const actionsCell = row.insertCell(3);
                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.className = 'edit-btn';
                editButton.addEventListener('click', () => editProduto(doc.id, produto));

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Excluir';
                deleteButton.className = 'delete-btn';
                deleteButton.addEventListener('click', () => deleteProduto(doc.id));

                actionsCell.appendChild(editButton);
                actionsCell.appendChild(deleteButton);
            });
        } catch (error) {
            partiturasTableBody.innerHTML = '<tr><td colspan="4" style="color: red;">Erro ao carregar produtos.</td></tr>';
        }
    };

    partituraForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const produtoData = {
            tipo: tipoInput.value,
            titulo: tituloInput.value,
            descricao: descricaoInput.value,
            preco: parseFloat(precoInput.value),
            imagem_capa_url: imagemCapaUrlInput.value
        };

        if (produtoData.tipo === 'partitura') {
            produtoData.compositor = compositorInput.value || '';
            produtoData.instrumento = instrumentoInput.value || '';
            produtoData.genero = generoInput.value || '';
        }

        try {
            if (editingPartituraId) {
                // ALTERAÇÃO: Atualiza na coleção "produtos"
                await db.collection('produtos').doc(editingPartituraId).update(produtoData);
                formMessage.textContent = 'Produto atualizado com sucesso!';
            } else {
                // ALTERAÇÃO: Adiciona na coleção "produtos"
                await db.collection('produtos').add(produtoData);
                formMessage.textContent = 'Produto adicionado com sucesso!';
            }
            partituraForm.reset();
            editingPartituraId = null;
            savePartituraBtn.textContent = 'Adicionar Produto';
            cancelEditBtn.style.display = 'none';
            togglePartituraFields(); // Reseta a visibilidade dos campos
            loadProdutos();
        } catch (error) {
            formMessage.textContent = `Erro ao salvar produto: ${error.message}`;
            formMessage.style.color = 'red';
        }
        setTimeout(() => formMessage.textContent = '', 3000);
    });

    const editProduto = (id, produto) => {
        editingPartituraId = id;
        tipoInput.value = produto.tipo;
        tituloInput.value = produto.titulo;
        descricaoInput.value = produto.descricao;
        precoInput.value = produto.preco;
        imagemCapaUrlInput.value = produto.imagem_capa_url;

        if (produto.tipo === 'partitura') {
            compositorInput.value = produto.compositor || '';
            instrumentoInput.value = produto.instrumento || '';
            generoInput.value = produto.genero || '';
        }
        togglePartituraFields(); // Mostra/esconde campos conforme o tipo
        
        savePartituraBtn.textContent = 'Atualizar Produto';
        cancelEditBtn.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    cancelEditBtn.addEventListener('click', () => {
        partituraForm.reset();
        editingPartituraId = null;
        savePartituraBtn.textContent = 'Adicionar Produto';
        cancelEditBtn.style.display = 'none';
        togglePartituraFields();
    });

    const deleteProduto = async (id) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                // ALTERAÇÃO: Deleta da coleção "produtos"
                await db.collection('produtos').doc(id).delete();
                alert('Produto excluído com sucesso!');
                loadProdutos();
            } catch (error) {
                alert(`Erro ao excluir produto: ${error.message}`);
            }
        }
    };
});