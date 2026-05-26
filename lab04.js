const https = require('https');
const { URL } = require('url');

const URL_INICIAL = 'https://toscrape.com';
const DOMINIO_BASE = '://toscrape.com';
const MAX_PAGINAS = 5; 

function buscarHTML(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Falha ao carregar. Status: ${res.statusCode}`));
                return;
            }
            let html = '';
            res.on('data', chunk => html += chunk);
            res.on('end', () => resolve(html));
        }).on('error', err => reject(err));
    });
}

function extrairLinks(html) {
    const regex = /href="([^"]+)"/g;
    return [...html.matchAll(regex)].map(m => m[1]);
}

function normalizarLinks(links, urlBase) {
    const urlsValidas = new Set();
    links.forEach(link => {
        try {
            const urlAbsoluta = new URL(link, urlBase);
            if ((urlAbsoluta.protocol === 'http:' || urlAbsoluta.protocol === 'https:') && 
                urlAbsoluta.hostname === DOMINIO_BASE) {
                urlsValidas.add(urlAbsoluta.href);
            }
        } catch (e) {
        }
    });
    return Array.from(urlsValidas);
}

async function iniciarCrawler(urlInicial) {
    const paginasVisitadas = new Set();
    const filaDeFronteira = [urlInicial];
    const todosOsLinksEncontrados = new Set();

    console.log(`🚀 Iniciando Mini Crawler Web em: ${urlInicial}\n`);

    while (filaDeFronteira.length > 0 && paginasVisitadas.size < MAX_PAGINAS) {
        const urlAtual = filaDeFronteira.shift();

        if (paginasVisitadas.has(urlAtual)) continue;

        console.log(`🔍 Rastejando (${paginasVisitadas.size + 1}/${MAX_PAGINAS}): ${urlAtual}`);
        paginasVisitadas.add(urlAtual);

        try {
            const html = await buscarHTML(urlAtual);
            const linksBrutos = extrairLinks(html);
            const linksNormalizados = normalizarLinks(linksBrutos, urlAtual);

            linksNormalizados.forEach(link => {
                todosOsLinksEncontrados.add(link);
                
                if (!paginasVisitadas.has(link) && !filaDeFronteira.includes(link)) {
                    filaDeFronteira.push(link);
                }
            });

            console.log(`   ↳ Encontrados ${linksNormalizados.length} links internos válidos nesta página.`);

        } catch (err) {
            console.error(`   ❌ Erro ao processar ${urlAtual}: ${err.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n======================================================');
    console.log('🏁 CRAWLER FINALIZADO COM SUCESSO!');
    console.log(`Páginas analisadas com sucesso: ${paginasVisitadas.size}`);
    console.log(`Total de links únicos descobertos em toda a rede: ${todosOsLinksEncontrados.size}`);
    console.log('======================================================\n');
    
    console.log('Amostra de links descobertos:');
    Array.from(todosOsLinksEncontrados).slice(0, 15).forEach(l => console.log(` - ${l}`));
    if (todosOsLinksEncontrados.size > 15) console.log(' ... e muitos outros.');
}

iniciarCrawler(URL_INICIAL);