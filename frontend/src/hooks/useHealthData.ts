import { useState, useEffect, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import { Pedometer } from 'expo-sensors';
import {
    requestAuthorization,
    queryQuantitySamples,
    QuantityTypeIdentifier
} from '@kingstinct/react-native-healthkit';

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
    return { start, end };
};

const getYesterdayRange = () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    const end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
    return { start, end };
};

const readAndroidData = async (isYesterday = false) => {
    console.log('Android Pedometer データ取得開始...');

    const { start, end } = isYesterday ? getYesterdayRange() : getTodayRange();
    console.log('時間範囲:', { start: start.toISOString(), end: end.toISOString() });

    // AndroidではPedometerを使用
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
        calories: Math.round(steps * 0.04),
        distance: Math.round(steps * 0.7),
    };
    console.log('Pedometer結果:', pedometerResult);
    return pedometerResult;
};

const readIOSData = async (isYesterday = false) => {
    console.log('iOS HealthKit データ取得開始...');
    const { start, end } = isYesterday ? getYesterdayRange() : getTodayRange();
    console.log('時間範囲:', { start: start.toISOString(), end: end.toISOString() });

    try {
        // HealthKitの権限をリクエスト
        console.log('HealthKit権限リクエスト中...');
        const readTypes: QuantityTypeIdentifier[] = [
            'HKQuantityTypeIdentifierStepCount',
            'HKQuantityTypeIdentifierActiveEnergyBurned',
            'HKQuantityTypeIdentifierDistanceWalkingRunning'
        ];

        const authResult = await requestAuthorization([], readTypes);
        console.log('HealthKit認証結果:', authResult);

        if (!authResult) {
            throw new Error('HealthKitの認証に失敗しました');
        }

        // 歩数データを取得
        const stepsData = await queryQuantitySamples('HKQuantityTypeIdentifierStepCount', {
            filter: {
                startDate: start,
                endDate: end,
            },
        });
        const steps = stepsData.reduce((sum, sample) => sum + sample.quantity, 0);
        console.log('HealthKit歩数取得成功:', steps);

        // カロリーデータを取得
        const caloriesData = await queryQuantitySamples('HKQuantityTypeIdentifierActiveEnergyBurned', {
            filter: {
                startDate: start,
                endDate: end,
            },
        });
        const calories = Math.round(caloriesData.reduce((sum, sample) => sum + sample.quantity, 0));
        console.log('HealthKitカロリー取得:', calories);

        // 距離データを取得
        const distanceData = await queryQuantitySamples('HKQuantityTypeIdentifierDistanceWalkingRunning', {
            filter: {
                startDate: start,
                endDate: end,
            },
        });
        const distance = Math.round(distanceData.reduce((sum, sample) => sum + sample.quantity, 0) * 1000);
        console.log('HealthKit距離取得:', distance);

        const result = {
            steps,
            calories,
            distance,
        };
        console.log('HealthKit結果:', result);
        return result;
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
        calories: Math.round(steps * 0.04),
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
        if (Platform.OS !== 'ios') {
            throw new Error('iOS以外では使用できません');
        }

        const data = await readIOSData(false);
        return {
            steps: data.steps,
            calories: data.calories,
            distance: data.distance,
        };
    }, []);

    const fetchHealthData = useCallback(async () => {
        try {
            console.log('ヘルスデータ取得開始...', Platform.OS);
            setState(s => ({ ...s, loading: true, error: null }));
            const res = Platform.OS === 'android' ? await readAndroid() : await readIOS();
            console.log('ヘルスデータ取得成功:', res);
            setState({
                steps: res.steps,
                calories: res.calories,
                distance: res.distance,
                loading: false,
                error: null
            });
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
                calories: res.calories,
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