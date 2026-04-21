const https = require('https');
const fs = require('fs');

https.get('https://postimg.cc/Mcd05LGr', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const match = data.match(/<meta property="og:image" content="(.*?)"/);
        if (match && match[1]) {
            const imgUrl = match[1];
            console.log("Found direct URL:", imgUrl);
            https.get(imgUrl, (imgRes) => {
                const file = fs.createWriteStream('./public/logo1.png');
                imgRes.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log("Downloaded successfully to public/logo1.png");
                });
            }).on('error', (err) => {
                console.error("Error downloading image:", err.message);
            });
        } else {
            console.log("Could not find direct image URL in the page.");
        }
    });
}).on('error', (err) => {
    console.error("Error fetching page:", err.message);
});
