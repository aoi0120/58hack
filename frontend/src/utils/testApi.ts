import { api } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';
import { AxiosError } from 'axios';

export const testTotalStepsAPI = async () => {
	try {
		console.log('=== API テスト開始 ===');

		// 認証トークンを確認
		const token = await SecureStore.getItemAsync('token');
		console.log('認証トークン:', token ? '存在' : 'なし');

		// APIリクエストを送信
		console.log('APIリクエスト送信中...');
		const response = await api.get('/steps/total_steps');

		console.log('レスポンス:', response.data);
		console.log('ステータス:', response.status);

		return response.data;
	} catch (error) {
		console.error('APIテストエラー:', error);
		if (error instanceof AxiosError) {
			console.error('レスポンスエラー:', error.response?.data);
			console.error('ステータス:', error.response?.status);
		}
		throw error;
	}
};
