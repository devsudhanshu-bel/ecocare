const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://placehold.co/400x400/png';
const dest = path.join(__dirname, '../../frontend/public/placeholder.png');

const file = fs.createWriteStream(dest);
https.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
        file.close(() => console.log('Downloaded placeholder.png'));
    });
}).on('error', function (err) {
    fs.unlink(dest);
    console.error(err);
});
