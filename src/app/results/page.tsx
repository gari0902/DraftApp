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
