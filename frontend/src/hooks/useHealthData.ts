import { useState, useEffect, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import {
    getSdkStatus,
    SdkAvailabilityStatus,
    requestPermission,
    readRecords,
    Permission
} from 'react-native-health-connect';
import { Pedometer } from 'expo-sensors';

export interface HealthData {
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

export const useHealthData = () => {
    const [state, setState] = useState<HealthData>({
        steps: 0,
        calories: 0,
        distance: 0,
        loading: true,
        error: null,
    });

    const readAndroid = useCallback(async () => {
        // 1) Check availability
        const status = await getSdkStatus();
        if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
            throw new Error('Health Connect が利用できません（アプリ未インストール/無効の可能性）');
        }

        // 2) Request permissions
        const permissions = [
            'androidx.health.connect.permission.ReadSteps' as unknown as Permission,
            'androidx.health.connect.permission.ReadActiveCaloriesBurned' as unknown as Permission,
            'androidx.health.connect.permission.ReadDistance' as unknown as Permission,
        ];
        const granted = await requestPermission(permissions);
        if (!granted) throw new Error('ヘルスデータの権限が未許可です');

        // 3) Read records
        const { startTime, endTime } = getTodayRange();

        const stepsData = await readRecords('Steps', {
            timeRangeFilter: {
                operator: 'between',
                startTime,
                endTime,
            },
        });

        const caloriesData = await readRecords('ActiveCaloriesBurned', {
            timeRangeFilter: {
                operator: 'between',
                startTime,
                endTime,
            },
        });

        const distanceData = await readRecords('Distance', {
            timeRangeFilter: {
                operator: 'between',
                startTime,
                endTime,
            },
        });

        const steps = Math.round(stepsData.records.reduce((sum: number, record: any) => sum + record.count, 0));
        const calories = Math.round(caloriesData.records.reduce((sum: number, record: any) => sum + record.energy.kilocalories, 0));
        const distance = Math.round(distanceData.records.reduce((sum: number, record: any) => sum + record.distance.meters, 0));

        return { steps, calories, distance };
    }, []);

    const readIOS = useCallback(async () => {
        // iOSはモーション権限のみ（HealthKit未使用）
        if ((Pedometer as any).requestPermissionsAsync) {
            const { granted } = await (Pedometer as any).requestPermissionsAsync();
            if (!granted) throw new Error('モーションとフィットネスの権限が未許可です（NSMotionUsageDescription が必要）');
        }
        const { start, end } = getTodayRange();

        const available = await Pedometer.isAvailableAsync();
        if (!available) throw new Error('歩数計が利用できません');

        const result = await Pedometer.getStepCountAsync(start, end);
        const steps = result?.steps ?? 0;

        // 概算: 歩幅0.7m, 1歩0.04kcal
        return {
            steps,
            calories: Math.round(steps * 0.04),
            distance: Math.round(steps * 0.7),
        };
    }, []);

    const fetchHealthData = useCallback(async () => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            const res = Platform.OS === 'android' ? await readAndroid() : await readIOS();
            setState({ ...res, loading: false, error: null });
        } catch (e: any) {
            console.error(e);
            setState(s => ({ ...s, loading: false, error: e?.message ?? 'データの取得に失敗しました' }));
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
