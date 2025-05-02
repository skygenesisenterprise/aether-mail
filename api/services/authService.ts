import axios from 'axios';
import config from '../utils/config';

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
