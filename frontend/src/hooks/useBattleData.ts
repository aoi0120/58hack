import { useState, useEffect, useRef } from 'react';
import { useTotalStep } from '../features/home/context/TotalStep';
import { useAuth } from '../features/auth/context/AuthContext';
import { api } from '@/lib/api';
import { useYesterdayHealthData } from './useHealthData';

export interface BattleData {
	userId: string;
	userName: string;
	userLevel: number;
	yesterdaySteps: number;
	timestamp: number;
	peerId?: string;
}

export function useBattleData() {
	const [opponentData, setOpponentData] = useState<BattleData | null>(null);
	const [isExchanging, setIsExchanging] = useState(false);
	const [yesterdaySteps, setYesterdaySteps] = useState(0);

	const { userLevel } = useTotalStep();
	const { user } = useAuth();

	// 端末の「昨日の歩数」
	const { steps: deviceYesterdaySteps, loading: deviceYesterdayLoading } =
		useYesterdayHealthData();
	const hasSyncedYesterdayRef = useRef(false);
	const serverFetchedRef = useRef(false);

	// 昨日の歩数データを取得（サーバー）
	useEffect(() => {
		const fetchYesterdaySteps = async () => {
			try {
				const response = await api.get('/steps/yesterday');
				setYesterdaySteps(Number(response.data.steps) || 0);
			} catch (error) {
				// 取れなくても画面は端末値で進める
			} finally {
				serverFetchedRef.current = true;
			}
		};
		if (user) fetchYesterdaySteps();
	}, [user]);

	// 端末の昨日歩数がサーバーより大きい場合はサーバーへ同期
	useEffect(() => {
		if (!user) return;
		if (deviceYesterdayLoading) return;
		if (hasSyncedYesterdayRef.current) return;

		const sync = async () => {
			try {
				const yesterday = new Date();
				yesterday.setDate(yesterday.getDate() - 1);
				const dateStr = yesterday.toISOString().split('T')[0];

				const backend = Number(yesterdaySteps) || 0;
				const deviceVal = Number(deviceYesterdaySteps) || 0;

				if (deviceVal > 0 && deviceVal > backend) {
					await api.post('/steps/yesterday', { steps: deviceVal, date: dateStr });
					setYesterdaySteps(deviceVal);
				}
			} catch {
				// 同期失敗でも端末値は使える
			} finally {
				hasSyncedYesterdayRef.current = true;
			}
		};
		sync();
	}, [user, deviceYesterdayLoading, deviceYesterdaySteps, yesterdaySteps]);

	// 端末とサーバーの最大値を “見せる値” に
	const effectiveYesterdaySteps = Math.max(
		Number(yesterdaySteps) || 0,
		Number(deviceYesterdaySteps) || 0
	);

	// 自分のバトルデータ（送信用）
	const myBattleData: BattleData = {
		userId: user?.id || '',
		userName: user?.name || '',
		userLevel,
		yesterdaySteps: effectiveYesterdaySteps,
		timestamp: Date.now(),
	};

	// データを送信
	const sendBattleData = async (peerId: string) => {
		if (!user) return;
		try {
			setIsExchanging(true);
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const nearby = require('expo-nearby-connections');
			const { sendText } = nearby;

			if (typeof sendText === 'function') {
				const payload = JSON.stringify({
					...myBattleData,
					yesterdaySteps: Number(effectiveYesterdaySteps) || 0,
					userLevel: Number(userLevel) || 0,
					timestamp: Date.now(),
				});
				await sendText(peerId, payload);
			}
		} catch (error) {
			console.error('バトルデータの送信に失敗:', error);
		} finally {
			setIsExchanging(false);
		}
	};

	// データを受信
	const receiveBattleData = (peerId: string, text: string) => {
		try {
			const raw = JSON.parse(text);
			const parsed: BattleData = {
				userId: String(raw.userId || ''),
				userName: String(raw.userName || ''),
				userLevel: Number(raw.userLevel) || 0,
				yesterdaySteps: Number(raw.yesterdaySteps) || 0,
				timestamp: Number(raw.timestamp) || Date.now(),
				peerId,
			};
			setOpponentData(parsed);
		} catch (error) {
			console.error('バトルデータの受信に失敗:', error);
		}
	};

	// データ交換を開始
	const startDataExchange = async (peerId: string) => {
		if (!user) return;
		try {
			setIsExchanging(true);

			// 先に受信リスナー
			const nearby = require('expo-nearby-connections');
			const { onTextReceived } = nearby;

			let handled = false;
			let unsubscribe: (() => void) | undefined;
			if (onTextReceived) {
				unsubscribe = onTextReceived(({ peerId: senderId, text }: any) => {
					if (handled) return;
					if (senderId === peerId) {
						handled = true;
						receiveBattleData(peerId, text);
					}
				});
			}

			console.log('📤 sending battle payload to:', peerId);
			// すぐ送る（ensureExchange 側で onConnected 後にしか来ない）
			await sendBattleData(peerId);

			return () => {
				unsubscribe?.();
				setIsExchanging(false);
			};
		} catch (error) {
			console.error('データ交換の開始に失敗:', error);
			setIsExchanging(false);
		}
	};

	const resetBattleData = () => {
		setOpponentData(null);
		setIsExchanging(false);
	};

	return {
		myBattleData,
		opponentData,
		isExchanging,
		yesterdaySteps,
		effectiveYesterdaySteps,
		sendBattleData,
		receiveBattleData,
		startDataExchange,
		resetBattleData,
	};
}
