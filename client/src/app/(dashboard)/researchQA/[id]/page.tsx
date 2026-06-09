"use client"
import Chat from "@/components/chat"
import { useState } from "react"
import ResearchReport from "@/components/research/ResearchReport"
import { useResearchStore } from "@/store/zustand"
export default function ReportQAChatExample() {
    const qaReport = useResearchStore(state => state.qaReport)
    return (
        <div className="h-[100dvh] w-full flex ">
            <div className="hidden md:block w-full overflow-x-auto">
                <ResearchReport report={qaReport}/>
            </div>
            <Chat />
        </div>
    )
}