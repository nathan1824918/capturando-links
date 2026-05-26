const https = require('https');
const URL_ALVO = 'https://books.toscrape.com';
const DOMINIO_BASE = 'books.toscrape.com';

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

function classificarLinks(links, dominio) {
    const internos = [];
    const externos = [];

    links.forEach(link => {
        if (link.startsWith('/') || link.includes(dominio)) {
            internos.push(link);
        } else {
            if (link && !link.startsWith('#')) {
                externos.push(link);
            }
        }
    });

    return { internos, externos };
}

buscarHTML(URL_ALVO)
    .then(html => {
        const links = extrairLinks(html);
        const resultado = classificarLinks(links, DOMINIO_BASE);

        console.log(`=== Links Internos: ${resultado.internos.length} ===`);
        resultado.internos.forEach(link => console.log(link));

        console.log(`\n=== Links Externos: ${resultado.externos.length} ===`);
        resultado.externos.forEach(link => console.log(link));
    })
    .catch(err => console.error('Erro:', err.message));