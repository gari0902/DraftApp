"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { StepIndicator } from "@/components/shared/step-indicator";
import { MemberBadge } from "@/components/shared/member-badge";
import { useDraft } from "@/lib/draft-context";
import { getSnakeRoundOrder } from "@/lib/draft-utils";
import { motion, AnimatePresence } from "framer-motion";

const DraftPage = () => {
  const router = useRouter();
  const { state, dispatch } = useDraft();

  useEffect(() => {
    if (state.phase === "idle") {
      router.replace("/");
    }
    if (state.phase === "completed") {
      router.replace("/results");
    }
  }, [state.phase, router]);

  if (state.phase !== "snake-draft") return null;

  const currentOrder = getSnakeRoundOrder(
    state.snakeOrder,
    state.currentSnakeRound
  );
  const currentTeamId = currentOrder[state.currentPickIndex];
  const currentTeam = state.teams.find((t) => t.id === currentTeamId);

  const handlePick = (memberId: string) => {
    if (!currentTeamId) return;
    dispatch({
      type: "SNAKE_PICK",
      payload: { teamId: currentTeamId, memberId },
    });
  };

  const getTeamName = (teamId: string) => {
    return state.teams.find((t) => t.id === teamId)?.name ?? "";
  };

  const steps = [
    { label: "セットアップ", active: false, completed: true },
    { label: "1巡目", active: false, completed: true },
    { label: "ドラフト", active: true, completed: false },
    { label: "結果", active: false, completed: false },
  ];

  const totalRounds = Math.ceil(
    (state.memberPool.length - state.teams.length) / state.teams.length
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-4xl p-4 space-y-6"
    >
      <StepIndicator steps={steps} />
      <PageHeader
        title="スネークドラフト"
        description={`${state.currentSnakeRound + 2}巡目 (全${totalRounds + 1}巡)`}
      />

      {/* ピック順バー */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            {state.currentSnakeRound + 2}巡目のピック順
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentOrder.map((teamId, i) => (
              <Badge
                key={teamId}
                variant={
                  i === state.currentPickIndex ? "default" : "outline"
                }
                className={
                  i < state.currentPickIndex
                    ? "opacity-40 line-through"
                    : ""
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
                  <th className="text-left p-2 font-medium">チーム</th>
                  <th className="text-left p-2 font-medium">1巡目</th>
                  {Array.from({ length: state.currentSnakeRound + 1 }, (_, i) => (
                    <th key={i} className="text-left p-2 font-medium">
                      {i + 2}巡目
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.teams.map((team) => (
                  <tr
                    key={team.id}
                    className={`border-b ${team.id === currentTeamId ? "bg-primary/5" : ""}`}
                  >
                    <td className="p-2 font-medium">{team.name}</td>
                    {team.members.map((member, i) => (
                      <td key={i} className="p-2">
                        <MemberBadge name={member.name} />
                      </td>
                    ))}
                    {/* 空セル */}
                    {Array.from(
                      {
                        length: Math.max(
                          0,
                          state.currentSnakeRound + 2 - team.members.length
                        ),
                      },
                      (_, i) => (
                        <td key={`empty-${i}`} className="p-2">
                          <span className="text-muted-foreground">-</span>
                        </td>
                      )
                    )}
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
              <CardTitle>
                {currentTeam?.name} の指名
              </CardTitle>
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
