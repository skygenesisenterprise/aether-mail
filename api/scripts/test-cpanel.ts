import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const { CPANEL_USER, CPANEL_TOKEN, CPANEL_HOST } = process.env;

(async () => {
  const url = `https://${CPANEL_HOST}:2083/execute/Email/list_pops`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `cpanel ${CPANEL_USER}:${CPANEL_TOKEN}`,
    },
  });
  const data = await response.text();
  console.log(data);
})();