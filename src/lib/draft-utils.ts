import type { Member, Round1Pick, LotteryResult } from "./types";

/** Fisher-Yates シャッフル */
export const shuffle = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * 1巡目の指名から競合を検出し、抽選で解決する
 * @returns 各競合メンバーについてのLotteryResult配列
 */
export const resolveRound1Conflicts = (
  picks: Round1Pick[]
): { results: LotteryResult[]; confirmedTeamIds: string[]; loserTeamIds: string[] } => {
  const memberToTeams = new Map<string, string[]>();

  for (const pick of picks) {
    if (!pick.memberId) continue;
    const teams = memberToTeams.get(pick.memberId) || [];
    teams.push(pick.teamId);
    memberToTeams.set(pick.memberId, teams);
  }

  const results: LotteryResult[] = [];
  const confirmedTeamIds: string[] = [];
  const loserTeamIds: string[] = [];

  for (const [memberId, teamIds] of memberToTeams.entries()) {
    if (teamIds.length === 1) {
      // 競合なし → そのまま確定
      confirmedTeamIds.push(teamIds[0]);
    } else {
      // 競合あり → 抽選
      const shuffled = shuffle(teamIds);
      const winnerId = shuffled[0];
      const losers = shuffled.slice(1);
      results.push({
        memberId,
        competingTeamIds: teamIds,
        winnerId,
        loserIds: losers,
      });
      confirmedTeamIds.push(winnerId);
      loserTeamIds.push(...losers);
    }
  }

  return { results, confirmedTeamIds, loserTeamIds };
};

/**
 * 1巡目の確定順に基づいてスネーク順を決定する
 * 確定が遅いチームほど先にピックできる
 * 同率はランダム
 */
export const calculateSnakeOrder = (
  confirmationOrder: Map<string, number>,
  teamIds: string[]
): string[] => {
  const sorted = [...teamIds].sort((a, b) => {
    const orderA = confirmationOrder.get(a) ?? 0;
    const orderB = confirmationOrder.get(b) ?? 0;
    if (orderB !== orderA) return orderB - orderA; // 遅い順 = 大きい順
    return Math.random() - 0.5; // 同率はランダム
  });
  return sorted;
};

/**
 * スネークドラフトの特定ラウンドでのピック順を返す
 * 偶数ラウンド(0-indexed): 正順、奇数ラウンド: 逆順
 */
export const getSnakeRoundOrder = (
  snakeOrder: string[],
  round: number
): string[] => {
  if (round % 2 === 0) {
    return [...snakeOrder];
  }
  return [...snakeOrder].reverse();
};

/**
 * スネークドラフトの総ラウンド数を計算
 * メンバープールから1巡目で取られた分を引いた残りを、チーム数で割る
 */
export const calculateTotalSnakeRounds = (
  remainingMembers: number,
  teamCount: number
): number => {
  return Math.ceil(remainingMembers / teamCount);
};

/**
 * 残りメンバーからIDで検索
 */
export const findMemberById = (
  members: Member[],
  id: string
): Member | undefined => {
  return members.find((m) => m.id === id);
};

/**
 * ユニークIDを生成
 */
export const generateId = (): string => {
  return crypto.randomUUID();
};
