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

// ====== くじカード（リッチ版）======
type LotteryCardProps = {
  teamName: string;
  result: "pending" | "win" | "lose";
  isCurrentTurn: boolean;
  onDraw: () => void;
};

const LotteryCard = ({ teamName, result, isCurrentTurn, onDraw }: LotteryCardProps) => (
  <div className="flex flex-col items-center gap-3">
    <motion.div
      animate={
        isCurrentTurn && result === "pending"
          ? { y: [0, -10, 0], transition: { repeat: Infinity, duration: 1.0, ease: "easeInOut" } }
          : {}
      }
      style={{ perspective: 1000 }}
    >
      <div className="relative w-24 h-36 sm:w-28 sm:h-40">
        <AnimatePresence mode="wait">
          {result === "pending" ? (
            <motion.div
              key="back"
              exit={{ rotateY: 90, opacity: 0, transition: { duration: 0.18 } }}
              onClick={isCurrentTurn ? onDraw : undefined}
              className={`absolute inset-0 rounded-2xl flex items-center justify-center overflow-hidden ${
                isCurrentTurn ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              style={{
                background: isCurrentTurn
                  ? "linear-gradient(145deg, #1e2d4a 0%, #2d4070 100%)"
                  : "linear-gradient(145deg, #1c1c1c 0%, #262626 100%)",
                border: `2px solid ${
                  isCurrentTurn ? "rgba(250,204,21,0.7)" : "rgba(255,255,255,0.08)"
                }`,
                boxShadow: isCurrentTurn
                  ? "0 0 28px rgba(250,204,21,0.4), 0 0 60px rgba(250,204,21,0.1), inset 0 0 20px rgba(250,204,21,0.05)"
                  : "0 4px 20px rgba(0,0,0,0.6)",
              }}
            >
              {/* シマーエフェクト */}
              {isCurrentTurn && (
                <motion.div
                  animate={{ x: ["-100%", "220%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
                  className="absolute inset-y-0 w-1/3 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(250,204,21,0.12), transparent)",
                  }}
                />
              )}
              <motion.span
                animate={isCurrentTurn ? { opacity: [1, 0.3, 1], scale: [1, 1.06, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl font-black z-10 relative select-none"
                style={{
                  color: isCurrentTurn
                    ? "rgba(250,204,21,0.95)"
                    : "rgba(255,255,255,0.15)",
                }}
              >
                ?
              </motion.span>
            </motion.div>
          ) : (
            <motion.div
              key="front"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="absolute inset-0 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{
                background:
                  result === "win"
                    ? "linear-gradient(145deg, #78350f 0%, #b45309 45%, #f59e0b 100%)"
                    : "linear-gradient(145deg, #111 0%, #1e1e1e 100%)",
                border: `2px solid ${
                  result === "win"
                    ? "rgba(251,191,36,0.9)"
                    : "rgba(255,255,255,0.06)"
                }`,
                boxShadow:
                  result === "win"
                    ? "0 0 40px rgba(251,191,36,0.6), 0 0 80px rgba(251,191,36,0.2)"
                    : "0 4px 20px rgba(0,0,0,0.6)",
              }}
            >
              {/* 当選フラッシュ */}
              {result === "win" && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.9 }}
                  animate={{ scale: 3.5, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(251,191,36,0.8) 0%, transparent 70%)",
                  }}
                />
              )}
              <span
                className="text-5xl font-black relative z-10 select-none"
                style={{
                  color:
                    result === "win" ? "#fff" : "rgba(255,255,255,0.2)",
                }}
              >
                {result === "win" ? "当" : "外"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>

    {/* チーム名 */}
    <motion.span
      animate={{
        color:
          result === "win"
            ? "rgba(251,191,36,1)"
            : result === "lose"
            ? "rgba(255,255,255,0.2)"
            : isCurrentTurn
            ? "rgba(255,255,255,0.95)"
            : "rgba(255,255,255,0.35)",
      }}
      transition={{ duration: 0.4 }}
      className="text-sm font-bold"
    >
      {teamName}
    </motion.span>
  </div>
);

// ====== 1競合のくじ引きシーン（フルスクリーン）======
type LotteryDrawSceneProps = {
  result: LotteryResult;
  teamNames: Record<string, string>;
  memberName: string;
  conflictIndex: number;
  totalConflicts: number;
  onComplete: () => void;
};

const LotteryDrawScene = ({
  result,
  teamNames,
  memberName,
  conflictIndex,
  totalConflicts,
  onComplete,
}: LotteryDrawSceneProps) => {
  type CardResult = "pending" | "win" | "lose";
  const [cardResults, setCardResults] = useState<CardResult[]>(
    result.competingTeamIds.map(() => "pending")
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"drawing" | "celebrating">("drawing");

  const winnerName = teamNames[result.winnerId] ?? "";
  const currentTeamId = result.competingTeamIds[currentIndex];

  const handleDraw = () => {
    if (phase !== "drawing") return;
    const teamId = result.competingTeamIds[currentIndex];
    const isWin = teamId === result.winnerId;
    const newResults = [...cardResults] as CardResult[];
    newResults[currentIndex] = isWin ? "win" : "lose";
    setCardResults(newResults);

    if (isWin) {
      setTimeout(() => {
        setPhase("celebrating");
        setTimeout(onComplete, 2400);
      }, 700);
    } else {
      const nextIndex = currentIndex + 1;
      if (nextIndex < result.competingTeamIds.length) {
        setTimeout(() => setCurrentIndex(nextIndex), 650);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #050108 0%, #130410 45%, #050108 100%)",
      }}
    >
      {/* 背景スポットライト */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.06, 0.15, 0.06], scale: [1, 1.12, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[750px] h-[750px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(220,38,38,0.22) 0%, transparent 65%)",
          }}
        />
        {/* 水平グラデーションライン */}
        <div
          className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(220,38,38,0.08), transparent)",
          }}
        />
      </div>

      {/* ヘッダー */}
      <div className="absolute top-8 inset-x-0 text-center space-y-2">
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-red-400/75 text-xs font-bold tracking-[0.45em] uppercase"
        >
          重複指名　抽選
        </motion.p>
        {totalConflicts > 1 && (
          <p className="text-white/25 text-xs tracking-widest">
            {conflictIndex + 1} / {totalConflicts}
          </p>
        )}
      </div>

      {/* フェーズ切り替え */}
      <AnimatePresence mode="wait">
        {/* ====== 抽選フェーズ ====== */}
        {phase === "drawing" && (
          <motion.div
            key="drawing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-lg"
          >
            {/* 指名対象メンバー名 */}
            <div className="text-center space-y-1">
              <p className="text-white/35 text-[10px] tracking-[0.4em] uppercase">
                指名権を争う選手
              </p>
              <h2 className="text-white text-3xl font-extrabold tracking-wide">
                {memberName}
              </h2>
            </div>

            {/* カード */}
            <div className="flex justify-center gap-5 flex-wrap">
              {result.competingTeamIds.map((teamId, i) => (
                <LotteryCard
                  key={teamId}
                  teamName={teamNames[teamId] ?? ""}
                  result={cardResults[i]}
                  isCurrentTurn={i === currentIndex}
                  onDraw={handleDraw}
                />
              ))}
            </div>

            {/* 案内 + ボタン */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-5"
              >
                <p className="text-white/45 text-sm">
                  <span className="text-white font-bold">
                    {teamNames[currentTeamId]}
                  </span>{" "}
                  の担当者がくじを引いてください
                </p>

                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <button
                    onClick={handleDraw}
                    className="relative px-14 h-14 rounded-xl text-base font-bold text-white overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #dc2626 0%, #9f1239 100%)",
                      border: "1px solid rgba(239,68,68,0.45)",
                      boxShadow:
                        "0 0 30px rgba(220,38,38,0.4), 0 0 70px rgba(220,38,38,0.12)",
                    }}
                  >
                    {/* ボタンシマー */}
                    <motion.div
                      animate={{ x: ["-100%", "220%"] }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 1.5,
                      }}
                      className="absolute inset-y-0 w-1/3 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                      }}
                    />
                    <span className="relative z-10">くじを引く</span>
                  </button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* ====== 当選セレブレーションフェーズ ====== */}
        {phase === "celebrating" && (
          <motion.div
            key="celebrating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col items-center justify-center gap-5 text-center px-8"
          >
            {/* 爆発フラッシュ */}
            <motion.div
              initial={{ scale: 0, opacity: 0.85 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{ duration: 1.3, ease: "easeOut" }}
              className="absolute w-48 h-48 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(251,191,36,0.75) 0%, transparent 70%)",
              }}
            />
            {/* リングエフェクト */}
            <motion.div
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 1.6, ease: "easeOut", delay: 0.15 }}
              className="absolute w-48 h-48 rounded-full border-2 border-yellow-400/50 pointer-events-none"
            />

            <motion.p
              initial={{ opacity: 0, scale: 0.15, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 18,
                mass: 0.7,
              }}
              className="text-yellow-400 text-5xl font-black tracking-wider relative z-10"
            >
              {winnerName}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="text-white/65 text-xl relative z-10"
            >
              が当選！
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="relative z-10 space-y-1"
            >
              <div
                className="px-5 py-2 rounded-full text-sm"
                style={{
                  background: "rgba(250,204,21,0.1)",
                  border: "1px solid rgba(250,204,21,0.2)",
                  color: "rgba(250,204,21,0.7)",
                }}
              >
                {memberName} を獲得しました
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ====== 複数競合を順番に処理（フルスクリーン）======
type LotterySequenceProps = {
  results: LotteryResult[];
  teamNames: Record<string, string>;
  memberNames: Record<string, string>;
  onAllComplete: () => void;
};

const LotterySequence = ({
  results,
  teamNames,
  memberNames,
  onAllComplete,
}: LotterySequenceProps) => {
  const conflictResults = results.filter((r) => r.competingTeamIds.length > 1);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleComplete = () => {
    if (currentIndex + 1 < conflictResults.length) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 700);
    } else {
      setTimeout(onAllComplete, 400);
    }
  };

  // 競合なし → フルスクリーンで「競合なし！」
  if (conflictResults.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background:
            "linear-gradient(160deg, #050d1a 0%, #0d1b36 45%, #050d1a 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className="text-center space-y-4"
          onAnimationComplete={() => setTimeout(onAllComplete, 1600)}
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <p
              className="text-5xl font-black tracking-wider"
              style={{ color: "rgba(250,204,21,1)" }}
            >
              競合なし！
            </p>
          </motion.div>
          <p className="text-white/45 text-sm tracking-widest">
            全チームの指名が確定しました
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <LotteryDrawScene
        key={currentIndex}
        result={conflictResults[currentIndex]}
        teamNames={teamNames}
        memberName={memberNames[conflictResults[currentIndex].memberId] ?? ""}
        conflictIndex={currentIndex}
        totalConflicts={conflictResults.length}
        onComplete={handleComplete}
      />
    </AnimatePresence>
  );
};

// ====== NPB風 指名発表シーケンス ======
type AnnouncementPick = { teamName: string; memberName: string };

const DraftAnnouncementSequence = ({
  picks,
  onComplete,
}: {
  picks: AnnouncementPick[];
  onComplete: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const currentPick = picks[currentIndex];
  const isLast = currentIndex === picks.length - 1;

  const handleTap = () => {
    if (!revealed) {
      setRevealed(true);
    } else if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #050d1a 0%, #0d1b36 45%, #050d1a 100%)",
      }}
      onClick={handleTap}
    >
      {/* スポットライト */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.15, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(250,204,21,0.25) 0%, rgba(250,204,21,0.05) 40%, transparent 70%)",
          }}
        />
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent" />
      </div>

      {/* ヘッダー */}
      <div className="absolute top-8 inset-x-0 flex flex-col items-center gap-3">
        <p className="text-yellow-400/80 text-xs font-bold tracking-[0.35em] uppercase">
          第1巡目　指名発表
        </p>
        <div className="flex gap-2">
          {picks.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                backgroundColor:
                  i < currentIndex
                    ? "rgba(250,204,21,0.9)"
                    : i === currentIndex
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.2)",
                scale: i === currentIndex ? 1.3 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="w-2 h-2 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center gap-8 px-8 w-full max-w-sm"
        >
          <div className="text-center space-y-2">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-white/40 text-[10px] tracking-[0.4em] uppercase"
            >
              Nominating Team
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, scale: 0.88, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 20 }}
              className="text-white text-4xl font-extrabold tracking-wide"
            >
              {currentPick.teamName}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-white/50 text-sm tracking-widest"
            >
              の指名選手は…
            </motion.p>
          </div>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="w-full h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(250,204,21,0.5), transparent)",
            }}
          />

          <div className="w-full min-h-[140px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {!revealed ? (
                <motion.div
                  key="hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                  className="flex flex-col items-center gap-4"
                >
                  <motion.div
                    animate={{ opacity: [0.35, 0.75, 0.35] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-60 h-20 rounded-2xl border border-white/15 flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <span className="text-white/35 text-xs tracking-[0.35em]">
                      タップして発表
                    </span>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="revealed"
                  className="relative flex flex-col items-center gap-3 text-center"
                >
                  <motion.div
                    initial={{ opacity: 0.6, scale: 0.5 }}
                    animate={{ opacity: 0, scale: 2.5 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(250,204,21,0.3) 0%, transparent 70%)",
                    }}
                  />
                  <motion.p
                    initial={{ opacity: 0, scale: 0.2, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                    className="text-yellow-400 text-5xl font-black tracking-wider relative z-10"
                  >
                    {currentPick.memberName}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="text-white/55 text-sm tracking-widest"
                  >
                    を指名します
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* フッターヒント */}
      <div className="absolute bottom-8 inset-x-0 text-center">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.p
              key="pre"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white/20 text-xs tracking-widest"
            >
              画面をタップして選手を発表
            </motion.p>
          ) : (
            <motion.p
              key="post"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white/20 text-xs tracking-widest"
            >
              {isLast
                ? "タップして抽選へ進む"
                : `タップして次へ（${currentIndex + 2} / ${picks.length}）`}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ====== 演出あり：選択フェーズ（フルスクリーン）======
type Team = { id: string; name: string; members: { id: string; name: string }[] };
type PickEntry = { teamId: string; memberId: string | null };
type MemberEntry = { id: string; name: string };

const PerformanceRound1Selection = ({
  activeTeamObjects,
  round1Picks,
  availableMembers,
  confirmedTeams,
  allPicked,
  getMemberName,
  onPickMember,
  onDecide,
}: {
  activeTeamObjects: Team[];
  round1Picks: PickEntry[];
  availableMembers: MemberEntry[];
  confirmedTeams: Team[];
  allPicked: boolean;
  getMemberName: (id: string) => string;
  onPickMember: (teamId: string, memberId: string) => void;
  onDecide: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="fixed inset-0 z-30 flex flex-col overflow-hidden"
    style={{
      background: "linear-gradient(160deg, #050d1a 0%, #0d1b36 45%, #050d1a 100%)",
    }}
  >
    {/* スポットライト */}
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        animate={{ opacity: [0.04, 0.11, 0.04], scale: [1, 1.1, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(250,204,21,0.11) 0%, transparent 65%)",
        }}
      />
    </div>

    {/* ヘッダー */}
    <div className="relative z-10 text-center pt-7 pb-3 shrink-0">
      <p className="text-yellow-400/70 text-xs font-bold tracking-[0.42em] uppercase">
        第1巡目　指名フェーズ
      </p>
      {confirmedTeams.length > 0 && (
        <div className="flex justify-center flex-wrap gap-2 mt-3 px-4">
          {confirmedTeams.map((team) => (
            <span
              key={team.id}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: "rgba(250,204,21,0.1)",
                border: "1px solid rgba(250,204,21,0.25)",
                color: "rgba(250,204,21,0.75)",
              }}
            >
              ✓ {team.name}: {team.members[0]?.name}
            </span>
          ))}
        </div>
      )}
    </div>

    {/* 金線 */}
    <div
      className="relative z-10 h-px mx-4 mb-4 shrink-0"
      style={{
        background:
          "linear-gradient(to right, transparent, rgba(250,204,21,0.3), transparent)",
      }}
    />

    {/* チーム選択カード */}
    <div className="relative z-10 flex-1 overflow-y-auto px-4 min-h-0">
      <div className="grid gap-3 sm:grid-cols-2 max-w-2xl mx-auto pb-2">
        {activeTeamObjects.map((team) => {
          const pick = round1Picks.find((p) => p.teamId === team.id);
          const hasPick = pick?.memberId != null;

          return (
            <div
              key={team.id}
              className="rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.035)",
                border: hasPick
                  ? "1px solid rgba(250,204,21,0.28)"
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: hasPick
                  ? "0 0 20px rgba(250,204,21,0.08)"
                  : "none",
              }}
            >
              {/* チームヘッダー */}
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <h3 className="text-white font-bold text-base tracking-wide">
                  {team.name}
                </h3>
                <AnimatePresence mode="wait">
                  {hasPick ? (
                    <motion.p
                      key="picked"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs mt-0.5 font-medium"
                      style={{ color: "rgba(250,204,21,0.85)" }}
                    >
                      ▶ {getMemberName(pick!.memberId!)}
                    </motion.p>
                  ) : (
                    <motion.p
                      key="none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs mt-0.5"
                      style={{ color: "rgba(255,255,255,0.28)" }}
                    >
                      未選択
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* メンバーリスト */}
              <div className="p-2.5 max-h-44 overflow-y-auto space-y-1.5">
                {availableMembers.map((member) => {
                  const isSelected = pick?.memberId === member.id;
                  return (
                    <motion.button
                      key={member.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onPickMember(team.id, member.id)}
                      className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium transition-colors duration-150"
                      style={{
                        background: isSelected
                          ? "rgba(250,204,21,0.12)"
                          : "rgba(255,255,255,0.03)",
                        border: `1px solid ${
                          isSelected
                            ? "rgba(250,204,21,0.35)"
                            : "rgba(255,255,255,0.07)"
                        }`,
                        color: isSelected
                          ? "rgba(250,204,21,0.92)"
                          : "rgba(255,255,255,0.65)",
                      }}
                    >
                      {member.name}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* 決定ボタン */}
    <div
      className="relative z-10 px-4 py-5 shrink-0"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <motion.button
        disabled={!allPicked}
        onClick={onDecide}
        whileHover={allPicked ? { scale: 1.02 } : {}}
        whileTap={allPicked ? { scale: 0.97 } : {}}
        className="w-full h-14 rounded-xl font-bold text-base transition-all duration-300"
        style={{
          background: allPicked
            ? "linear-gradient(135deg, rgba(250,204,21,0.95) 0%, rgba(234,179,8,0.95) 100%)"
            : "rgba(255,255,255,0.04)",
          color: allPicked ? "#000" : "rgba(255,255,255,0.2)",
          border: allPicked ? "none" : "1px solid rgba(255,255,255,0.08)",
          boxShadow: allPicked
            ? "0 0 40px rgba(250,204,21,0.38), 0 4px 20px rgba(0,0,0,0.3)"
            : "none",
        }}
      >
        {allPicked ? "決定！" : "全チームの指名を選択してください"}
      </motion.button>
    </div>
  </motion.div>
);

// ====== メインページ ======
const Round1Page = () => {
  const router = useRouter();
  const { state, dispatch } = useDraft();
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [lotteryDone, setLotteryDone] = useState(false);

  useEffect(() => {
    if (state.phase === "idle") {
      router.replace("/");
    }
  }, [state.phase, router]);

  if (state.phase === "idle") return null;

  const isPerformance = state.mode === "performance";

  const activeTeams = state.round1Picks.map((p) => p.teamId);
  const activeTeamObjects = state.teams.filter((t) => activeTeams.includes(t.id));
  const confirmedTeams = state.teams.filter(
    (t) => !activeTeams.includes(t.id) && t.members.length > 0
  );
  const allPicked = state.round1Picks.every((p) => p.memberId !== null);

  const getMemberName = (memberId: string) =>
    state.memberPool.find((m) => m.id === memberId)?.name ?? "不明";

  const getTeamName = (teamId: string) =>
    state.teams.find((t) => t.id === teamId)?.name ?? "不明";

  const teamNamesMap: Record<string, string> = Object.fromEntries(
    state.teams.map((t) => [t.id, t.name])
  );
  const memberNamesMap: Record<string, string> = Object.fromEntries(
    state.memberPool.map((m) => [m.id, m.name])
  );

  const announcementPicks: AnnouncementPick[] = state.round1Picks
    .filter((p) => p.memberId !== null)
    .map((p) => ({
      teamName: getTeamName(p.teamId),
      memberName: getMemberName(p.memberId!),
    }));

  const handlePickMember = (teamId: string, memberId: string) => {
    dispatch({ type: "SET_ROUND1_PICK", payload: { teamId, memberId } });
  };

  const handleResolve = () => {
    dispatch({ type: "RESOLVE_ROUND1" });
    setShowResults(true);
    setLotteryDone(false);
  };

  const handleDecide = () => {
    if (isPerformance) {
      setShowAnnouncement(true);
    } else {
      handleResolve();
    }
  };

  const handleAnnouncementComplete = () => {
    setShowAnnouncement(false);
    handleResolve();
  };

  // シンプルモード：自動遷移
  useEffect(() => {
    if (isPerformance) return;
    if (!showResults) return;
    if (state.phase === "snake-draft") {
      const t = setTimeout(() => router.push("/draft"), 2000);
      return () => clearTimeout(t);
    }
    if (state.phase === "completed") {
      const t = setTimeout(() => router.push("/results"), 2000);
      return () => clearTimeout(t);
    }
    if (state.phase === "round1-picking") {
      const t = setTimeout(() => setShowResults(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showResults, state.phase, router, isPerformance]);

  // 演出ありモード：くじ引き完了後に遷移
  useEffect(() => {
    if (!isPerformance || !lotteryDone) return;
    if (state.phase === "snake-draft") {
      const t = setTimeout(() => router.push("/draft"), 600);
      return () => clearTimeout(t);
    }
    if (state.phase === "completed") {
      const t = setTimeout(() => router.push("/results"), 600);
      return () => clearTimeout(t);
    }
    if (state.phase === "round1-picking") {
      const t = setTimeout(() => {
        setShowResults(false);
        setLotteryDone(false);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [lotteryDone, state.phase, router, isPerformance]);

  const steps = [
    { label: "セットアップ", active: false, completed: true },
    { label: "1巡目", active: true, completed: false },
    { label: "ドラフト", active: false, completed: false },
    { label: "結果", active: false, completed: false },
  ];

  return (
    <>
      {/* 演出あり：発表オーバーレイ (z-50) */}
      <AnimatePresence>
        {showAnnouncement && isPerformance && (
          <DraftAnnouncementSequence
            picks={announcementPicks}
            onComplete={handleAnnouncementComplete}
          />
        )}
      </AnimatePresence>

      {/* 演出あり：くじ引きオーバーレイ (z-50) */}
      <AnimatePresence>
        {showResults && isPerformance && (
          <LotterySequence
            results={state.round1Results}
            teamNames={teamNamesMap}
            memberNames={memberNamesMap}
            onAllComplete={() => setLotteryDone(true)}
          />
        )}
      </AnimatePresence>

      {/* 演出あり：選択フェーズ (z-30) */}
      <AnimatePresence>
        {isPerformance && !showResults && (
          <PerformanceRound1Selection
            activeTeamObjects={activeTeamObjects}
            round1Picks={state.round1Picks}
            availableMembers={state.availableMembers}
            confirmedTeams={confirmedTeams}
            allPicked={allPicked}
            getMemberName={getMemberName}
            onPickMember={handlePickMember}
            onDecide={handleDecide}
          />
        )}
      </AnimatePresence>

      {/* シンプルモード：ページ本体 */}
      {!isPerformance && (
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

          {confirmedTeams.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">確定済み</h3>
              <div className="flex flex-wrap gap-2">
                {confirmedTeams.map((team) => (
                  <Badge key={team.id} variant="outline" className="py-1 px-3">
                    {team.name}: {team.members[0]?.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {!showResults && (
            <div className="grid gap-4 sm:grid-cols-2">
              {activeTeamObjects.map((team) => {
                const pick = state.round1Picks.find((p) => p.teamId === team.id);
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
                            variant={pick?.memberId === member.id ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handlePickMember(team.id, member.id)}
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

          {/* シンプルモード：結果表示 */}
        <AnimatePresence>
          {showResults && !isPerformance && (
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
                            {result.loserIds.map((id) => getTeamName(id)).join(", ")}
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
              onClick={handleDecide}
            >
              {allPicked ? "決定！" : "全チームの指名を選択してください"}
            </Button>
          )}
        </motion.div>
      )}
    </>
  );
};

export default Round1Page;
