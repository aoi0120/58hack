import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { api } from '@/lib/api';
import { calculateLevel } from '@/src/utils/levelUtils';
import { AxiosError } from 'axios';

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
};

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
          api.get('/steps/user_level'),
        ]);

        const fetchedTotalStep = stepsResponse.data.totalSteps || 0;
        const fetchedUserLevel = levelResponse.data.level || 1;

        console.log('取得した歩数:', fetchedTotalStep);
        console.log('取得したレベル:', fetchedUserLevel);

        setTotalStep(fetchedTotalStep);
        setUserLevel(fetchedUserLevel);
      } catch (error) {
        console.error('データの取得に失敗:', error);
        if (error instanceof AxiosError) {
          console.error('レスポンスエラー:', error.response?.data);
          console.error('ステータス:', error.response?.status);
        }
      }
    };

    fetchData();
  }, []);

  // レベルアップのチェック関数（外部から使えるように useCallback で安定化）
  const checkLevelUp = useCallback(async () => {
    const calculatedLevel = levelInfo.level;

    console.log('レベルチェック:', {
      calculatedLevel,
      userLevel,
      totalStep,
      shouldLevelUp: calculatedLevel > userLevel,
    });

    if (calculatedLevel > userLevel) {
      try {
        console.log(`レベルアップ開始: ${userLevel} → ${calculatedLevel}`);
        const response = await api.post('/steps/update_level', {
          newLevel: calculatedLevel,
        });
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
  }, [levelInfo.level, userLevel, totalStep]);

  // 強制的にレベルアップをテストする関数（useCallbackで安定化）
  const forceLevelUp = useCallback(async () => {
    const calculatedLevel = levelInfo.level;

    console.log('=== 強制レベルアップ開始 ===');
    console.log('現在の状態:', {
      totalStep,
      userLevel,
      calculatedLevel,
      levelInfo,
    });

    try {
      const response = await api.post('/steps/update_level', {
        newLevel: calculatedLevel,
      });
      console.log('強制レベルアップレスポンス:', response.data);

      setUserLevel(calculatedLevel);
      setShowLevelUp(true);
      console.log('レベルアップアニメーション表示設定完了');
    } catch (error) {
      console.error('強制レベルアップに失敗:', error);
      if (error instanceof AxiosError) {
        console.error('レスポンスエラー:', error.response?.data);
        console.error('ステータス:', error.response?.status);
      }
    }
  }, [levelInfo.level]);

  const value = useMemo(
    () => ({
      totalStep,
      setTotalStep,
      levelInfo,
      showLevelUp,
      setShowLevelUp,
      userLevel,
      setUserLevel,
      checkLevelUp,
      forceLevelUp,
    }),
    [
      totalStep,
      levelInfo,
      showLevelUp,
      userLevel,
      checkLevelUp,
      forceLevelUp,
    ]
  );

  return (
    <TotalStepContext.Provider value={value}>
      {children}
    </TotalStepContext.Provider>
  );
};

export const useTotalStep = () => {
  const context = useContext(TotalStepContext);
  if (!context) {
    throw new Error('TotalStepContext not found');
  }
  return context;
};
