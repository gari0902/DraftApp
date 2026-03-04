"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import { draftReducer, initialDraftState, type DraftAction } from "./draft-reducer";
import type { DraftState } from "./types";

type DraftContextType = {
  state: DraftState;
  dispatch: Dispatch<DraftAction>;
};

const DraftContext = createContext<DraftContextType | null>(null);

export const DraftProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(draftReducer, initialDraftState);

  return (
    <DraftContext.Provider value={{ state, dispatch }}>
      {children}
    </DraftContext.Provider>
  );
};

export const useDraft = (): DraftContextType => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error("useDraft must be used within a DraftProvider");
  }
  return context;
};
