import { useState, useEffect } from 'react';
import { useTotalStep } from '../features/home/context/TotalStep';
import { useAuth } from '../features/auth/context/AuthContext';
import { api } from '@/lib/api';

export interface BattleData {
	userId: string;
	userName: string;
	userLevel: number;
	yesterdaySteps: number;
	timestamp: number;
	peerId?: string;
}

export function useBattleData() {
	const [battleData, setBattleData] = useState<BattleData | null>(null);
	const [opponentData, setOpponentData] = useState<BattleData | null>(null);
	const [isExchanging, setIsExchanging] = useState(false);
	const [yesterdaySteps, setYesterdaySteps] = useState(0);

	const { userLevel } = useTotalStep();
	const { user } = useAuth();

	// 昨日の歩数データを取得
	useEffect(() => {
		const fetchYesterdaySteps = async () => {
			try {
				console.log('🔍 昨日の歩数データを取得開始...', { userId: user?.id });
				const response = await api.get('/steps/yesterday');
				console.log('📊 昨日の歩数APIレスポンス:', {
					status: response.status,
					data: response.data,
					steps: response.data.steps,
					date: response.data.date,
				});
				setYesterdaySteps(response.data.steps || 0);
				console.log('✅ 昨日の歩数データを取得完了:', response.data.steps);
			} catch (error) {
				console.error('❌ 昨日の歩数データの取得に失敗:', error);
				if (error.response) {
					console.error('❌ レスポンスエラー:', {
						status: error.response.status,
						data: error.response.data,
					});
				}
			}
		};

		if (user) {
			fetchYesterdaySteps();
		}
	}, [user]);

	// 自分のバトルデータを準備（昨日の歩数を使用）
	const myBattleData: BattleData = {
		userId: user?.id || '',
		userName: user?.name || '',
		userLevel: userLevel,
		yesterdaySteps: yesterdaySteps,
		timestamp: Date.now(),
	};

	// データを送信する関数（expo-nearby-connectionsの正しいAPIを使用）
	const sendBattleData = async (peerId: string) => {
		if (!user) return;

		try {
			setIsExchanging(true);

			// expo-nearby-connectionsを読み込み
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const nearby = require('expo-nearby-connections');
			const { sendText } = nearby;

			if (sendText && typeof sendText === 'function') {
				const payload = JSON.stringify(myBattleData);
				await sendText(peerId, payload);
				console.log('バトルデータを送信:', myBattleData);
			} else {
				console.warn('sendText関数が利用できません');
			}
		} catch (error) {
			console.error('バトルデータの送信に失敗:', error);
		} finally {
			setIsExchanging(false);
		}
	};

	// データを受信する関数
	const receiveBattleData = (peerId: string, text: string) => {
		try {
			const data: BattleData = JSON.parse(text);
			setOpponentData({ ...data, peerId });
			console.log('バトルデータを受信:', { ...data, peerId });
		} catch (error) {
			console.error('バトルデータの受信に失敗:', error);
		}
	};

	// データ交換を開始する関数
	const startDataExchange = async (peerId: string) => {
		if (!user) return;

		try {
			setIsExchanging(true);

			// データを送信
			await sendBattleData(peerId);

			// データを受信するリスナーを設定
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const nearby = require('expo-nearby-connections');
			const { onTextReceived } = nearby;

			if (onTextReceived) {
				const unsubscribe = onTextReceived(({ peerId: senderId, text }: any) => {
					if (senderId === peerId) {
						receiveBattleData(peerId, text);
					}
				});

				// クリーンアップ関数を返す
				return () => {
					unsubscribe?.();
					setIsExchanging(false);
				};
			}
		} catch (error) {
			console.error('データ交換の開始に失敗:', error);
			setIsExchanging(false);
		}
	};

	// データをリセットする関数
	const resetBattleData = () => {
		setBattleData(null);
		setOpponentData(null);
		setIsExchanging(false);
	};

	return {
		myBattleData,
		opponentData,
		isExchanging,
		yesterdaySteps,
		sendBattleData,
		receiveBattleData,
		startDataExchange,
		resetBattleData,
	};
}
