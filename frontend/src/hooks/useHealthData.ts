import { useState, useEffect, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import {
    getSdkStatus,
    SdkAvailabilityStatus,
    requestPermission,
    readRecords,
    aggregateRecord,
    Permission
} from 'react-native-health-connect';
import { Pedometer } from 'expo-sensors';
import AppleHealthKit, { HealthValue, HealthKitPermissions } from 'react-native-health';

// Health Connect 集計APIの型定義は削除（実際のAPIレスポンスに合わせてany型を使用）

// HealthKit の型定義
interface HealthKitData {
    steps: number;
    activeCaloriesBurned: number;
    distance: number;
}

// Pedometer の型定義
interface PedometerResult {
    steps: number;
}

interface PedometerPermissions {
    granted: boolean;
}

export interface HealthData {
    steps: number;
    calories: number;
    distance: number;
    loading: boolean;
    error: string | null;
}

export interface YesterdayHealthData {
    steps: number;
    calories: number;
    distance: number;
    loading: boolean;
    error: string | null;
}

const getTodayRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { startTime: start.toISOString(), endTime: end.toISOString(), start, end };
};

const getYesterdayRange = () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    const end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
    return { startTime: start.toISOString(), endTime: end.toISOString(), start, end };
};

const readAndroidData = async (isYesterday = false) => {
    console.log('Android Health Connect データ取得開始...');
    const status = await getSdkStatus();
    console.log('Health Connect SDK ステータス:', status);
    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        throw new Error('Health Connect が利用できません');
    }

    const permissions = [
        'androidx.health.connect.permission.ReadSteps' as unknown as Permission,
        'androidx.health.connect.permission.ReadActiveCaloriesBurned' as unknown as Permission,
        'androidx.health.connect.permission.ReadDistance' as unknown as Permission,
    ];
    console.log('権限リクエスト中...');
    const granted = await requestPermission(permissions);
    console.log('権限許可結果:', granted);
    if (!granted) throw new Error('ヘルスデータの権限が未許可です');

    const { startTime, endTime } = isYesterday ? getYesterdayRange() : getTodayRange();

    try {
        console.log('集計API使用中...', { startTime, endTime });
        // 集計APIを優先使用（個別に集計）
        const stepsAggregate = await aggregateRecord({
            recordType: 'Steps',
            timeRangeFilter: {
                operator: 'between',
                startTime,
                endTime,
            },
        });
        console.log('歩数集計結果:', stepsAggregate);

        const caloriesAggregate = await aggregateRecord({
            recordType: 'ActiveCaloriesBurned',
            timeRangeFilter: {
                operator: 'between',
                startTime,
                endTime,
            },
        });
        console.log('カロリー集計結果:', caloriesAggregate);

        const distanceAggregate = await aggregateRecord({
            recordType: 'Distance',
            timeRangeFilter: {
                operator: 'between',
                startTime,
                endTime,
            },
        });
        console.log('距離集計結果:', distanceAggregate);

        const result = {
            steps: Math.round((stepsAggregate as any).total || 0),
            calories: Math.round((caloriesAggregate as any).total?.inKilocalories || 0),
            distance: Math.round((distanceAggregate as any).total?.inMeters || 0),
        };
        console.log('集計API結果:', result);
        return result;
    } catch (error) {
        console.warn('集計APIが失敗、個別レコード読み取りにフォールバック:', error);

        // フォールバック: 個別レコード読み取り
        console.log('個別レコード読み取り開始...');
        const stepsData = await readRecords('Steps', {
            timeRangeFilter: {
                operator: 'between',
                startTime,
                endTime,
            },
        });
        console.log('歩数レコード:', stepsData);

        const caloriesData = await readRecords('ActiveCaloriesBurned', {
            timeRangeFilter: {
                operator: 'between',
                startTime,
                endTime,
            },
        });
        console.log('カロリーレコード:', caloriesData);

        const distanceData = await readRecords('Distance', {
            timeRangeFilter: {
                operator: 'between',
                startTime,
                endTime,
            },
        });
        console.log('距離レコード:', distanceData);

        const steps = Math.round(stepsData.records.reduce((sum: number, record: any) => sum + (record.count || 0), 0));
        const calories = Math.round(caloriesData.records.reduce((sum: number, record: any) => sum + (record.energy?.inKilocalories || 0), 0));
        const distance = Math.round(distanceData.records.reduce((sum: number, record: any) => sum + (record.distance?.inMeters || 0), 0));

        const result = { steps, calories, distance };
        console.log('個別レコード結果:', result);
        return result;
    }
};

