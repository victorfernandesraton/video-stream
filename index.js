
const express = require('express')
const app = express()
const fs = require("fs");
const path = require('path');
const PORT = process.env.PORT || 4000



app.get('/', function (req, res) {
    res.sendFile(path.resolve(path.join(__dirname, 'assets', 'index.html')));
})

app.get('/video/:filename', function (req, res) {
    const range = req.headers.range;

    const filename = req.params.filename

    // get video stats (about 61MB)
    const videoPath = path.resolve(path.join(__dirname, 'video', filename))

    if (!fs.existsSync(videoPath)) {
        res.writeHead(404)
        res.send('not found this video')
        return
    }
    const videoSize = fs.statSync(videoPath).size;
    if (range) {

        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : videoSize - 1
        // Create headers
        const contentLength = end - start + 1;

        // create video read stream for this particular chunk
        const videoStream = fs.createReadStream(videoPath, { start, end });

        const headers = {
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': 'video/mp4',
        };

        // HTTP Status 206 for Partial Content
        res.writeHead(206, headers);


        // Stream the video chunk to the client
        videoStream.pipe(res);
    } else {
        const head = {
            'Content-Length': videoSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(videoPath).pipe(res)
    }
})

app.listen(PORT, function () {
    console.log(`App is running on port ${PORT}`)
})