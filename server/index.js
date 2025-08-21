import express from 'express';
import cors from 'cors';
import "dotenv/config";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: '*'};
app.use(cors(corsOptions));
app.use(express.json());


app.get('/api/songs/:songId', (req, res) => {
  const songId = req.params.songId;
  const code = req.query.code;
  if(code !== "4351") return res.status(403).send('Forbidden');
  const filePath = path.join(__dirname, 'songs', `${songId}.mp3`);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) return res.status(404).send('Song not found');

    const range = req.headers.range;
    const fileSize = stats.size;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunkSize = end - start + 1;
      const stream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mpeg',
      });

      stream.pipe(res);

      stream.on('error', () => res.end());
      res.on('close', () => stream.destroy());
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });

      fs.createReadStream(filePath).pipe(res);
    }
  });
});

app.get('/api/songs', (req, res) => {
  const code = req.query.code;
  if (code !== "4351") return res.status(403).send('Forbidden');

  const songsDir = path.join(__dirname, 'songs');

  fs.readdir(songsDir, (err, files) => {
    if (err) return res.status(500).send('Server error');

    // Filter only mp3 files
    const songs = files
      .filter(file => file.endsWith('.mp3'))
      .map(file => ({
        name: file,
        url: `http://localhost:3000/api/songs/${path.parse(file).name}?code=4351`
      }));

    res.json(songs);
  });
});

app.use(express.static(path.join(__dirname, '../gui/dist')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../gui/dist', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});