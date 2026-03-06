"use client";

import React from "react";
import { useSidebar } from "./SidebarContext";
import { DashboardSidebar } from "./DashboardSidebar";
import { SidebarV2 } from "./SidebarV2";

interface DynamicSidebarProps {
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    conversations: any[];
    recentImages: any[];
    recentSpeech: any[];
    recentVideos: any[];
}

export function DynamicSidebar(props: DynamicSidebarProps) {
    const { sidebarVersion } = useSidebar();

    if (sidebarVersion === "v1") {
        return <DashboardSidebar {...props} avatarUrl={props.avatarUrl || undefined} />;
    }

    return <SidebarV2 {...props} />;
}
