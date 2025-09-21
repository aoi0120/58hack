import * as SecureStore from 'expo-secure-store';
import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

console.log('Environment variables:', {
	EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
	NODE_ENV: process.env.NODE_ENV,
	API_URL: API_URL,
});

export const api = axios.create({
	baseURL: API_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

export const fetchStepRanking = async (daysCount: number) => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];

  try {
    const response = await api.post('/steps', {
      date: dateString,
      daysCount,
    });
    return response.data; // [{ rank, steps, user }]
  } catch (error) {
    console.error('歩数ランキング取得エラー:', error);
    throw error;
  }
};

export const fetchWinRateRanking = async (daysCount: number) => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];

  try {
    const response = await api.post('/winrate', {
      date: dateString,
      daysCount,
    });
    return response.data; // [{ rank, winRate, user }]
  } catch (error) {
    console.error('勝率ランキング取得エラー:', error);
    throw error;
  }
};

export const fetchTotalSteps = async (): Promise<number> => {
  try {
    const response = await api.get('/steps/total_steps');
    return response.data.totalSteps ?? 0;
  } catch (error) {
    console.error('総歩数取得エラー:', error);
    throw error;
  }
};

export const fetchTotalWins = async (): Promise<number> => {
  try {
    const userId = await SecureStore.getItemAsync('userId');
    const response = await api.get('/battle/total_wins', {
      params: { userId },
    });
    return response.data.totalWins ?? 0;
  } catch (error) {
    console.error('総勝利数取得エラー:', error);
    throw error;
  }
};


api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
	const token = await SecureStore.getItemAsync('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
		console.log('リクエストヘッダーにトークンを追加:', config.url);
	} else {
		console.log('トークンが見つかりません:', config.url);
	}
	console.log('リクエスト詳細:', {
		url: config.url,
		method: config.method,
		baseURL: config.baseURL,
		headers: config.headers,
	});
	return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (!error.response) {
			throw error;
		}

		if (error.response.status === 401) {
			const refreshToken = await SecureStore.getItemAsync('refreshToken');
			if (!refreshToken) {
				await SecureStore.deleteItemAsync('token');
				throw error;
			}

			refreshing ??= (async () => {
				try {
					const response = await axios.post(`${API_URL}/auth/refresh`, {
						refreshToken: refreshToken,
					});

					const newAccessToken = response.data.token;
					if (newAccessToken) {
						await SecureStore.setItemAsync('token', newAccessToken);
						return newAccessToken;
					}
					return null;
				} catch (refreshError) {
					console.error('トークンリフレッシュエラー:', refreshError);
					await SecureStore.deleteItemAsync('token');
					await SecureStore.deleteItemAsync('refreshToken');
					return null;
				} finally {
					refreshing = null;
				}
			})();

			const newToken = await refreshing;
			if (!newToken) {
				throw error;
			}

			error.config.headers.Authorization = `Bearer ${newToken}`;
			return api(error.config);
		}

		throw error;
	}
);

export const sendYesterdaySteps = async (steps: number) => {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const dateString = yesterday.toISOString().split('T')[0];

	try {
		const response = await api.post('/steps/yesterday', {
			steps,
			date: dateString,
		});
		return response.data;
	} catch (error) {
		console.error('昨日の歩数データ送信エラー:', error);
		throw error;
	}
};