const readIOSData = async (isYesterday = false) => {
    console.log('iOS HealthKit データ取得開始...');
    const { start, end } = isYesterday ? getYesterdayRange() : getTodayRange();
    console.log('時間範囲:', { start: start.toISOString(), end: end.toISOString() });

    try {
        // HealthKitを優先使用
        console.log('HealthKit初期化中...');
        const permissions: HealthKitPermissions = {
            permissions: {
                read: [
                    AppleHealthKit.Constants.Permissions.Steps,
                    AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
                    AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
                ],
                write: [],
            },
        };

        return new Promise<HealthKitData>((resolve, reject) => {
            AppleHealthKit.initHealthKit(permissions, (error: string) => {
                if (error) {
                    console.warn('HealthKit初期化失敗、Pedometerにフォールバック:', error);
                    readIOSDataWithPedometer(start, end).then(resolve).catch(reject);
                    return;
                }

                // HealthKitからデータ取得
                const options = {
                    startDate: start.toISOString(),
                    endDate: end.toISOString(),
                };

                AppleHealthKit.getStepCount(options, (err: string, results: HealthValue) => {
                    if (err) {
                        console.warn('HealthKit歩数取得失敗、Pedometerにフォールバック:', err);
                        readIOSDataWithPedometer(start, end).then(resolve).catch(reject);
                        return;
                    }

                    const steps = results.value || 0;
                    console.log('HealthKit歩数取得成功:', steps);

                    // カロリーと距離を取得
                    AppleHealthKit.getActiveEnergyBurned(options, (err2: string, results2: HealthValue[]) => {
                        const calories = results2?.[0]?.value || Math.round(steps * 0.04);
                        console.log('HealthKitカロリー取得:', calories);

                        AppleHealthKit.getDistanceWalkingRunning(options, (err3: string, results3: HealthValue) => {
                            const distance = results3?.value ? Math.round(results3.value * 1000) : Math.round(steps * 0.7);
                            console.log('HealthKit距離取得:', distance);

                            const result = {
                                steps,
                                activeCaloriesBurned: calories,
                                distance,
                            };
                            console.log('HealthKit結果:', result);
                            resolve(result);
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.warn('HealthKit使用失敗、Pedometerにフォールバック:', error);
        return readIOSDataWithPedometer(start, end);
    }
};

const readIOSDataWithPedometer = async (start: Date, end: Date) => {
    console.log('Pedometerフォールバック開始...');
    if ('requestPermissionsAsync' in Pedometer) {
        console.log('Pedometer権限リクエスト中...');
        const { granted } = await (Pedometer as typeof Pedometer & { requestPermissionsAsync: () => Promise<PedometerPermissions> }).requestPermissionsAsync();
        console.log('Pedometer権限結果:', granted);
        if (!granted) throw new Error('モーションとフィットネスの権限が未許可です');
    }

    const available = await Pedometer.isAvailableAsync();
    console.log('Pedometer利用可能性:', available);
    if (!available) throw new Error('歩数計が利用できません');

    const result = await Pedometer.getStepCountAsync(start, end) as PedometerResult | null;
    const steps = result?.steps ?? 0;
    console.log('Pedometer歩数結果:', steps);

    const pedometerResult = {
        steps,
        activeCaloriesBurned: Math.round(steps * 0.04),
        distance: Math.round(steps * 0.7),
    };
    console.log('Pedometer結果:', pedometerResult);
    return pedometerResult;
};

export const useHealthData = () => {
    const [state, setState] = useState<HealthData>({
        steps: 0,
        calories: 0,
        distance: 0,
        loading: true,
        error: null,
    });

    const readAndroid = useCallback(async () => {
        const data = await readAndroidData(false);
        return {
            steps: data.steps,
            calories: data.calories,
            distance: data.distance,
        };
    }, []);

    const readIOS = useCallback(async () => {
        const data = await readIOSData(false);
        return {
            steps: data.steps,
            calories: data.activeCaloriesBurned,
            distance: data.distance,
        };
    }, []);

    const fetchHealthData = useCallback(async () => {
        try {
            console.log('ヘルスデータ取得開始...', Platform.OS);
            setState(s => ({ ...s, loading: true, error: null }));
            const res = Platform.OS === 'android' ? await readAndroid() : await readIOS();
            console.log('ヘルスデータ取得成功:', res);
            setState({ ...res, loading: false, error: null });
        } catch (e: unknown) {
            console.error('ヘルスデータ取得エラー:', e);
            const errorMessage = e instanceof Error ? e.message : 'データの取得に失敗しました';
            setState(s => ({ ...s, loading: false, error: errorMessage }));
        }
    }, [readAndroid, readIOS]);

    useEffect(() => {
        fetchHealthData();
        const sub = AppState.addEventListener('change', st => {
            if (st === 'active') fetchHealthData();
        });
        return () => sub.remove();
    }, [fetchHealthData]);

    return { ...state, refetch: fetchHealthData };
};

export const useYesterdayHealthData = () => {
    const [state, setState] = useState<YesterdayHealthData>({
        steps: 0,
        calories: 0,
        distance: 0,
        loading: true,
        error: null,
    });

    const fetchYesterdayData = useCallback(async () => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            const res = Platform.OS === 'android' ? await readAndroidData(true) : await readIOSData(true);
            setState({
                steps: res.steps,
                calories: 'activeCaloriesBurned' in res ? res.activeCaloriesBurned : res.calories,
                distance: res.distance,
                loading: false,
                error: null
            });
        } catch (e: unknown) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'データの取得に失敗しました';
            setState(s => ({ ...s, loading: false, error: errorMessage }));
        }
    }, []);

    useEffect(() => {
        fetchYesterdayData();
    }, [fetchYesterdayData]);

    return { ...state, refetch: fetchYesterdayData };
};
