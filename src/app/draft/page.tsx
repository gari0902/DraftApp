"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StepIndicator } from "@/components/shared/step-indicator";
import { MemberBadge } from "@/components/shared/member-badge";
import { useDraft } from "@/lib/draft-context";
import { getSnakeRoundOrder } from "@/lib/draft-utils";
import { motion, AnimatePresence } from "framer-motion";
import type { Team, Member, DraftLogEntry } from "@/lib/types";

// ====== 演出あり：指名発表オーバーレイ（ダーク版）======
const DraftPickAnnouncement = ({
  teamName,
  memberName,
  round,
  pickIndex,
  totalPicks,
  onEnd,
}: {
  teamName: string;
  memberName: string;
  round: number;
  pickIndex: number;
  totalPicks: number;
  onEnd: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
    style={{
      background: "linear-gradient(160deg, #050d1a 0%, #0d1b36 45%, #050d1a 100%)",
    }}
  >
    {/* スポットライト */}
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        animate={{ opacity: [0.08, 0.2, 0.08], scale: [1, 1.12, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(250,204,21,0.22) 0%, rgba(250,204,21,0.04) 45%, transparent 70%)",
        }}
      />
    </div>

    {/* ラウンド＆進捗 */}
    <div className="absolute top-8 inset-x-0 text-center space-y-1.5">
      <p className="text-yellow-400/65 text-xs font-bold tracking-[0.45em] uppercase">
        第{round}巡目　指名
      </p>
      <div className="flex justify-center gap-1.5">
        {Array.from({ length: totalPicks }, (_, i) => (
          <motion.div
            key={i}
            animate={{
              backgroundColor:
                i < pickIndex
                  ? "rgba(250,204,21,0.85)"
                  : i === pickIndex
                  ? "rgba(255,255,255,0.85)"
                  : "rgba(255,255,255,0.18)",
              scale: i === pickIndex ? 1.3 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="w-1.5 h-1.5 rounded-full"
          />
        ))}
      </div>
    </div>

    {/* コンテンツ */}
    <div className="relative z-10 flex flex-col items-center gap-6 text-center px-8">
      {/* チーム名 */}
      <motion.p
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/55 text-xl font-semibold tracking-widest"
      >
        {teamName}
      </motion.p>

      {/* セパレーター */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.45 }}
        className="w-44 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(250,204,21,0.55), transparent)",
        }}
      />

      {/* 選手名 */}
      <div className="relative">
        {/* 発光フラッシュ */}
        <motion.div
          initial={{ opacity: 0.7, scale: 0.3 }}
          animate={{ opacity: 0, scale: 3.5 }}
          transition={{ delay: 0.44, duration: 1.3, ease: "easeOut" }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(250,204,21,0.28) 0%, transparent 70%)",
          }}
        />
        <motion.p
          initial={{ opacity: 0, scale: 0.18, y: 22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: 0.45,
            type: "spring",
            stiffness: 290,
            damping: 18,
            mass: 0.8,
          }}
          className="relative z-10 text-yellow-400 font-black leading-none tracking-tight"
          style={{ fontSize: "clamp(3.5rem, 12vw, 7rem)" }}
        >
          {memberName}
        </motion.p>
      </div>

      {/* "を指名しました" */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95 }}
        className="text-white/45 text-base tracking-[0.25em]"
      >
        を指名しました
      </motion.p>

      {/* 次へボタン */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.35 }}
      >
        <button
          onClick={onEnd}
          className="mt-1 px-10 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "rgba(255,255,255,0.6)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "rgba(255,255,255,0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "rgba(255,255,255,0.6)";
          }}
        >
          次へ
        </button>
      </motion.div>
    </div>
  </motion.div>
);

