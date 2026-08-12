"use client";

import { createContext, useContext } from "react";

const WebsiteContentContext = createContext<Record<string, string>>({});

export function WebsiteContentProvider({
  content,
  children,
}: {
  content: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <WebsiteContentContext.Provider value={content}>
      {children}
    </WebsiteContentContext.Provider>
  );
}

export function useWebsiteContent() {
  return useContext(WebsiteContentContext);
}
