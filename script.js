// Sua configuração do Supabase permanece a mesma
const supabaseKey = 'https://nzgqqrgeatfynstjvdyn.supabase.co';
const supabaseUrl = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56Z3FxcmdlYXRmeW5zdGp2ZHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTExMzYsImV4cCI6MjA5MzQ4NzEzNn0.GZqcEr43UJjJzWChh8m8C7FKEcTFSOrgwlgWGMrHNdQ';
const supaBase = supabase.createClient(supabaseUrl, supabaseKey);

let lista_Produtos = [];
let planilha = null;
let contaneirForm = document.querySelector(".conteiner-main");

// Seus botões de interface
const btnFormulario = document.createElement('button');
btnFormulario.className = 'botao-formulario';
btnFormulario.innerText = 'Cadastrar Produto';
contaneirForm.appendChild(btnFormulario);

const btnBuscar = document.createElement('button');
btnBuscar.className = 'botao-buscar';
btnBuscar.innerText = 'Buscar Produto';
contaneirForm.appendChild(btnBuscar);

const botaoVoltar = document.querySelector('#botao-voltar');

function cadastrarprodutos() {
    btnFormulario.addEventListener('click', (e) => {
        e.preventDefault();
        btnFormulario.classList.add('hidden');
        btnBuscar.classList.add('hidden');
        document.querySelector('#container-formulario').classList.remove('hidden');

        if (!planilha) {
            planilha = document.createElement('div');
            planilha.className = 'container-planilha';
            document.body.appendChild(planilha);

            let tabela = document.createElement('table');
            tabela.className = 'container-tabela';
            planilha.appendChild(tabela);
            
            // Cabeçalho da sua tabela
            tabela.innerHTML = `
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Produto</th>
                        <th>Descrição</th>                    
                        <th>Preço</th>
                        <th>Qtd</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="corpo-tabela-principal"></tbody>
            `;

            const formulario = document.querySelector('form');
            formulario.addEventListener('submit', async (e) => {
                e.preventDefault();

                const dados = {
                    id: Date.now(),
                    produto: document.getElementById('produto').value,
                    descricao: document.getElementById('descricao').value,
                    preco: parseFloat(document.getElementById('preco').value.replace(',', '.')).toFixed(2),
                    quantidade: 1 
                };

                lista_Produtos.push(dados);
                renderizarLinha(dados); 
                formulario.reset();

                try {
                    await supaBase.from('produtos').insert([dados]);
                } catch (err) {
                    console.log("Erro de rede capturado.");
                }
            });
        } else {
            planilha.classList.remove('hidden');
        }
    });

    botaoVoltar.addEventListener('click', () => {
        document.querySelector('#container-formulario').classList.add('hidden');
        if (planilha) planilha.classList.add('hidden');
        btnFormulario.classList.remove('hidden');
        btnBuscar.classList.remove('hidden');
    });
}

// FUNÇÃO QUE CRIA A LINHA - MANTIDA IGUAL
function renderizarLinha(produto) {
    const corpoTabela = document.getElementById('corpo-tabela-principal');
    const linha = document.createElement('tr');
    linha.id = `linha-${produto.id}`;
    
    linha.innerHTML = `
        <td>${produto.id}</td>
        <td>${produto.produto}</td>
        <td>${produto.descricao}</td>                    
        <td>R$ ${produto.preco}</td>
        <td class="qtd-valor">${produto.quantidade}</td>
        <td>
            <button class="btn-mais" onclick="alterarQuantidade('${produto.id}', 1)"> + </button>
            <button class="btn-menos" onclick="alterarQuantidade('${produto.id}', -1)"> - </button>
        </td>
    `;
    corpoTabela.appendChild(linha);
}

