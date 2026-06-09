"use client";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef, useEffect } from "react"

import {

    CheckCircle,
    MessageSquare,
    Zap,

    Loader2,
    Activity
} from "lucide-react"

interface StreamLogs{
    type: string
    timestamp?: string
    operation?: string
    node?: string
}



function AgentActivity({ logs }: { logs: StreamLogs[] }) {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const viewport = ref.current?.closest('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, [logs]);

    function getIconByType(type?: string) {
        const iconClass = "w-4 h-4"

        switch (type) {
            // Chain (Node) events
            case "on_chain_start":
                return <Loader2 className={`${iconClass} text-blue-500 animate-spin`} />
            case "on_chain_end":
                return <CheckCircle className={`${iconClass} text-green-600`} />

            // Chat Model events
            case "on_chat_model_start":
                return <Loader2 className={`${iconClass} text-purple-500 animate-spin`} />
            case "on_chat_model_stream":
                return <MessageSquare className={`${iconClass} text-purple-500`} />
            case "on_chat_model_end":
                return <CheckCircle className={`${iconClass} text-purple-600`} />

            // Tool events
            case "on_tool_start":
                return <Loader2 className={`${iconClass} text-orange-500 animate-spin`} />
            case "on_tool_end":
                return <Zap className={`${iconClass} text-orange-600`} />

            default:
                return <Activity className={`${iconClass} text-gray-400`} />
        }
    }

    function getColorByType(type?: string): string {
        const colors: Record<string, string> = {
            "on_chain_start": "rgb(59, 130, 246)",           // blue
            "on_chain_end": "rgb(34, 197, 94)",             // green
            "on_chat_model_start": "rgb(147, 51, 234)",     // purple
            "on_chat_model_stream": "rgb(147, 51, 234)",
            "on_chat_model_end": "rgb(147, 51, 234)",
            "on_tool_start": "rgb(234, 88, 12)",            // orange
            "on_tool_end": "rgb(234, 88, 12)",
        }
        return colors[type || ""] || "rgb(156, 163, 175)"
    }
    return (
        < Card className="rounded-none" >
            <CardHeader>
                <CardTitle>
                    Logs (Live)
                </CardTitle>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                        {logs.map((log: StreamLogs, index: number) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 px-3 py-2 rounded-lg border-l-2 hover:bg-muted/50 transition-colors"
                                style={{
                                    borderLeftColor: getColorByType(log?.type)
                                }}
                            >
                                {/* Icon */}
                                <div className="flex-shrink-0 mt-0.5">
                                    {getIconByType(log?.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[11px] text-muted-foreground font-mono">
                                            {log?.timestamp}
                                        </span>
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
                                            {log?.type}
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {log?.node || "—"}
                                    </div>
                                    {log?.operation && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {log?.operation}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={ref} />
                    </div>
                </ScrollArea>
            </CardContent>
        </Card >



    );
}
export default memo(AgentActivity)