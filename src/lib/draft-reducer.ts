import type {
  DraftState,
  DraftMode,
  Member,
  Team,
  Round1Pick,
  LotteryResult,
  DraftLogEntry,
} from "./types";
import {
  resolveRound1Conflicts,
  calculateSnakeOrder,
  getSnakeRoundOrder,
  findMemberById,
  generateId,
} from "./draft-utils";

export type DraftAction =
  | {
      type: "INIT_DRAFT";
      payload: { teamNames: string[]; memberNames: string[]; mode?: DraftMode };
    }
  | {
      type: "SET_ROUND1_PICK";
      payload: { teamId: string; memberId: string };
    }
  | { type: "RESOLVE_ROUND1" }
  | {
      type: "COMPLETE_ROUND1";
      payload: {
        results: LotteryResult[];
        confirmedTeamIds: string[];
        loserTeamIds: string[];
      };
    }
  | { type: "SNAKE_PICK"; payload: { teamId: string; memberId: string } }
  | { type: "COMPLETE_DRAFT" }
  | { type: "RESET" };

export const initialDraftState: DraftState = {
  phase: "idle",
  mode: "simple",
  teams: [],
  memberPool: [],
  availableMembers: [],
  round1Picks: [],
  round1Results: [],
  snakeOrder: [],
  currentSnakeRound: 0,
  currentPickIndex: 0,
  log: [],
  round1ConfirmationOrder: new Map(),
};

export const draftReducer = (
  state: DraftState,
  action: DraftAction
): DraftState => {
  switch (action.type) {
    case "INIT_DRAFT": {
      const { teamNames, memberNames, mode } = action.payload;
      const teams: Team[] = teamNames.map((name) => ({
        id: generateId(),
        name,
        members: [],
      }));
      const memberPool: Member[] = memberNames.map((name) => ({
        id: generateId(),
        name,
      }));
      return {
        ...initialDraftState,
        phase: "round1-picking",
        mode: mode ?? "simple",
        teams,
        memberPool,
        availableMembers: [...memberPool],
        round1Picks: teams.map((t) => ({ teamId: t.id, memberId: null })),
        round1ConfirmationOrder: new Map(),
      };
    }

    case "SET_ROUND1_PICK": {
      const { teamId, memberId } = action.payload;
      return {
        ...state,
        round1Picks: state.round1Picks.map((p) =>
          p.teamId === teamId ? { ...p, memberId } : p
        ),
      };
    }

    case "RESOLVE_ROUND1": {
      const activePicks = state.round1Picks.filter((p) => p.memberId !== null);
      const { results, confirmedTeamIds, loserTeamIds } =
        resolveRound1Conflicts(activePicks);

      // 確定順を更新
      const newConfirmationOrder = new Map(state.round1ConfirmationOrder);
      const currentRound =
        newConfirmationOrder.size === 0
          ? 1
          : Math.max(...newConfirmationOrder.values()) + 1;

      for (const teamId of confirmedTeamIds) {
        if (!newConfirmationOrder.has(teamId)) {
          newConfirmationOrder.set(teamId, currentRound);
        }
      }

      // 確定したチームにメンバーを追加
      const newTeams = state.teams.map((team) => {
        // 競合なしで確定
        const pick = activePicks.find((p) => p.teamId === team.id);
        if (!pick || !pick.memberId) return team;

        const isConfirmed = confirmedTeamIds.includes(team.id);
        if (!isConfirmed) return team;

        // 競合で勝った場合、resultsからメンバーIDを取得
        const result = results.find((r) => r.winnerId === team.id);
        const memberId = result ? result.memberId : pick.memberId;
        const member = findMemberById(state.availableMembers, memberId);
        if (!member) return team;

        return { ...team, members: [...team.members, member] };
      });

      // 確定したメンバーを利用可能リストから除外
      const confirmedMemberIds = new Set<string>();
      for (const team of newTeams) {
        for (const m of team.members) {
          confirmedMemberIds.add(m.id);
        }
      }
      const newAvailable = state.availableMembers.filter(
        (m) => !confirmedMemberIds.has(m.id)
      );

      // ログ追加
      const newLog: DraftLogEntry[] = [...state.log];
      for (const team of newTeams) {
        const oldTeam = state.teams.find((t) => t.id === team.id);
        if (
          oldTeam &&
          team.members.length > oldTeam.members.length
        ) {
          const newMember = team.members[team.members.length - 1];
          newLog.push({
            round: 1,
            teamId: team.id,
            memberId: newMember.id,
            type: "round1",
          });
        }
      }

      const allTeamsConfirmed = loserTeamIds.length === 0;

      if (allTeamsConfirmed) {
        // 全チーム確定 → スネーク順計算
        const snakeOrder = calculateSnakeOrder(
          newConfirmationOrder,
          state.teams.map((t) => t.id)
        );

        // 残りメンバーがなければ完了
        if (newAvailable.length === 0) {
          return {
            ...state,
            phase: "completed",
            teams: newTeams,
            availableMembers: newAvailable,
            round1Picks: [],
            round1Results: results,
            snakeOrder,
            log: newLog,
            round1ConfirmationOrder: newConfirmationOrder,
          };
        }

        return {
          ...state,
          phase: "snake-draft",
          teams: newTeams,
          availableMembers: newAvailable,
          round1Picks: [],
          round1Results: results,
          snakeOrder,
          currentSnakeRound: 0,
          currentPickIndex: 0,
          log: newLog,
          round1ConfirmationOrder: newConfirmationOrder,
        };
      }

      // まだ外れたチームがある → 再指名
      return {
        ...state,
        phase: "round1-picking",
        teams: newTeams,
        availableMembers: newAvailable,
        round1Picks: loserTeamIds.map((teamId) => ({
          teamId,
          memberId: null,
        })),
        round1Results: [...state.round1Results, ...results],
        log: newLog,
        round1ConfirmationOrder: newConfirmationOrder,
      };
    }

    case "SNAKE_PICK": {
      const { teamId, memberId } = action.payload;
      const member = findMemberById(state.availableMembers, memberId);
      if (!member) return state;

      const newTeams = state.teams.map((t) =>
        t.id === teamId ? { ...t, members: [...t.members, member] } : t
      );
      const newAvailable = state.availableMembers.filter(
        (m) => m.id !== memberId
      );

      const currentOrder = getSnakeRoundOrder(
        state.snakeOrder,
        state.currentSnakeRound
      );
      const newLog: DraftLogEntry[] = [
        ...state.log,
        {
          round: state.currentSnakeRound + 2, // +2 because round1 is round 1
          teamId,
          memberId,
          type: "snake",
          order: state.currentPickIndex,
        },
      ];

      let nextPickIndex = state.currentPickIndex + 1;
      let nextSnakeRound = state.currentSnakeRound;

      // 次のピックを探す（メンバーが足りない場合スキップ）
      if (nextPickIndex >= currentOrder.length) {
        nextSnakeRound++;
        nextPickIndex = 0;
      }

      // メンバーが残っていなければ完了
      if (newAvailable.length === 0) {
        return {
          ...state,
          phase: "completed",
          teams: newTeams,
          availableMembers: newAvailable,
          currentSnakeRound: nextSnakeRound,
          currentPickIndex: nextPickIndex,
          log: newLog,
        };
      }

      return {
        ...state,
        teams: newTeams,
        availableMembers: newAvailable,
        currentSnakeRound: nextSnakeRound,
        currentPickIndex: nextPickIndex,
        log: newLog,
      };
    }

    case "COMPLETE_DRAFT":
      return { ...state, phase: "completed" };

    case "RESET":
      return initialDraftState;

    default:
      return state;
  }
};