// ====== 演出あり：メイン指名スクリーン ======
const PerformanceDraftScreen = ({
  round,
  totalRounds,
  pickIndex,
  currentOrder,
  currentTeam,
  teams,
  availableMembers,
  log,
  memberPool,
  getTeamName,
  onPick,
}: {
  round: number;
  totalRounds: number;
  pickIndex: number;
  currentOrder: string[];
  currentTeam: Team | undefined;
  teams: Team[];
  availableMembers: Member[];
  log: DraftLogEntry[];
  memberPool: Member[];
  getTeamName: (id: string) => string;
  onPick: (memberId: string) => void;
}) => {
  const displayedRounds = Array.from({ length: round }, (_, i) => i + 1);
  const getPickedMember = (teamId: string, r: number): string | null => {
    const entry = log.find((e) => e.teamId === teamId && e.round === r);
    if (!entry) return null;
    return memberPool.find((m) => m.id === entry.memberId)?.name ?? null;
  };

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #050d1a 0%, #0d1b36 45%, #050d1a 100%)",
      }}
    >
      {/* スポットライト */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.04, 0.11, 0.04], scale: [1, 1.14, 1] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(250,204,21,0.14) 0%, transparent 65%)",
          }}
        />
      </div>

      {/* ====== ヘッダー ====== */}
      <div
        className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-yellow-400/75 text-xs font-bold tracking-[0.3em]">
            第{round}巡目
          </span>
          <span className="text-white/22 text-xs">/ 全{totalRounds}巡</span>
        </div>

        {/* ピック順チップ */}
        <div className="flex gap-1.5 flex-wrap justify-end ml-3">
          {currentOrder.map((teamId, i) => (
            <motion.span
              key={teamId}
              animate={{
                backgroundColor:
                  i === pickIndex
                    ? "rgba(250,204,21,1)"
                    : "rgba(0,0,0,0)",
                color:
                  i === pickIndex
                    ? "rgba(0,0,0,1)"
                    : i < pickIndex
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(255,255,255,0.45)",
              }}
              transition={{ duration: 0.3 }}
              className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                i === pickIndex
                  ? "border-transparent font-bold"
                  : i < pickIndex
                  ? "border-transparent line-through"
                  : "border-white/10"
              }`}
            >
              {getTeamName(teamId)}
            </motion.span>
          ))}
        </div>
      </div>

      {/* ====== ドラフトボード ====== */}
      <div
        className="relative z-10 shrink-0 px-4 pt-3 pb-3 overflow-y-auto"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          maxHeight: "clamp(9rem, 26vh, 13rem)",
        }}
      >
        <p className="text-white/38 text-[9px] tracking-[0.5em] uppercase mb-2.5">
          Draft Board
        </p>
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse" style={{ minWidth: "100%" }}>
            <thead>
              <tr>
                <th
                  className="text-left py-1 px-3 font-semibold whitespace-nowrap"
                  style={{
                    minWidth: "4.5rem",
                    color: "rgba(255,255,255,0.3)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  チーム名
                </th>
                {displayedRounds.map((r) => (
                  <th
                    key={r}
                    className="text-left py-1 px-3 font-semibold whitespace-nowrap"
                    style={{
                      minWidth: "5rem",
                      color: r === round
                        ? "rgba(250,204,21,0.65)"
                        : "rgba(255,255,255,0.3)",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {r}巡目
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => {
                const isCurrent = team.id === currentTeam?.id;
                return (
                  <tr
                    key={team.id}
                    className="transition-all duration-300"
                    style={{
                      background: isCurrent
                        ? "rgba(250,204,21,0.06)"
                        : "transparent",
                    }}
                  >
                    <td
                      className="py-1.5 px-3 font-bold whitespace-nowrap align-middle"
                      style={{
                        color: isCurrent
                          ? "rgba(250,204,21,0.9)"
                          : "rgba(255,255,255,0.6)",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {team.name}
                    </td>
                    {displayedRounds.map((r) => {
                      const name = getPickedMember(team.id, r);
                      return (
                        <td
                          key={r}
                          className="py-1.5 px-3 align-middle whitespace-nowrap"
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          {name ? (
                            <span
                              className="px-2 py-0.5 rounded-md font-medium"
                              style={{
                                background: "rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.82)",
                              }}
                            >
                              {name}
                            </span>
                          ) : (
                            <span style={{ color: "rgba(255,255,255,0.18)" }}>
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 金線 */}
      <div
        className="relative z-10 h-px mx-4 shrink-0"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(250,204,21,0.32), transparent)",
        }}
      />

      {/* ====== 現在の指名チーム ====== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTeam?.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center pt-5 pb-4 px-4 shrink-0"
        >
          <p className="text-white/28 text-[9px] tracking-[0.55em] uppercase mb-2">
            Now Picking
          </p>
          <h2 className="text-white text-3xl sm:text-4xl font-extrabold tracking-wide">
            {currentTeam?.name}
          </h2>
          <p className="text-white/32 text-sm mt-1.5 tracking-widest">が指名します</p>
        </motion.div>
      </AnimatePresence>

      {/* ====== メンバー選択グリッド ====== */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pt-2 pb-3 min-h-0">
        <p className="text-white/20 text-[9px] tracking-[0.5em] uppercase text-center mb-3">
          Select Member
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-w-2xl mx-auto">
          {availableMembers.map((member) => (
            <motion.button
              key={member.id}
              whileHover={{
                scale: 1.04,
                boxShadow:
                  "0 0 22px rgba(250,204,21,0.24), 0 4px 18px rgba(0,0,0,0.45)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPick(member.id)}
              className="relative py-5 px-3 rounded-xl text-sm font-semibold text-center overflow-hidden border border-white/10 hover:border-yellow-400/45 hover:bg-yellow-400/5 transition-colors duration-200"
              style={{
                background: "rgba(255,255,255,0.045)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.38)",
                color: "rgba(255,255,255,0.88)",
              }}
            >
              {/* ホバーグロウ */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 pointer-events-none rounded-xl"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(250,204,21,0.07) 0%, transparent 70%)",
                }}
              />
              <span className="relative z-10">{member.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ====== メインページ ======
const DraftPage = () => {
  const router = useRouter();
  const { state, dispatch } = useDraft();

  const [announcement, setAnnouncement] = useState<{
    teamName: string;
    memberName: string;
    memberId: string;
    teamId: string;
  } | null>(null);

  useEffect(() => {
    if (state.phase === "idle") router.replace("/");
    if (state.phase === "completed") router.replace("/results");
  }, [state.phase, router]);

  if (state.phase !== "snake-draft") return null;

  const isPerformance = state.mode === "performance";

  const currentOrder = getSnakeRoundOrder(
    state.snakeOrder,
    state.currentSnakeRound
  );
  const currentTeamId = currentOrder[state.currentPickIndex];
  const currentTeam = state.teams.find((t) => t.id === currentTeamId);

  const getTeamName = (teamId: string) =>
    state.teams.find((t) => t.id === teamId)?.name ?? "";

  const round = state.currentSnakeRound + 2;
  const totalRounds =
    Math.ceil(
      (state.memberPool.length - state.teams.length) / state.teams.length
    ) + 1;

  const handlePick = (memberId: string) => {
    if (!currentTeamId || announcement) return;
    const member = state.availableMembers.find((m) => m.id === memberId);
    if (!member) return;

    if (isPerformance) {
      setAnnouncement({
        teamName: currentTeam?.name ?? "",
        memberName: member.name,
        memberId,
        teamId: currentTeamId,
      });
    } else {
      dispatch({
        type: "SNAKE_PICK",
        payload: { teamId: currentTeamId, memberId },
      });
    }
  };

  const handleAnnouncementEnd = () => {
    if (!announcement) return;
    dispatch({
      type: "SNAKE_PICK",
      payload: { teamId: announcement.teamId, memberId: announcement.memberId },
    });
    setAnnouncement(null);
  };

  // ====== 演出ありモード ======
  if (isPerformance) {
    return (
      <>
        <PerformanceDraftScreen
          round={round}
          totalRounds={totalRounds}
          pickIndex={state.currentPickIndex}
          currentOrder={currentOrder}
          currentTeam={currentTeam}
          teams={state.teams}
          availableMembers={state.availableMembers}
          log={state.log}
          memberPool={state.memberPool}
          getTeamName={getTeamName}
          onPick={handlePick}
        />
        <AnimatePresence>
          {announcement && (
            <DraftPickAnnouncement
              teamName={announcement.teamName}
              memberName={announcement.memberName}
              round={round}
              pickIndex={state.currentPickIndex}
              totalPicks={currentOrder.length}
              onEnd={handleAnnouncementEnd}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // ====== シンプルモード ======
  const steps = [
    { label: "セットアップ", active: false, completed: true },
    { label: "1巡目", active: false, completed: true },
    { label: "ドラフト", active: true, completed: false },
    { label: "結果", active: false, completed: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-4xl p-4 space-y-6"
    >
      <StepIndicator steps={steps} />
      <PageHeader
        title="スネークドラフト"
        description={`${round}巡目 (全${totalRounds}巡)`}
      />

      {/* ピック順バー */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            {round}巡目のピック順
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentOrder.map((teamId, i) => (
              <Badge
                key={teamId}
                variant={i === state.currentPickIndex ? "default" : "outline"}
                className={
                  i < state.currentPickIndex ? "opacity-40 line-through" : ""
                }
              >
                {i + 1}. {getTeamName(teamId)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ドラフトボード */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            ドラフトボード
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">チーム名</th>
                  {state.teams.map((team) => (
                    <th
                      key={team.id}
                      className={`text-left p-2 font-medium ${team.id === currentTeamId ? "text-primary" : ""}`}
                    >
                      {team.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: state.currentSnakeRound + 2 }, (_, roundIndex) => (
                  <tr key={roundIndex} className="border-b">
                    <td className="p-2 font-medium">{roundIndex + 1}巡目</td>
                    {state.teams.map((team) => {
                      const isCurrentPick =
                        team.id === currentTeamId &&
                        roundIndex === state.currentSnakeRound + 1;
                      return (
                        <td
                          key={team.id}
                          className={`p-2 ${
                            isCurrentPick
                              ? "bg-primary/15"
                              : team.id === currentTeamId
                                ? "bg-primary/5"
                                : ""
                          }`}
                        >
                          {team.members[roundIndex] ? (
                            <MemberBadge name={team.members[roundIndex].name} />
                          ) : isCurrentPick ? (
                            <motion.span
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                              className="inline-flex items-center gap-1 text-primary font-semibold text-xs whitespace-nowrap"
                            >
                              ▶ 指名中
                            </motion.span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* 指名UI */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTeamId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>{currentTeam?.name} の指名</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {state.availableMembers.map((member) => (
                  <Button
                    key={member.id}
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => handlePick(member.id)}
                  >
                    {member.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default DraftPage;
