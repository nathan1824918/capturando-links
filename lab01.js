const https = require('https');
const URL_ALVO = 'https://books.toscrape.com';

function buscarHTML(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let html = '';

            res.on('data', chunk => {
                html += chunk;
            });

            res.on('end', () => {
                resolve(html);
            });

        }).on('error', (err) => {
            reject(err);
        });
    });
}

function extrairLinks(html) {
    const regex = /href="([^"]+)"/g;
    
    const matches = [...html.matchAll(regex)];
    return matches.map(m => m[1]); // m[1] extrai apenas o grupo de captura (o link em si)
}

buscarHTML(URL_ALVO)
    .then(html => {
        const links = extrairLinks(html);
        console.log(`Total de links encontrados: ${links.length}`);
        links.forEach(link => console.log(link));
    })
    .catch(err => console.error('Erro:', err.message));
