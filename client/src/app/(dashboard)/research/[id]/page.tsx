"use client"
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ResearchReport from '@/components/research/ResearchReport'
import AgentActivity from '@/components/research/AgentActivity'
import getResearch from '@/actions/getResearch'
import { toast } from 'sonner'
import { Sparkles, ArrowRight, Globe, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react'
import { HashLoader } from "react-spinners"
import { NodeStream } from '@/components/research/NodeStream'

interface StreamEvent {
    type: string;
    timestamp?: string;
    operation?: string;
    node?: string;

}
interface StreamNode {
    id: string
    name: string
    status: "pending" | "running" | "completed" | "error"
    timestamp: string
}
interface Research {
    id: number;
    topic: string;
    report: string;
}
function page() {
    const { id } = useParams();
    const [research, setResearch] = useState<Research>({ id: -1, topic: "", report: "" })
    const [topic, setTopic] = useState<string>("");
    const [logs, setLogs] = useState<StreamEvent[]>([])
    const [nodes, setNodes] = useState<StreamNode[]>([])
    const [report, setReport] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [researchLoading, setResearchLoading] = useState<boolean>(false)
    const loadResearch = async () => {
        setResearchLoading(true)
        const res = await getResearch(parseInt(id as string))
        if (res.success) {
            setResearch(res.research)
        }
        else {
            toast.error(res.message)
        }
        setResearchLoading(false)
    }
    useEffect(() => {
        loadResearch()
    }, [id])
    const handleGenerate = async () => {
        setLoading(true)
        const res = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ topic, id }),
        });
        if (!res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer: string = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            // 2. Decode the chunk and add it to our buffer
            buffer += decoder.decode(value, { stream: true });

            // 3. Split by newlines to handle independent JSON lines (NDJSON)
            const lines = buffer.split('\n');

            // Keep the last partial line in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                // If you are using Server-Sent Events (SSE), strip the "data: " prefix
                const cleanLine = trimmedLine.startsWith('data: ')
                    ? trimmedLine.replace('data: ', '')
                    : trimmedLine;

                if (cleanLine === '[DONE]') {
                    break; // Standard SSE close signal
                }

                try {
                    const parsedData = JSON.parse(cleanLine)

                    if (parsedData.operation === "node") {
                        if (parsedData.type === "node_start") {
                            setNodes(prevNodes => {
                                // Create unique ID: node_name + timestamp
                                const uniqueId = `${parsedData.node}-${parsedData.timestamp}`

                                // Check if this exact node already exists
                                const exists = prevNodes.find(n => n.id === uniqueId)

                                if (exists) {
                                    // Update existing node
                                    return prevNodes.map(n =>
                                        n.id === uniqueId
                                            ? { ...n, status: "running" }
                                            : n
                                    )
                                } else {
                                    // Add new node (parallel nodes with same name get different IDs)
                                    return [
                                        ...prevNodes,
                                        {
                                            id: uniqueId,
                                            name: parsedData.node,
                                            status: "running",
                                            timestamp: parsedData.timestamp
                                        }
                                    ]
                                }
                            })
                        }
                        else if (parsedData.type === "node_end") {
                            const uniqueId = `${parsedData.node}-${parsedData.timestamp}`
                            setNodes(prevNodes =>
                                prevNodes.map(n =>
                                    n.id === uniqueId
                                        ? { ...n, status: "completed" }
                                        : n
                                )
                            )
                        }
                    }
                    else if (parsedData.operation === "result") {
                        setReport(parsedData.result)
                    }
                    else { setLogs((prevLogs) => [...prevLogs, parsedData]); }
                } catch (err) {
                    console.error('Failed to parse JSON line:', cleanLine, err);
                }
            }
        }
        setLoading(false)
    }

    return (
        <div>
            <Card className="rounded-none relative">
            {
                researchLoading && <div className='h-screen w-full fixed inset-0 z-50 bg-background/70 text-foreground flex justify-center items-center  bg-opaccity-20 text-4xl'>
                    <HashLoader color="currentColor" size={70}/>
                </div>
            }
                <CardContent className="space-y-2">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            What would you like to research?
                        </h2>

                        <p className="text-sm text-muted-foreground mt-1">
                            Enter a topic, question, company, technology, or market.
                        </p>
                    </div>

                    <Textarea
                        value={(research?.topic) || topic}
                        disabled={(research?.report ? true : false) || (report ? true : false)}
                        maxLength={2000}

                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Example: Analyze the current state of open-source AI agents and compare LangGraph, CrewAI, and AutoGen."
                        className="min-h-26 max-h-50 overflow-y-auto resize-none text-base"
                    />

                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                            <Brain className="h-3 w-3 mr-1" />
                            Multi-Agent
                        </Badge>

                        <Badge variant="secondary">
                            <Globe className="h-3 w-3 mr-1" />
                            Web Research
                        </Badge>

                        <Badge variant="secondary">
                            Markdown Report
                        </Badge>
                    </div>

                    <div className="flex justify-end items-center">
                        <span className="text-xs text-muted-foreground px-2">
                            {"(min 15)  "}
                            {topic.length} / 2000
                        </span>

                        <Button
                            onClick={() => handleGenerate()}
                            size="lg"
                            disabled={loading || !topic.trim() || topic.length < 15 || research.report.length > 0}
                            className="gap-2 hover:scale-102 cursor-pointer duration-300"
                        >
                            <Sparkles className="h-4 w-4" />
                            Start Research
                            {
                                loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : <ArrowRight className="h-4 w-4" />
                            }
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {!research?.report &&
                <div className="grid gap-6 lg:grid-cols-3">
                    <NodeStream nodes={nodes}></NodeStream>
                    <AgentActivity logs={logs}></AgentActivity>
                </div>
            }
            <ResearchReport report={research?.report || report} isGenerating={loading} topic={research?.topic || topic}></ResearchReport>
        </div >
    )
}

export default page