import axios from 'axios';
import config from '../utils/config';
import fetch from 'node-fetch';
import { User } from '../models/authModel';
import Imap from 'imap';

const {
  CPANEL_USER,
  CPANEL_PASSWORD,
  CPANEL_DOMAIN,
  CPANEL_HOST,
} = process.env;

const CPANEL_API_URL = `https://${CPANEL_HOST}:2083/execute/Email`;

export async function loginWithExternalAuth(username: string, password: string): Promise<{ token: string }> {
  try {
    const response = await axios.post(config.skygenesisAuthUrl, { username, password }, { timeout: 7000 });
    if (response.data && response.data.token) {
      return { token: response.data.token };
    }
    throw new Error('Invalid response from auth service');
  } catch (err: any) {
    throw new Error('External authentication failed: ' + (err.response?.data?.message || err.message));
  }
}

export async function createCpanelAccount(user: User): Promise<{ success: boolean; error?: string }> {
  const basicAuth = Buffer.from(`${CPANEL_USER}:${CPANEL_PASSWORD}`).toString('base64');

  const response = await fetch(`${CPANEL_API_URL}/add_pop`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email: user.username,
      domain: CPANEL_DOMAIN || '',
      password: user.password || '',
      quota: '1024',
    }),
  });

  const text = await response.text();
  try {
    const data = JSON.parse(text);
    if (data.status === 1) return { success: true };
    return { success: false, error: data.errors?.[0] || 'Failed to create account.' };
  } catch (err) {
    console.error('Réponse cPanel non JSON:', text);
    return { success: false, error: 'Invalid response from cPanel: ' + text.slice(0, 200) };
  }
}

export async function validateCpanelLogin(user: User): Promise<boolean> {
  return new Promise((resolve) => {
    const imap = new Imap({
      user: `${user.username}@${CPANEL_DOMAIN}`,
      password: user.password || '',
      host: CPANEL_HOST,
      port: 993,
      tls: true,
    });

    imap.once('ready', function () {
      imap.end();
      resolve(true);
    });

    imap.once('error', function () {
      resolve(false);
    });

    try {
      imap.connect();
    } catch {
      resolve(false);
    }
  });
}
