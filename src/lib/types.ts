export type Member = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  name: string;
  members: Member[];
};

export type Round1Pick = {
  teamId: string;
  memberId: string | null;
};

export type LotteryResult = {
  memberId: string;
  competingTeamIds: string[];
  winnerId: string;
  loserIds: string[];
};

export type DraftMode = "simple" | "performance";

export type DraftPhase =
  | "idle"
  | "setup"
  | "round1-picking"
  | "round1-resolving"
  | "snake-draft"
  | "completed";

export type DraftLogEntry = {
  round: number;
  teamId: string;
  memberId: string;
  type: "round1" | "snake";
  order?: number;
};

export type DraftState = {
  phase: DraftPhase;
  mode: DraftMode;
  teams: Team[];
  memberPool: Member[];
  availableMembers: Member[];
  round1Picks: Round1Pick[];
  round1Results: LotteryResult[];
  /** チームIDの配列。1巡目の結果が悪い順 (=確定が遅い順) */
  snakeOrder: string[];
  currentSnakeRound: number;
  currentPickIndex: number;
  log: DraftLogEntry[];
  /** 1巡目で確定した順番 (teamId -> 確定ラウンド番号) */
  round1ConfirmationOrder: Map<string, number>;
};
