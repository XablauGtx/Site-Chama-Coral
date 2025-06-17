// assets/js/ad.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Referências aos Elementos do DOM ---
    const authSection = document.getElementById('auth-section');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginErrorMessage = document.getElementById('login-error-message');
    const logoutBtn = document.getElementById('logout-btn');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

    // --- Autenticação ---
    auth.onAuthStateChanged(user => {
        if (user) {
            authSection.style.display = 'none';
            adminPanel.style.display = 'block';
            // Carrega os dados da primeira seção visível
            loadProdutos();
        } else {
            authSection.style.display = 'flex';
            adminPanel.style.display = 'none';
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginErrorMessage.textContent = '';
            try {
                await auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value);
            } catch (error) {
                loginErrorMessage.textContent = 'E-mail ou senha inválidos.';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => { await auth.signOut(); });
    }

    // --- Navegação da Sidebar ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;

            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            
            link.classList.add('active');
            adminPanel.querySelector(`#${targetId}-section`).classList.add('active');
            
            // Carrega os dados da seção clicada
            if (targetId === 'produtos') loadProdutos();
            if (targetId === 'homepage') {
                loadDestaques();
                loadDepoimentos();
            }
        });
    });

    // =======================================================
    // --- SEÇÃO DE GERENCIAMENTO DE PRODUTOS ---
    // =======================================================
    const produtoForm = document.getElementById('produto-form');
    const produtoIdInput = document.getElementById('produto-id');
    const tipoInput = document.getElementById('tipo');
    const tituloInput = document.getElementById('titulo');
    const compositorInput = document.getElementById('compositor');
    const instrumentoInput = document.getElementById('instrumento');
    const generoInput = document.getElementById('genero');
    const descricaoInput = document.getElementById('descricao');
    const precoInput = document.getElementById('preco');
    const imagemCapaUrlInput = document.getElementById('imagem_capa_url');
    const camposPartituraDiv = document.getElementById('campos-partitura');
    const saveProdutoBtn = document.getElementById('save-produto-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const formMessage = document.getElementById('form-message');
    const produtosTableBody = document.querySelector('#produtos-table tbody');
    let editingProdutoId = null;

    if (tipoInput) {
        tipoInput.addEventListener('change', () => {
            camposPartituraDiv.style.display = tipoInput.value === 'partitura' ? 'block' : 'none';
        });
    }

    if (produtoForm) {
        produtoForm.addEventListener('submit', async (e) => {
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
                if (editingProdutoId) {
                    await db.collection('produtos').doc(editingProdutoId).update(produtoData);
                    formMessage.textContent = 'Produto atualizado com sucesso!';
                } else {
                    await db.collection('produtos').add(produtoData);
                    formMessage.textContent = 'Produto adicionado com sucesso!';
                }
                produtoForm.reset();
                editingProdutoId = null;
                saveProdutoBtn.textContent = 'Salvar Produto';
                cancelEditBtn.style.display = 'none';
                camposPartituraDiv.style.display = 'block';
                loadProdutos();
            } catch (error) {
                formMessage.textContent = `Erro ao salvar: ${error.message}`;
            }
            setTimeout(() => formMessage.textContent = '', 3000);
        });
    }

    async function loadProdutos() {
        if (!produtosTableBody) return;
        const snapshot = await db.collection('produtos').orderBy('titulo').get();
        produtosTableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const produto = { id: doc.id, ...doc.data() };
            const row = produtosTableBody.insertRow();
            row.innerHTML = `
                <td>${produto.titulo}</td>
                <td>${produto.tipo}</td>
                <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
                <td>
                    <button class="edit-btn">Editar</button>
                    <button class="delete-btn">Excluir</button>
                </td>
            `;
            row.querySelector('.edit-btn').addEventListener('click', () => editProduto(produto));
            row.querySelector('.delete-btn').addEventListener('click', () => deleteProduto(produto.id));
        });
    }

    function editProduto(produto) {
        editingProdutoId = produto.id;
        tipoInput.value = produto.tipo;
        tituloInput.value = produto.titulo;
        descricaoInput.value = produto.descricao;
        precoInput.value = produto.preco;
        imagemCapaUrlInput.value = produto.imagem_capa_url;
        if (produto.tipo === 'partitura') {
            camposPartituraDiv.style.display = 'block';
            compositorInput.value = produto.compositor || '';
            instrumentoInput.value = produto.instrumento || '';
            generoInput.value = produto.genero || '';
        } else {
            camposPartituraDiv.style.display = 'none';
        }
        saveProdutoBtn.textContent = 'Atualizar Produto';
        cancelEditBtn.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function deleteProduto(id) {
        if (confirm('Tem certeza?')) {
            await db.collection('produtos').doc(id).delete();
            loadProdutos();
        }
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
             produtoForm.reset();
             editingProdutoId = null;
             saveProdutoBtn.textContent = 'Salvar Produto';
             cancelEditBtn.style.display = 'none';
             camposPartituraDiv.style.display = 'block';
        });
    }

    // =======================================================
    // --- SEÇÃO DE GERENCIAMENTO DA HOMEPAGE ---
    // =======================================================
    const destaquesForm = document.getElementById('destaques-form');
    const destaquesOptionsDiv = document.getElementById('destaques-options');

    async function loadDestaques() {
        const destaquesDoc = await db.collection('config').doc('homepage').get();
        const destaquesAtuais = destaquesDoc.exists ? destaquesDoc.data().destaques || [] : [];
        const produtosSnapshot = await db.collection('produtos').orderBy('titulo').get();
        destaquesOptionsDiv.innerHTML = '';
        
        produtosSnapshot.forEach(doc => {
            const produto = { id: doc.id, ...doc.data() };
            const isChecked = destaquesAtuais.includes(produto.id);
            destaquesOptionsDiv.innerHTML += `
                <div>
                    <input type="checkbox" id="${produto.id}" name="destaque" value="${produto.id}" ${isChecked ? 'checked' : ''}>
                    <label for="${produto.id}">${produto.titulo} (${produto.tipo})</label>
                </div>
            `;
        });
    }

    if (destaquesForm) {
        destaquesForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedDestaques = Array.from(destaquesForm.querySelectorAll('input:checked')).map(cb => cb.value);
            if (selectedDestaques.length > 5) {
                alert('Selecione no máximo 5 destaques.');
                return;
            }
            await db.collection('config').doc('homepage').set({ destaques: selectedDestaques }, { merge: true });
            alert('Destaques salvos!');
        });
    }

    // --- Depoimentos ---
    const depoimentoForm = document.getElementById('depoimento-form');
    const depoimentoIdInput = document.getElementById('depoimento-id');
    const depoimentoTextoInput = document.getElementById('depoimento-texto');
    const depoimentoAutorInput = document.getElementById('depoimento-autor');
    const depoimentoImagemInput = document.getElementById('depoimento-imagem-url');
    const depoimentosTableBody = document.querySelector('#depoimentos-table tbody');
    let editingDepoimentoId = null;

    async function loadDepoimentos() { /* ... (código para carregar depoimentos) ... */ }
    if (depoimentoForm) {
        depoimentoForm.addEventListener('submit', async (e) => { /* ... (código para salvar depoimento) ... */ });
    }
});