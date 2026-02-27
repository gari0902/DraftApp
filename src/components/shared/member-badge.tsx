"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MemberBadgeProps = {
  name: string;
  variant?: "default" | "secondary" | "outline" | "destructive";
  className?: string;
};

export const MemberBadge = ({
  name,
  variant = "secondary",
  className,
}: MemberBadgeProps) => {
  return (
    <Badge variant={variant} className={cn("text-sm px-3 py-1", className)}>
      {name}
    </Badge>
  );
};
