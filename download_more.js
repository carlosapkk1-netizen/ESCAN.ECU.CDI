const https = require('https');
const fs = require('fs');

function downloadImage(pageUrl, filename) {
    https.get(pageUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const match = data.match(/<meta property="og:image" content="(.*?)"/);
            if (match && match[1]) {
                const imgUrl = match[1];
                console.log("Found direct URL:", imgUrl);
                https.get(imgUrl, (imgRes) => {
                    const file = fs.createWriteStream('./public/' + filename);
                    imgRes.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        console.log("Downloaded successfully to public/" + filename);
                    });
                });
            } else {
                console.log("Could not find direct image URL for", pageUrl);
            }
        });
    }).on('error', (err) => {
        console.error("Error fetching page:", err.message);
    });
}

downloadImage('https://postimg.cc/06BMb1j8', 'novo_anexo1.png');
downloadImage('https://postimg.cc/87CzWXxn', 'novo_anexo2.png');
