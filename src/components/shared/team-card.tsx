"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberBadge } from "./member-badge";
import type { Team } from "@/lib/types";
import { cn } from "@/lib/utils";

type TeamCardProps = {
  team: Team;
  className?: string;
  highlight?: boolean;
};

export const TeamCard = ({ team, className, highlight }: TeamCardProps) => {
  return (
    <Card
      className={cn(
        "transition-shadow",
        highlight && "ring-2 ring-primary shadow-lg",
        className
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{team.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {team.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">メンバーなし</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {team.members.map((member) => (
              <MemberBadge key={member.id} name={member.name} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
