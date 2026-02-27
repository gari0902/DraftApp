"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { StepIndicator } from "@/components/shared/step-indicator";
import { useDraft } from "@/lib/draft-context";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SetupPage = () => {
  const router = useRouter();
  const { dispatch } = useDraft();

  const [teamNames, setTeamNames] = useState<string[]>(["", ""]);
  const [memberNames, setMemberNames] = useState<string[]>(["", "", ""]);
  const [errors, setErrors] = useState<string[]>([]);

  const addTeam = () => setTeamNames([...teamNames, ""]);
  const removeTeam = (index: number) => {
    if (teamNames.length <= 2) return;
    setTeamNames(teamNames.filter((_, i) => i !== index));
  };
  const updateTeam = (index: number, value: string) => {
    const updated = [...teamNames];
    updated[index] = value;
    setTeamNames(updated);
  };

  const addMember = () => setMemberNames([...memberNames, ""]);
  const removeMember = (index: number) => {
    if (memberNames.length <= 2) return;
    setMemberNames(memberNames.filter((_, i) => i !== index));
  };
  const updateMember = (index: number, value: string) => {
    const updated = [...memberNames];
    updated[index] = value;
    setMemberNames(updated);
  };

  const validate = (): boolean => {
    const newErrors: string[] = [];
    const filledTeams = teamNames.filter((n) => n.trim());
    const filledMembers = memberNames.filter((n) => n.trim());

    if (filledTeams.length < 2) {
      newErrors.push("チーム名を2つ以上入力してください");
    }
    if (filledMembers.length < filledTeams.length) {
      newErrors.push(
        `メンバーはチーム数(${filledTeams.length})以上必要です`
      );
    }

    const duplicateTeams = filledTeams.filter(
      (name, i) => filledTeams.indexOf(name) !== i
    );
    if (duplicateTeams.length > 0) {
      newErrors.push("チーム名が重複しています");
    }

    const duplicateMembers = filledMembers.filter(
      (name, i) => filledMembers.indexOf(name) !== i
    );
    if (duplicateMembers.length > 0) {
      newErrors.push("メンバー名が重複しています");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleStart = () => {
    if (!validate()) return;

    const filledTeams = teamNames.filter((n) => n.trim());
    const filledMembers = memberNames.filter((n) => n.trim());

    dispatch({
      type: "INIT_DRAFT",
      payload: {
        teamNames: filledTeams,
        memberNames: filledMembers,
      },
    });

    router.push("/round1");
  };

  const steps = [
    { label: "セットアップ", active: true, completed: false },
    { label: "1巡目", active: false, completed: false },
    { label: "ドラフト", active: false, completed: false },
    { label: "結果", active: false, completed: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-2xl p-4 space-y-6"
    >
      <StepIndicator steps={steps} />
      <PageHeader
        title="セットアップ"
        description="チームとメンバーを設定しましょう"
      />

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-1">
          {errors.map((error, i) => (
            <p key={i} className="text-sm text-destructive">
              {error}
            </p>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>チーム</span>
            <Button variant="outline" size="sm" onClick={addTeam}>
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {teamNames.map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm text-muted-foreground w-6">
                  {i + 1}.
                </span>
                <Input
                  placeholder={`チーム${i + 1}`}
                  value={name}
                  onChange={(e) => updateTeam(i, e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTeam(i)}
                  disabled={teamNames.length <= 2}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>メンバープール</span>
            <Button variant="outline" size="sm" onClick={addMember}>
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {memberNames.map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm text-muted-foreground w-6">
                  {i + 1}.
                </span>
                <Input
                  placeholder={`メンバー${i + 1}`}
                  value={name}
                  onChange={(e) => updateMember(i, e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMember(i)}
                  disabled={memberNames.length <= 2}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.push("/")}>
          戻る
        </Button>
        <Button className="flex-1" size="lg" onClick={handleStart}>
          ドラフト開始
        </Button>
      </div>
    </motion.div>
  );
};

export default SetupPage;
