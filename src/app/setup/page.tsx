"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DraftMode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { StepIndicator } from "@/components/shared/step-indicator";
import { useDraft } from "@/lib/draft-context";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ====== リッチ版セットアップUI ======
const PerformanceSetupUI = ({
  teamNames,
  memberNames,
  errors,
  addTeam,
  removeTeam,
  updateTeam,
  addMember,
  removeMember,
  updateMember,
  onBack,
  onStart,
}: {
  teamNames: string[];
  memberNames: string[];
  errors: string[];
  addTeam: () => void;
  removeTeam: (i: number) => void;
  updateTeam: (i: number, v: string) => void;
  addMember: () => void;
  removeMember: (i: number) => void;
  updateMember: (i: number, v: string) => void;
  onBack: () => void;
  onStart: () => void;
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

      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 py-8 space-y-6">
        {/* タイトル */}
        <div className="text-center pt-4 pb-2">
          <p className="text-yellow-400/60 text-[10px] tracking-[0.5em] uppercase mb-3">
            Draft Conference
          </p>
          <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-wide mb-1">
            セットアップ
          </h1>
          <p className="text-white/35 text-sm tracking-wider">
            チームとメンバーを設定しましょう
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

        {/* エラー */}
        {errors.length > 0 && (
          <div
            className="rounded-xl p-4 space-y-1"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            {errors.map((error, i) => (
              <p key={i} className="text-sm" style={{ color: "rgba(252,165,165,0.9)" }}>
                {error}
              </p>
            ))}
          </div>
        )}

        {/* チームセクション */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-yellow-400/70 text-[9px] tracking-[0.45em] uppercase mb-0.5">
                Teams
              </p>
              <h2 className="text-white text-base font-bold">チーム</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addTeam}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(250,204,21,0.1)",
                border: "1px solid rgba(250,204,21,0.25)",
                color: "rgba(250,204,21,0.9)",
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              追加
            </motion.button>
          </div>
          <div className="space-y-2.5">
            <AnimatePresence>
              {teamNames.map((name, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2"
                >
                  <span
                    className="text-xs font-bold w-6 shrink-0 text-center"
                    style={{ color: "rgba(250,204,21,0.5)" }}
                  >
                    {i + 1}
                  </span>
                  <input
                    placeholder={`チーム${i + 1}`}
                    value={name}
                    onChange={(e) => updateTeam(i, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.88)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(250,204,21,0.4)";
                      e.currentTarget.style.background = "rgba(250,204,21,0.04)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                  />
                  <button
                    onClick={() => removeTeam(i)}
                    disabled={teamNames.length <= 2}
                    className="shrink-0 p-1.5 rounded-lg transition-colors"
                    style={{
                      color:
                        teamNames.length <= 2
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(255,255,255,0.4)",
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* メンバープールセクション */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-yellow-400/70 text-[9px] tracking-[0.45em] uppercase mb-0.5">
                Members
              </p>
              <h2 className="text-white text-base font-bold">メンバープール</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addMember}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(250,204,21,0.1)",
                border: "1px solid rgba(250,204,21,0.25)",
                color: "rgba(250,204,21,0.9)",
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              追加
            </motion.button>
          </div>
          <div className="space-y-2.5">
            <AnimatePresence>
              {memberNames.map((name, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2"
                >
                  <span
                    className="text-xs font-bold w-6 shrink-0 text-center"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {i + 1}
                  </span>
                  <input
                    placeholder={`メンバー${i + 1}`}
                    value={name}
                    onChange={(e) => updateMember(i, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.88)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(250,204,21,0.4)";
                      e.currentTarget.style.background = "rgba(250,204,21,0.04)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                  />
                  <button
                    onClick={() => removeMember(i)}
                    disabled={memberNames.length <= 2}
                    className="shrink-0 p-1.5 rounded-lg transition-colors"
                    style={{
                      color:
                        memberNames.length <= 2
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(255,255,255,0.4)",
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 pb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBack}
            className="px-5 py-3 rounded-xl text-sm font-semibold shrink-0"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            戻る
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 28px rgba(250,204,21,0.3), 0 8px 24px rgba(0,0,0,0.5)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="flex-1 py-3 rounded-xl text-base font-extrabold tracking-widest"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)",
              color: "#0a0a0a",
              boxShadow: "0 4px 20px rgba(250,204,21,0.22)",
            }}
          >
            ドラフト開始
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ====== 共通ロジック ======
const SetupPageInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") ?? "simple") as DraftMode;
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
        mode,
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

  if (mode === "performance") {
    return (
      <PerformanceSetupUI
        teamNames={teamNames}
        memberNames={memberNames}
        errors={errors}
        addTeam={addTeam}
        removeTeam={removeTeam}
        updateTeam={updateTeam}
        addMember={addMember}
        removeMember={removeMember}
        updateMember={updateMember}
        onBack={() => router.push("/")}
        onStart={handleStart}
      />
    );
  }

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

const SetupPage = () => (
  <Suspense>
    <SetupPageInner />
  </Suspense>
);

export default SetupPage;
