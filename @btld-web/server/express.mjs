import express from 'express';
import { secrets } from 'docker-secret';

const app = express();
const port = 4000;

app.get('/', (req, res) => {
  res.send('Hello World!' + secrets.CLOUDFLARE_EMAIL);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
