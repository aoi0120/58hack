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

interface StepsRecord {
    count: number;
    startTime: string;
    endTime: string;
}

interface CaloriesRecord {
    energy: {
        inKilocalories: number;
    };
    startTime: string;
    endTime: string;
}

interface DistanceRecord {
    distance: {
        inMeters: number;
    };
    startTime: string;
    endTime: string;
}

interface HealthConnectResponse<T> {
    records: T[];
}

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

const readYesterdayAndroidData = async () => {
    const status = await getSdkStatus();
    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        throw new Error('Health Connect が利用できません');
    }

    const permissions = [
        'androidx.health.connect.permission.ReadSteps' as unknown as Permission,
        'androidx.health.connect.permission.ReadActiveCaloriesBurned' as unknown as Permission,
        'androidx.health.connect.permission.ReadDistance' as unknown as Permission,
    ];
    const granted = await requestPermission(permissions);
    if (!granted) throw new Error('ヘルスデータの権限が未許可です');

    const { startTime, endTime } = getYesterdayRange();

    const stepsData = await readRecords('Steps', {
        timeRangeFilter: {
            operator: 'between',
            startTime,
            endTime,
        },
    }) as unknown as HealthConnectResponse<StepsRecord>;

    const caloriesData = await readRecords('ActiveCaloriesBurned', {
        timeRangeFilter: {
            operator: 'between',
            startTime,
            endTime,
        },
    }) as unknown as HealthConnectResponse<CaloriesRecord>;

    const distanceData = await readRecords('Distance', {
        timeRangeFilter: {
            operator: 'between',
            startTime,
            endTime,
        },
    }) as unknown as HealthConnectResponse<DistanceRecord>;

    const steps = Math.round(stepsData.records.reduce((sum: number, record: StepsRecord) => sum + record.count, 0));
    const calories = Math.round(caloriesData.records.reduce((sum: number, record: CaloriesRecord) => sum + record.energy.inKilocalories, 0));
    const distance = Math.round(distanceData.records.reduce((sum: number, record: DistanceRecord) => sum + record.distance.inMeters, 0));

    return { steps, calories, distance };
};

const readYesterdayIOSData = async () => {
    if ('requestPermissionsAsync' in Pedometer) {
        const { granted } = await (Pedometer as typeof Pedometer & { requestPermissionsAsync: () => Promise<PedometerPermissions> }).requestPermissionsAsync();
        if (!granted) throw new Error('モーションとフィットネスの権限が未許可です');
    }
    const { start, end } = getYesterdayRange();

    const available = await Pedometer.isAvailableAsync();
    if (!available) throw new Error('歩数計が利用できません');

    const result = await Pedometer.getStepCountAsync(start, end) as PedometerResult | null;
    const steps = result?.steps ?? 0;

    return {
        steps,
        calories: Math.round(steps * 0.04),
        distance: Math.round(steps * 0.7),
    };
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
        const status = await getSdkStatus();
        if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
            throw new Error('Health Connect が利用できません（アプリ未インストール/無効の可能性）');
        }

        const permissions = [
            'androidx.health.connect.permission.ReadSteps' as unknown as Permission,
            'androidx.health.connect.permission.ReadActiveCaloriesBurned' as unknown as Permission,
            'androidx.health.connect.permission.ReadDistance' as unknown as Permission,
        ];
        const granted = await requestPermission(permissions);
        if (!granted) throw new Error('ヘルスデータの権限が未許可です');

        const { startTime, endTime } = getTodayRange();

        const stepsData = await readRecords('Steps', {
            timeRangeFilter: {
                operator: 'between',
                startTime,
                endTime,
            },
        }) as unknown as HealthConnectResponse<StepsRecord>;

        const caloriesData = await readRecords('ActiveCaloriesBurned', {
            timeRangeFilter: {
                operator: 'between',
                startTime,
                endTime,
            },
        }) as unknown as HealthConnectResponse<CaloriesRecord>;

        const distanceData = await readRecords('Distance', {
            timeRangeFilter: {
                operator: 'between',
                startTime,
                endTime,
            },
        }) as unknown as HealthConnectResponse<DistanceRecord>;

        const steps = Math.round(stepsData.records.reduce((sum: number, record: StepsRecord) => sum + record.count, 0));
        const calories = Math.round(caloriesData.records.reduce((sum: number, record: CaloriesRecord) => sum + record.energy.inKilocalories, 0));
        const distance = Math.round(distanceData.records.reduce((sum: number, record: DistanceRecord) => sum + record.distance.inMeters, 0));

        return { steps, calories, distance };
    }, []);

    const readIOS = useCallback(async () => {
        if ('requestPermissionsAsync' in Pedometer) {
            const { granted } = await (Pedometer as typeof Pedometer & { requestPermissionsAsync: () => Promise<PedometerPermissions> }).requestPermissionsAsync();
            if (!granted) throw new Error('モーションとフィットネスの権限が未許可です（NSMotionUsageDescription が必要）');
        }
        const { start, end } = getTodayRange();

        const available = await Pedometer.isAvailableAsync();
        if (!available) throw new Error('歩数計が利用できません');

        const result = await Pedometer.getStepCountAsync(start, end) as PedometerResult | null;
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
        } catch (e: unknown) {
            console.error(e);
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
            const res = Platform.OS === 'android' ? await readYesterdayAndroidData() : await readYesterdayIOSData();
            setState({ ...res, loading: false, error: null });
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
