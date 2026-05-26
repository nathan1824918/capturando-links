const https = require('https');
const { URL } = require('url'); // módulo nativo

const URL_BASE = 'https://books.toscrape.com';

function buscarHTML(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
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

            if (urlAbsoluta.protocol === 'http:' || urlAbsoluta.protocol === 'https:') {
                urlsValidas.add(urlAbsoluta.href);
            }
        } catch (e) {
        }
    });

    return Array.from(urlsValidas);
}

buscarHTML(URL_BASE)
    .then(html => {
        const linksBrutos = extrairLinks(html);
        const linksNormalizados = normalizarLinks(linksBrutos, URL_BASE);

        console.log(`Total de links brutos extraídos: ${linksBrutos.length}`);
        console.log(`Total de links normalizados e únicos: ${linksNormalizados.length}`);
        console.log('\n=== URLs Prontas para novas requisições ===');
        linksNormalizados.forEach(link => console.log(link));
    })
    .catch(err => console.error('Erro:', err.message));