// LÓGICA DE QUANTIDADE - MANTIDA IGUAL
window.alterarQuantidade = async function(id, mudanca) {
    const pIndex = lista_Produtos.findIndex(p => p.id == id);
    if (pIndex === -1) return;

    const produto = lista_Produtos[pIndex];
    let novaQtd = parseInt(produto.quantidade) + mudanca;

    if (novaQtd <= 0) {
        const confirmar = confirm(`Deseja remover "${produto.produto}" do estoque?`);
        if (confirmar) {
            const el = document.getElementById(`linha-${id}`);
            if(el) el.remove();
            lista_Produtos.splice(pIndex, 1);
            try {
                await supaBase.from('produtos').delete().eq('id', id);
            } catch (e) { console.error(e); }
        }
    } else {
        produto.quantidade = novaQtd;
        const campoQtd = document.getElementById(`linha-${id}`)?.querySelector('.qtd-valor');
        if (campoQtd) campoQtd.innerText = novaQtd;

        try {
            await supaBase.from('produtos').update({ quantidade: novaQtd }).eq('id', id);
        } catch (e) { 
            console.warn("Alteração apenas local devido a erro de conexão."); 
        }
    }
};

// BUSCADOR CORRIGIDO - AGORA MOSTRA TUDO
function buscarprodutos() {
    btnBuscar.addEventListener('click', () => {
        btnFormulario.classList.add('hidden');
        btnBuscar.classList.add('hidden');

        // Cria o buscador se não existir
        let buscador = document.querySelector('.form-buscador');
        if(!buscador) {
            buscador = document.createElement('form');
            buscador.className = 'form-buscador';
            buscador.innerHTML = `
                <input id='busca-id' type="text" placeholder="ID...">
                <button type="button" id="btn-executar-busca">Buscar</button>
                <button type="button" id="btn-cancelar-busca">Voltar</button>
            `;
            contaneirForm.appendChild(buscador);
        }

        document.getElementById('btn-cancelar-busca').onclick = () => {
            const res = document.querySelector('.container-resultado-cards');
            if (res) res.remove();
            buscador.remove();
            btnBuscar.classList.remove('hidden');
            btnFormulario.classList.remove('hidden');
        };

        document.getElementById('btn-executar-busca').onclick = () => {
            let idBuscado = document.getElementById('busca-id').value;
            let p = lista_Produtos.find(item => item.id == idBuscado);
            
            // Remove resultado anterior se houver
            const antigo = document.querySelector('.container-resultado-cards');
            if (antigo) antigo.remove();

            if (p) {
                let resDiv = document.createElement('div');
                resDiv.className = 'container-resultado-cards';
                // Aqui eu injeto TODOS os campos que você pediu
                resDiv.innerHTML = `
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 20px;">
                        <div class="card-info" style="background: white; color: #1a2a6c; padding: 15px; border-radius: 10px; font-weight: bold; box-shadow: 4px 4px 10px rgba(0,0,0,0.2);">ID: ${p.id}</div>
                        <div class="card-info" style="background: white; color: #1a2a6c; padding: 15px; border-radius: 10px; font-weight: bold; box-shadow: 4px 4px 10px rgba(0,0,0,0.2);">${p.produto}</div>
                        <div class="card-info" style="background: white; color: #1a2a6c; padding: 15px; border-radius: 10px; font-weight: bold; box-shadow: 4px 4px 10px rgba(0,0,0,0.2);">${p.descricao}</div>
                        <div class="card-info" style="background: white; color: #1a2a6c; padding: 15px; border-radius: 10px; font-weight: bold; box-shadow: 4px 4px 10px rgba(0,0,0,0.2);">R$ ${p.preco}</div>
                        <div class="card-info" style="background: white; color: #1a2a6c; padding: 15px; border-radius: 10px; font-weight: bold; box-shadow: 4px 4px 10px rgba(0,0,0,0.2);">Qtd: ${p.quantidade}</div>
                    </div>`;
                contaneirForm.appendChild(resDiv);
            } else {
                alert("ID não encontrado!");
            }
        };
    });
}

cadastrarprodutos();
buscarprodutos();