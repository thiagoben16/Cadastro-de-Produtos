// Configuração Única do Supabase
const supabaseKey = 'sb_publishable_KRR8xYMRFmLEgXVW5XF_rg_hsNiXN9V';
const supabaseUrl = 'https://oogscqpaetynejvdjen.supabase.co';
const supaBase = supabase.createClient(supabaseUrl, supabaseKey);

let lista_Produtos = [];
let planilha = null;

let contaneirForm = document.querySelector(".conteiner-main");

// Botões Iniciais
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
        
        let formularioCadastro = document.querySelector('#container-formulario');
        formularioCadastro.classList.remove('hidden');

        if (!planilha) {
            planilha = document.createElement('div');
            planilha.className = 'container-planilha';
            document.body.appendChild(planilha);

            let tabela = document.createElement('table');
            tabela.className = 'container-tabela';
            planilha.appendChild(tabela);
            
            tabela.innerHTML = `
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Produto</th>
                        <th>Descrição</th>                    
                        <th>Preço</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const corpoTabela = tabela.querySelector('tbody');
            const formulario = document.querySelector('form');

            formulario.addEventListener('submit', (e) => {
                e.preventDefault();

                // Gerar ID único uma única vez
                const novoId = Date.now();
                const nomeProduto = document.getElementById('produto').value;
                const descProduto = document.getElementById('descricao').value;
                const precoProduto = parseFloat(document.getElementById('preco').value).toFixed(2);

                const dados = {
                    id: novoId,
                    produto: nomeProduto,
                    descricao: descProduto,
                    preco: precoProduto
                };

                // Adicionar na tabela visual
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${dados.id}</td>
                    <td>${dados.produto}</td>
                    <td>${dados.descricao}</td>                    
                    <td>R$ ${dados.preco}</td>
                `;
                corpoTabela.appendChild(linha);

                // Guardar na lista local e enviar ao banco
                lista_Produtos.push(dados);

                supaBase.from('produtos').insert([dados]).then(() => {
                    formulario.reset();
                    alert('Produto enviado ao banco de dados com sucesso!');
                });
            });
        } else {
            planilha.classList.remove('hidden');
        }
    });

    botaoVoltar.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('#container-formulario').classList.add('hidden');
        if (planilha) planilha.classList.add('hidden');

        btnFormulario.classList.remove('hidden');
        btnBuscar.classList.remove('hidden');
    });
}

function buscarprodutos() {
    btnBuscar.addEventListener('click', (e) => {
        e.preventDefault();
        btnFormulario.classList.add('hidden');
        btnBuscar.classList.add('hidden');

        let buscador = document.createElement('form');
        buscador.className = 'form-buscador';
        buscador.innerHTML = `
            <label>ID do Produto: </label>
            <input id='busca-id' type="text" placeholder="Digite o ID...">
            <button type="button" class="botao-form-buscador">Buscar</button>
            <button type="button" class="botao-form-buscador-voltar">Voltar</button>
        `;
        contaneirForm.appendChild(buscador);

        let btnExecutarBusca = buscador.querySelector(".botao-form-buscador");
        let btnVoltarBusca = buscador.querySelector(".botao-form-buscador-voltar");

        btnVoltarBusca.addEventListener('click', () => {
            limparTabelaBusca();
            buscador.remove();
            btnBuscar.classList.remove('hidden');
            btnFormulario.classList.remove('hidden');
        });

        btnExecutarBusca.addEventListener('click', () => {
            let idBuscado = document.getElementById('busca-id').value;
            
            if (idBuscado === "") {
                alert('Por favor, digite um ID para buscar.');
                return;
            }

            limparTabelaBusca(); // Limpa resultado anterior antes de nova busca

            let p = lista_Produtos.find(item => item.id == idBuscado);
            
            if (p) {
                let resultadoTabela = document.createElement('table');
                // Adicionamos uma classe específica para facilitar a remoção depois
                resultadoTabela.className = 'container-tabela tabela-resultado-busca';
                resultadoTabela.innerHTML = `
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Produto</th>
                            <th>Descrição</th>                               
                            <th>Preço</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${p.id}</td>
                            <td>${p.produto}</td>
                            <td>${p.descricao}</td>                        
                            <td>R$ ${p.preco}</td>
                        </tr>
                    </tbody>
                `;
                contaneirForm.appendChild(resultadoTabela);
            } else {
                alert('Produto não encontrado localmente.');
            }
        });
    });
}

function limparTabelaBusca() {
    // Busca pela classe específica da tabela de resultados
    const tabelaResult = document.querySelector('.tabela-resultado-busca');
    if (tabelaResult) {
        tabelaResult.remove();
    }
}

// Inicialização
cadastrarprodutos();
buscarprodutos();




