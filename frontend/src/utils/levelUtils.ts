/**
 * レベル計算ユーティリティ
 * レベル1: 0-999歩
 * レベル2: 1000-2999歩 (1000歩必要)
 * レベル3: 3000-6999歩 (2000歩必要)
 * レベル4: 7000-14999歩 (4000歩必要)
 * レベル5: 15000-30999歩 (8000歩必要)
 * レベルn: 前レベル + (1000 * 2^(n-2))歩
 */

export interface LevelInfo {
	level: number;
	currentSteps: number;
	stepsForCurrentLevel: number;
	stepsForNextLevel: number;
	progressPercentage: number;
	stepsRemaining: number;
}

/**
 * 指定された歩数から現在のレベル情報を計算
 */
export function calculateLevel(totalSteps: number): LevelInfo {
	let level = 1;
	let stepsForCurrentLevel = 0;
	let stepsForNextLevel = 1000; // レベル2に必要な歩数

	// レベルを計算
	while (totalSteps >= stepsForNextLevel) {
		stepsForCurrentLevel = stepsForNextLevel;
		level++;
		stepsForNextLevel = stepsForCurrentLevel + 1000 * Math.pow(2, level - 2);
	}

	// 現在のレベルでの進捗を計算
	const currentLevelStartSteps = stepsForCurrentLevel;
	const currentLevelRequiredSteps = stepsForNextLevel - currentLevelStartSteps;
	const currentLevelProgress = totalSteps - currentLevelStartSteps;
	const progressPercentage = Math.min(
		(currentLevelProgress / currentLevelRequiredSteps) * 100,
		100
	);
	const stepsRemaining = Math.max(stepsForNextLevel - totalSteps, 0);

	return {
		level,
		currentSteps: totalSteps,
		stepsForCurrentLevel: currentLevelStartSteps,
		stepsForNextLevel,
		progressPercentage,
		stepsRemaining,
	};
}

/**
 * レベルアップのアニメーション用データ
 */
export function getLevelUpInfo(currentLevel: number, newLevel: number) {
	const levelDiff = newLevel - currentLevel;
	const rewards = [];

	for (let i = 1; i <= levelDiff; i++) {
		const level = currentLevel + i;
		const requiredSteps = 1000 * Math.pow(2, level - 2);
		rewards.push({
			level,
			requiredSteps,
			message: `レベル${level}に到達！`,
		});
	}

	return {
		levelDiff,
		rewards,
		totalRewardSteps: rewards.reduce((sum, reward) => sum + reward.requiredSteps, 0),
	};
}
