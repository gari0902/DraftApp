"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { StepIndicator } from "@/components/shared/step-indicator";
import { useDraft } from "@/lib/draft-context";
import { motion, AnimatePresence } from "framer-motion";
import type { LotteryResult } from "@/lib/types";

const Round1Page = () => {
  const router = useRouter();
  const { state, dispatch } = useDraft();
  const [showResults, setShowResults] = useState(false);
  const [latestResults, setLatestResults] = useState<LotteryResult[]>([]);

  useEffect(() => {
    if (state.phase === "idle") {
      router.replace("/");
    }
  }, [state.phase, router]);

  if (state.phase === "idle") return null;

  const activeTeams = state.round1Picks.map((p) => p.teamId);
  const activeTeamObjects = state.teams.filter((t) =>
    activeTeams.includes(t.id)
  );
  const confirmedTeams = state.teams.filter(
    (t) => !activeTeams.includes(t.id) && t.members.length > 0
  );

  const allPicked = state.round1Picks.every((p) => p.memberId !== null);

  const handlePickMember = (teamId: string, memberId: string) => {
    dispatch({
      type: "SET_ROUND1_PICK",
      payload: { teamId, memberId },
    });
  };

  const handleResolve = () => {
    // 結果を先に計算して表示用に保存
    const prevResultCount = state.round1Results.length;
    dispatch({ type: "RESOLVE_ROUND1" });
    setShowResults(true);
  };

  // RESOLVE_ROUND1後の状態変化を監視
  useEffect(() => {
    if (showResults && state.phase === "snake-draft") {
      // 少し待ってから遷移
      const timer = setTimeout(() => {
        router.push("/draft");
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (showResults && state.phase === "completed") {
      const timer = setTimeout(() => {
        router.push("/results");
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (showResults && state.phase === "round1-picking") {
      // 外れチームがいる → 少し待ってから再指名モードへ
      const timer = setTimeout(() => {
        setShowResults(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showResults, state.phase, router]);

  const steps = [
    { label: "セットアップ", active: false, completed: true },
    { label: "1巡目", active: true, completed: false },
    { label: "ドラフト", active: false, completed: false },
    { label: "結果", active: false, completed: false },
  ];

  const getMemberName = (memberId: string) => {
    const member = state.memberPool.find((m) => m.id === memberId);
    return member?.name ?? "不明";
  };

  const getTeamName = (teamId: string) => {
    const team = state.teams.find((t) => t.id === teamId);
    return team?.name ?? "不明";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl p-4 space-y-6"
    >
      <StepIndicator steps={steps} />
      <PageHeader
        title="1巡目 - くじ引き"
        description={
          activeTeams.length < state.teams.length
            ? "抽選に外れたチームが再指名します"
            : "各チームが同時にメンバーを指名します"
        }
      />

      {/* 確定済みチーム */}
      {confirmedTeams.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            確定済み
          </h3>
          <div className="flex flex-wrap gap-2">
            {confirmedTeams.map((team) => (
              <Badge key={team.id} variant="outline" className="py-1 px-3">
                {team.name}: {team.members[0]?.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 指名UI */}
      {!showResults && (
        <div className="grid gap-4 sm:grid-cols-2">
          {activeTeamObjects.map((team) => {
            const pick = state.round1Picks.find(
              (p) => p.teamId === team.id
            );
            return (
              <Card key={team.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {state.availableMembers.map((member) => (
                      <Button
                        key={member.id}
                        variant={
                          pick?.memberId === member.id
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          handlePickMember(team.id, member.id)
                        }
                      >
                        {member.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 抽選結果表示 */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>抽選結果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {state.round1Results.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    競合なし - 全チームの指名が確定しました
                  </p>
                ) : (
                  state.round1Results.map((result, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.3 }}
                      className="rounded-lg border p-3 space-y-1"
                    >
                      <p className="font-medium">
                        {getMemberName(result.memberId)} →{" "}
                        <span className="text-primary">
                          {getTeamName(result.winnerId)} が獲得!
                        </span>
                      </p>
                      {result.loserIds.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          外れ:{" "}
                          {result.loserIds
                            .map((id) => getTeamName(id))
                            .join(", ")}
                        </p>
                      )}
                    </motion.div>
                  ))
                )}

                {state.phase === "snake-draft" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-sm text-muted-foreground mt-4"
                  >
                    スネークドラフトに移行します...
                  </motion.p>
                )}
                {state.phase === "round1-picking" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-sm text-muted-foreground mt-4"
                  >
                    外れたチームが再指名します...
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!showResults && (
        <Button
          className="w-full"
          size="lg"
          disabled={!allPicked}
          onClick={handleResolve}
        >
          {allPicked ? "決定！" : "全チームの指名を選択してください"}
        </Button>
      )}
    </motion.div>
  );
};

export default Round1Page;
