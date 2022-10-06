import express from 'express';
import path from 'path';

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, '..', 'build', 'frontend')));

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
