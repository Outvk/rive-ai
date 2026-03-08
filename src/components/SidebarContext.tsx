"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type SidebarVersion = "v1" | "v2";

interface SidebarContextType {
    sidebarVersion: SidebarVersion;
    setSidebarVersion: (version: SidebarVersion) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [sidebarVersion, setSidebarVersion] = useState<SidebarVersion>("v2");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const savedVersion = localStorage.getItem("sidebarVersion") as SidebarVersion;
        if (savedVersion === "v1" || savedVersion === "v2") {
            setSidebarVersion(savedVersion);
        }
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("sidebarVersion", sidebarVersion);
        }
    }, [sidebarVersion, isMounted]);

    return (
        <SidebarContext.Provider value={{ sidebarVersion, setSidebarVersion }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
