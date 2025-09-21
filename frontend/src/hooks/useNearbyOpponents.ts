// src/hooks/useNearbyOpponents.ts
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { Opponent } from '../features/battle/types';
import { useBattleData } from './useBattleData';
import { useAuth } from '../features/auth/context/AuthContext';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

export function useNearbyOpponents() {
	const [opponents, setOpponents] = useState<Opponent[]>([]);
	const [scanning, setScanning] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [battledOpponents, setBattledOpponents] = useState<Set<string>>(new Set());
	const [battleResult, setBattleResult] = useState<{
		winner: 'me' | 'opponent';
		mySteps: number;
		opponentSteps: number;
		opponent: Opponent;
	} | null>(null);
	const {
		startDataExchange,
		opponentData,
		resetBattleData,
		myBattleData,
		effectiveYesterdaySteps,
	} = useBattleData();
	const { user } = useAuth();

	// ユーザー名を取得（デフォルトは"Player"）
	const myName = user?.name || 'Player';

	// 役割分担（競合回避）：
	// 偶数ID: advertiser-only（acceptのみ） / 奇数ID: discoverer-only（requestのみ）
	const { isDiscoverer, isAdvertiser } = useMemo(() => {
		const rawId = user?.id;
		const parsed = rawId ? parseInt(String(rawId), 10) : NaN;
		if (!Number.isFinite(parsed)) {
			// 不明時は discoverer として動作
			return { isDiscoverer: true, isAdvertiser: false };
		}
		const discoverer = parsed % 2 !== 0;
		return { isDiscoverer: discoverer, isAdvertiser: !discoverer };
	}, [user?.id]);

	// 多重初期化防止
	const initializedRef = useRef(false);

	// 接続を確立してからデータ交換を行う関数（discoverer側のみ request）
	const connectAndExchangeData = useCallback(
		async (peerId: string, name: string) => {
			try {
				console.log('🔗 接続フロー開始:', { peerId, name, isDiscoverer, isAdvertiser });

				const mod = await import('expo-nearby-connections');
				const nearby: any = (mod as any).default ?? (mod as any);
				const { requestConnection, onConnected } = nearby;

				if (isDiscoverer) {
					await requestConnection?.(peerId);
					console.log('📤 接続リクエスト送信完了:', peerId);
				} else {
					console.log('📨 advertiserはrequestせずaccept待ち');
				}

				const unsubscribe = onConnected?.(({ peerId: connectedPeerId }: any) => {
					if (connectedPeerId === peerId) {
						console.log('✅ 接続確立:', connectedPeerId);
						startDataExchange(peerId);
						unsubscribe?.();
					}
				});
			} catch (error) {
				console.error('❌ 接続に失敗:', error);
			}
		},
		[startDataExchange, isDiscoverer, isAdvertiser]
	);

	// バトル記録を作成する関数
	const createBattleRecord = useCallback(
		async (opponentId: string, mySteps: number, opponentSteps: number) => {
			try {
				console.log('⚔️ バトル記録を作成中:', {
					opponentId,
					mySteps,
					opponentSteps,
					myUserId: user?.id,
					timestamp: new Date().toISOString(),
				});

				const requestData = {
					opponentId,
					mySteps,
					opponentSteps,
				};

				console.log('📤 バトル記録APIリクエスト:', requestData);

				const response = await api.post('/battle/encounter', requestData);

				console.log('✅ バトル記録作成完了:', {
					status: response.status,
					data: response.data,
					battleId: response.data.battleId,
					winner: response.data.winner,
				});

				// バトル結果を設定
				setBattleResult({
					winner: response.data.winner,
					mySteps: response.data.mySteps,
					opponentSteps: response.data.opponentSteps,
					opponent: {
						id: opponentId,
						name: '相手',
						level: 1,
						totalSteps: opponentSteps,
					},
				});

				// バトル済みリストに追加
				setBattledOpponents((prev) => new Set([...prev, opponentId]));

				// 相手をリストから削除（バトル済みのため）
				setOpponents((prev) => prev.filter((op) => op.id !== opponentId));
			} catch (error) {
				console.error('❌ バトル記録の作成に失敗:', error);
				if (error instanceof AxiosError) {
					console.error('❌ バトル記録APIエラー詳細:', {
						status: error.response?.status,
						data: error.response?.data,
						message: error.message,
					});
					if (error.response?.data?.alreadyBattled) {
						console.log('⚠️ 既にバトル済みの相手です');
						setBattledOpponents((prev) => new Set([...prev, opponentId]));
						setOpponents((prev) => prev.filter((op) => op.id !== opponentId));
					}
				}
			}
		},
		[user?.id]
	);

	useEffect(() => {
		if (initializedRef.current) return;
		initializedRef.current = true;

		const initializeNearbyConnections = async (nearby: any) => {
			console.log('🔧 expo-nearby-connections初期化開始');
			console.log('📦 利用可能な関数:', Object.keys(nearby));

			const {
				startDiscovery,
				stopDiscovery,
				startAdvertise,
				stopAdvertise,
				onPeerFound,
				onPeerLost,
				onInvitationReceived,
				onConnected,
				acceptConnection,
				Strategy,
			} = nearby;

			console.log('🔍 関数の存在確認:', {
				startDiscovery: !!startDiscovery,
				startAdvertise: !!startAdvertise,
				onPeerFound: !!onPeerFound,
				onInvitationReceived: !!onInvitationReceived,
				onConnected: !!onConnected,
				Strategy: !!Strategy,
			});

			if (!startDiscovery || !startAdvertise || !onPeerFound) {
				console.error('❌ 必要な関数が見つかりません');
				setError('NearbyConnections のネイティブが見つかりません。Devビルドが必要です。');
				return;
			}

			const seen = new Set<string>();

			const handlePeerFound = ({ peerId, name }: any) => {
				console.log('🎉 相手発見:', { peerId, name, at: new Date().toISOString() });
				if (name && name === myName) {
					console.log('🙅 自分自身のエンドポイントを無視:', { peerId, name });
					return;
				}
				if (seen.has(peerId)) return;
				seen.add(peerId);

				if (battledOpponents.has(peerId)) return;

				// discoverer のみ接続を開始
				if (isDiscoverer) {
					connectAndExchangeData(peerId, name);
				}

				setOpponents((prev) => [
					...prev,
					{
						id: peerId,
						name: name || '近くの冒険者',
						level: Math.floor(Math.random() * 30) + 1,
					},
				]);
			};

			const unsubFound = onPeerFound?.(handlePeerFound);
			const unsubLost = onPeerLost?.(({ peerId }: any) => {
				seen.delete(peerId);
				setOpponents((prev) => prev.filter((op) => op.id !== peerId));
			});

			const unsubInvitation = onInvitationReceived?.(({ peerId, name }: any) => {
				console.log('📨 接続リクエスト受信:', { peerId, name });
				// advertiser は自動的に accept
				if (isAdvertiser) {
					acceptConnection?.(peerId)
						.then(() => console.log('🤝 accept ok:', peerId))
						.catch((e: any) => console.error('accept失敗', e));
				}
			});

			const unsubConnected = onConnected?.(({ peerId, name }: any) => {
				console.log('🔌 接続済:', { peerId, name });
				startDataExchange(peerId);
			});

			setScanning(true);

			const strategy = Strategy?.P2P_STAR ?? 2;
			console.log('🚀 Bluetooth機能を開始:', {
				userName: myName,
				userId: user?.id,
				strategy,
				role: isDiscoverer ? 'discoverer' : 'advertiser',
			});

			try {
				if (isAdvertiser) {
					await startAdvertise(myName, strategy);
					console.log('✅ アドバタイズ開始成功:', { myName });
				}
			} catch (e: any) {
				console.error('❌ アドバタイズ開始失敗:', e);
				setError(String(e));
			}

			try {
				if (isDiscoverer) {
					await startDiscovery(myName, strategy);
					console.log('✅ ディスカバリー開始成功:', { myName });
					console.log('🔍 相手を探しています...');
				}
			} catch (e: any) {
				console.error('❌ ディスカバリー開始失敗:', e);
				setError(String(e));
			}

			return () => {
				unsubFound?.();
				unsubLost?.();
				unsubInvitation?.();
				unsubConnected?.();
				stopDiscovery?.().catch(() => {});
				stopAdvertise?.().catch(() => {});
				setScanning(false);
			};
		};

		(async () => {
			try {
				const mod = await import('expo-nearby-connections');
				const nearby: any = (mod as any).default ?? (mod as any);
				await initializeNearbyConnections(nearby);
			} catch (error) {
				console.error('expo-nearby-connectionsの読み込みに失敗:', error);
				setError(
					'NearbyConnections のネイティブが見つかりません。Devビルドで起動してください。'
				);
			}
		})();
	}, [
		myName,
		startDataExchange,
		connectAndExchangeData,
		createBattleRecord,
		user?.id,
		battledOpponents,
		isDiscoverer,
		isAdvertiser,
	]);

	// 相手のデータが受信されたら、opponentsを更新し、バトル記録を作成
	useEffect(() => {
		if (opponentData && myBattleData) {
			if (opponentData.userId === (user?.id || '')) {
				console.log('🙅 自分自身のデータを受信したため無視し除去:', opponentData);
				const peerId = opponentData.peerId;
				if (peerId) {
					setOpponents((prev) => prev.filter((op) => op.id !== peerId));
				}
				return;
			}

			setOpponents((prev) =>
				prev.map((opponent) =>
					opponentData.peerId && opponent.id === opponentData.peerId
						? {
								...opponent,
								name: opponentData.userName,
								level: opponentData.userLevel,
								totalSteps: opponentData.yesterdaySteps,
						  }
						: opponent
				)
			);

			console.log('🧮 バトル用歩数（自分/相手）:', {
				me: effectiveYesterdaySteps,
				opponent: opponentData.yesterdaySteps,
				serverMy: myBattleData.yesterdaySteps,
			});

			createBattleRecord(
				opponentData.userId,
				effectiveYesterdaySteps,
				opponentData.yesterdaySteps
			);
		}
	}, [opponentData, myBattleData, effectiveYesterdaySteps, createBattleRecord, user?.id]);

	return {
		opponents,
		scanning,
		error,
		opponentData,
		resetBattleData,
		battledOpponents: Array.from(battledOpponents),
		battleResult,
		setBattleResult,
	};
}
