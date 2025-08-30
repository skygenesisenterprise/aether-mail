import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const { MAIL_USER, MAIL_TOKEN, MAIL_HOST } = process.env;

(async () => {
  const url = `https://${MAIL_HOST}/mail/execute/list_pops`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `mail ${MAIL_USER}:${MAIL_TOKEN}`,
    },
  });
  const data = await response.text();
  console.log(data);
})();