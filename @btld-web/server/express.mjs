import express from 'express';
import { secrets } from 'docker-secret';

const app = express();
const port = 4000;

app.get('/', (req, res) => {
  res.send('Hello World!' + secrets.MAIL_APP_PW);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
