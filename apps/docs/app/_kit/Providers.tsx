"use client";

import { PlopProvider, type PlopProviderProps } from "@plop-ui/react";
import { createContext, useContext, useState, type ReactNode } from "react";

interface Feedback {
  haptics: boolean;
  sound: boolean;
  setHaptics: (on: boolean) => void;
  setSound: (on: boolean) => void;
}

const FeedbackContext = createContext<Feedback | null>(null);

/** Root PlopProvider whose haptics and sound the page footer can switch. Sound starts off. */
export function Providers({ children, ...props }: PlopProviderProps & { children: ReactNode }) {
  const [haptics, setHaptics] = useState(true);
  const [sound, setSound] = useState(false);
  return (
    <FeedbackContext.Provider value={{ haptics, sound, setHaptics, setSound }}>
      <PlopProvider {...props} haptics={haptics} sound={sound}>
        {children}
      </PlopProvider>
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): Feedback {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback needs <Providers>");
  return ctx;
}
