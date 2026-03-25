"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { StepIndicator } from "@/components/shared/step-indicator";
import { TeamCard } from "@/components/shared/team-card";
import { useDraft } from "@/lib/draft-context";
import { motion } from "framer-motion";

// ====== リッチ版結果UI ======
const PerformanceResultsUI = ({
  teams,
  log,
  getTeamName,
  getMemberName,
  onNewDraft,
}: {
  teams: { id: string; name: string; members: { id: string; name: string }[] }[];
  log: { round: number; teamId: string; memberId: string; type: string }[];
  getTeamName: (id: string) => string;
  getMemberName: (id: string) => string;
  onNewDraft: () => void;
}) => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(160deg, #050d1a 0%, #0d1b36 45%, #050d1a 100%)",
      }}
    >
      {/* スポットライト */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.04, 0.1, 0.04], scale: [1, 1.12, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(250,204,21,0.12) 0%, transparent 65%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-8 space-y-6">
        {/* タイトル */}
        <div className="text-center pt-4 pb-2">
          <p className="text-yellow-400/60 text-[10px] tracking-[0.5em] uppercase mb-3">
            Draft Conference
          </p>
          <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-wide mb-1">
            ドラフト結果
          </h1>
          <p className="text-white/35 text-sm tracking-wider">
            全チームのメンバーが確定しました
          </p>
        </div>

        {/* 金線 */}
        <div
          className="h-px mx-8"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(250,204,21,0.32), transparent)",
          }}
        />

        {/* チーム別結果 */}
        {(() => {
          const totalRounds = log.length > 0 ? Math.max(...log.map((e) => e.round)) : 0;
          const roundCols = Array.from({ length: totalRounds }, (_, i) => i + 1);
          const getPick = (teamId: string, r: number): string | null => {
            const entry = log.find((e) => e.teamId === teamId && e.round === r);
            return entry ? getMemberName(entry.memberId) : null;
          };
          return (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl overflow-x-auto"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <table className="text-sm border-collapse" style={{ minWidth: "100%" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <th
                      className="text-left py-2.5 px-4 font-semibold whitespace-nowrap"
                      style={{ minWidth: "7rem", color: "rgba(255,255,255,0.35)" }}
                    >
                      チーム名
                    </th>
                    {roundCols.map((r) => (
                      <th
                        key={r}
                        className="text-left py-2.5 px-4 font-semibold whitespace-nowrap"
                        style={{ minWidth: "6rem", color: "rgba(255,255,255,0.35)" }}
                      >
                        {r}巡目
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, i) => (
                    <motion.tr
                      key={team.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <td
                        className="py-3 px-4 font-bold whitespace-nowrap align-middle"
                        style={{ color: "rgba(250,204,21,0.85)" }}
                      >
                        {team.name}
                      </td>
                      {roundCols.map((r) => {
                        const name = getPick(team.id, r);
                        return (
                          <td
                            key={r}
                            className="py-3 px-4 align-middle whitespace-nowrap"
                          >
                            {name ? (
                              <span
                                className="px-2.5 py-0.5 rounded-lg font-medium"
                                style={{
                                  background: "rgba(255,255,255,0.08)",
                                  color: "rgba(255,255,255,0.82)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                }}
                              >
                                {name}
                              </span>
                            ) : (
                              <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          );
        })()}

        {/* 金線 */}
        <div
          className="h-px mx-8"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(250,204,21,0.18), transparent)",
          }}
        />

        {/* ドラフトログ */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="mb-3">
            <p className="text-yellow-400/60 text-[9px] tracking-[0.4em] uppercase mb-0.5">
              History
            </p>
            <h2 className="text-white text-base font-bold">指名履歴</h2>
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {log.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 text-sm py-1.5 px-2 rounded-lg"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span
                  className="text-xs w-14 shrink-0 font-medium"
                  style={{ color: "rgba(250,204,21,0.55)" }}
                >
                  {entry.round}巡目
                </span>
                <span
                  className="font-semibold w-24 shrink-0"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {getTeamName(entry.teamId)}
                </span>
                <span style={{ color: "rgba(255,255,255,0.88)" }}>
                  {getMemberName(entry.memberId)}
                </span>
                {entry.type === "round1" && (
                  <span
                    className="text-xs ml-auto px-2 py-0.5 rounded-md"
                    style={{
                      background: "rgba(250,204,21,0.1)",
                      color: "rgba(250,204,21,0.65)",
                    }}
                  >
                    くじ引き
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ボタン */}
        <div className="pb-8">
          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 28px rgba(250,204,21,0.3), 0 8px 24px rgba(0,0,0,0.5)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onNewDraft}
            className="w-full py-4 rounded-xl text-base font-extrabold tracking-widest"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)",
              color: "#0a0a0a",
              boxShadow: "0 4px 20px rgba(250,204,21,0.22)",
            }}
          >
            新しいドラフトを始める
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ====== メインページ ======
const ResultsPage = () => {
  const router = useRouter();
  const { state, dispatch } = useDraft();

  useEffect(() => {
    if (state.phase === "idle") {
      router.replace("/");
    }
  }, [state.phase, router]);

  if (state.phase !== "completed") return null;

  const handleNewDraft = () => {
    dispatch({ type: "RESET" });
    router.push("/");
  };

  const getTeamName = (teamId: string) => {
    return state.teams.find((t) => t.id === teamId)?.name ?? "不明";
  };

  const getMemberName = (memberId: string) => {
    return state.memberPool.find((m) => m.id === memberId)?.name ?? "不明";
  };

  if (state.mode === "performance") {
    return (
      <PerformanceResultsUI
        teams={state.teams}
        log={state.log}
        getTeamName={getTeamName}
        getMemberName={getMemberName}
        onNewDraft={handleNewDraft}
      />
    );
  }

  const steps = [
    { label: "セットアップ", active: false, completed: true },
    { label: "1巡目", active: false, completed: true },
    { label: "ドラフト", active: false, completed: true },
    { label: "結果", active: true, completed: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl p-4 space-y-6"
    >
      <StepIndicator steps={steps} />
      <PageHeader
        title="ドラフト結果"
        description="全チームのメンバーが確定しました"
      />

      {/* チーム別結果 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {state.teams.map((team, i) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <TeamCard team={team} />
          </motion.div>
        ))}
      </div>

      <Separator />

      {/* ドラフトログ */}
      <Card>
        <CardHeader>
          <CardTitle>指名履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {state.log.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 text-sm py-1 border-b last:border-0"
              >
                <span className="text-muted-foreground w-16 shrink-0">
                  {entry.round}巡目
                </span>
                <span className="font-medium w-24 shrink-0">
                  {getTeamName(entry.teamId)}
                </span>
                <span>{getMemberName(entry.memberId)}</span>
                {entry.type === "round1" && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    くじ引き
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleNewDraft}>
        新しいドラフトを始める
      </Button>
    </motion.div>
  );
};

export default ResultsPage;
