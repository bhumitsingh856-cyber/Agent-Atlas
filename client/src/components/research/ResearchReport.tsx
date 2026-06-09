"use client";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import { useResearchStore } from "@/store/zustand";
import axios from "axios";
import {
    FileText,
    Download,
    Share2,
    Maximize2,
    Loader2,
    Sparkles
} from "lucide-react";
import { EnhancedMarkdown } from "./Markdown";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface ResearchReportProps {
    topic?: string;
    report?: string;
    isGenerating?: boolean;
}

export default function ResearchReport({
    topic,
    report,
    isGenerating = false,
}: ResearchReportProps) {
    const isEmpty = !report?.trim();
    const [preview, setPreview] = useState<boolean>(false);
    const [exporting, setExporting] = useState<boolean>(false)
    const [cn, setCn] = useState<boolean>(false)
    const setQAReport = useResearchStore((state)=>state.setQAReport)
    const router = useRouter()
    const { id } = useParams();

    const handleExport = async () => {
        setExporting(true)
        try {
            const element = document.getElementById("report")
            const res = await axios.post("/api/export", {
                html: element?.innerHTML,
                filename: topic
            }, { responseType: "blob" })
            const url = URL.createObjectURL(res.data)
            const link = document.createElement("a")
            link.href = url
            link.download = `${topic}.pdf`
            link.click()
            URL.revokeObjectURL(url)
            toast.success("PDF exported successfully!")
        } catch (error) {
            toast.error("Failed to export PDF")
        } finally {
            setExporting(false)
        }
    }
    const handleQA = async () => {
        setCn(true)
        try {
            const res = await axios.post("/api/namespace", { research_id: id, report: report });
            if (res.data.success) {
                setQAReport(report)
                router.push(`/researchQA/${id}`)
                toast.success(res.data.message)
            }
            else {
                toast.error(res.data.message)
            }
        }
        catch (error) {
            toast.error("Failed to create namespace")
        }
        finally {
            setCn(false)
        }
    }

    return (<Card className={`${preview && "inset-0 fixed z-50"} rounded-none `}> <CardHeader className="flex flex-row items-center justify-between"> <div className="flex items-center gap-3"> <CardTitle>Research Report</CardTitle>

        {isGenerating && (
            <Badge variant="secondary">
                Generating...
            </Badge>
        )}
    </div>

        <div className="flex items-center gap-2">
            <div className="bg-linear-to-r rounded-lg p-[1px] from-yellow-500 via-red-500 to-violet-600">
                <Button disabled={!report || cn} onClick={() => handleQA()} size="sm" variant="secondary" className="">
                    {
                        cn ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )
                            : (

                                <Sparkles></Sparkles>
                            )
                    }
                    Report QA
                </Button>
            </div>
            <Button onClick={() => handleExport()} variant="outline" size="sm" disabled={exporting}>
                {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Download className="h-4 w-4" />
                )}
            </Button>

            <Button onClick={() => toast.warning("Coming Soon !")} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
            </Button>

            <Button onClick={() => setPreview(!preview)} variant="outline" size="sm">
                <Maximize2 className="h-4 w-4" />
            </Button>
        </div>
    </CardHeader>

        <CardContent>
            {isEmpty ? (
                <div className="h-[500px] border rounded-xl flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <FileText className="h-14 w-14 mx-auto text-muted-foreground" />

                        <h3 className="text-xl font-semibold">
                            Your research report will appear here
                        </h3>

                        <p className="text-muted-foreground max-w-md">
                            The report is being generated in real-time.
                            You can follow the progress in the agent
                            stream and logs above.
                        </p>
                    </div>
                </div>
            ) : (
                <ScrollArea className="h-[700px] rounded-xl border p-6">
                    <article id="report" className="prose prose-neutral dark:prose-invert max-w-none">
                        <EnhancedMarkdown content={report} topic={topic} />
                    </article>
                </ScrollArea>
            )}
        </CardContent>
    </Card>


    );
}
