import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { calculateLevel } from "@/src/utils/levelUtils";
import { AxiosError } from "axios";

export type TotalStepContextType = {
    totalStep: number;
    setTotalStep: (totalStep: number) => void;
    levelInfo: ReturnType<typeof calculateLevel>;
    showLevelUp: boolean;
    setShowLevelUp: (show: boolean) => void;
    userLevel: number;
    setUserLevel: (level: number) => void;
    checkLevelUp: () => Promise<void>;
    forceLevelUp: () => Promise<void>;
}

export const TotalStepContext = createContext<TotalStepContextType | null>(null);

export const TotalStepProvider = ({ children }: { children: ReactNode }) => {
    const [totalStep, setTotalStep] = useState<number>(0);
    const [userLevel, setUserLevel] = useState<number>(1);
    const [showLevelUp, setShowLevelUp] = useState<boolean>(false);

    const levelInfo = calculateLevel(totalStep);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('歩数データを取得中...');
                const [stepsResponse, levelResponse] = await Promise.all([
                    api.get('/steps/total_steps'),
                    api.get('/steps/user_level')
                ]);

                console.log('歩数APIレスポンス:', stepsResponse.data);
                console.log('レベルAPIレスポンス:', levelResponse.data);

                const totalStep = stepsResponse.data.totalSteps || 0;
                const userLevel = levelResponse.data.level || 1;

                console.log('取得した歩数:', totalStep);
                console.log('取得したレベル:', userLevel);

                setTotalStep(totalStep);
                setUserLevel(userLevel);
            } catch (error) {
                console.error('データの取得に失敗:', error);
                if (error instanceof AxiosError) {
                    console.error('レスポンスエラー:', error.response?.data);
                    console.error('ステータス:', error.response?.status);
                }
            }
        }
        fetchData();
    }, []);

    // レベルアップのチェック関数
    const checkLevelUp = async () => {
        const calculatedLevel = levelInfo.level;

        console.log('レベルチェック:', {
            calculatedLevel,
            userLevel,
            totalStep,
            shouldLevelUp: calculatedLevel > userLevel
        });

        if (calculatedLevel > userLevel) {
            try {
                console.log(`レベルアップ開始: ${userLevel} → ${calculatedLevel}`);

                // データベースのレベルを更新
                const response = await api.post('/steps/update_level', { newLevel: calculatedLevel });
                console.log('レベル更新レスポンス:', response.data);

                setUserLevel(calculatedLevel);
                setShowLevelUp(true);
                console.log(`レベルアップ完了: ${userLevel} → ${calculatedLevel}`);
            } catch (error) {
                console.error('レベル更新に失敗:', error);
                if (error instanceof AxiosError) {
                    console.error('レスポンスエラー:', error.response?.data);
                    console.error('ステータス:', error.response?.status);
                }
            }
        }
    };

    // 強制的にレベルアップをテストする関数
    const forceLevelUp = async () => {
        const calculatedLevel = levelInfo.level;
        try {
            console.log('強制レベルアップ開始:', calculatedLevel);
            const response = await api.post('/steps/update_level', { newLevel: calculatedLevel });
            console.log('強制レベルアップレスポンス:', response.data);
            setUserLevel(calculatedLevel);
            setShowLevelUp(true);
        } catch (error) {
            console.error('強制レベルアップに失敗:', error);
        }
    };

    return (
        <TotalStepContext.Provider value={{
            totalStep,
            setTotalStep,
            levelInfo,
            showLevelUp,
            setShowLevelUp,
            userLevel,
            setUserLevel,
            checkLevelUp,
            forceLevelUp
        }}>
            {children}
        </TotalStepContext.Provider>
    )
}

export const useTotalStep = () => {
    const context = useContext(TotalStepContext);
    if (!context) {
        throw new Error('TotalStepContext not found');
    }
    return context;
}
