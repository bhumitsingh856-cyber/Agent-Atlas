import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { Copy, Check, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import mermaid from "mermaid"


mermaid.initialize({ startOnLoad: true, theme: "default" })

export function EnhancedMarkdown({ content}: { content: string}) {
    const [copied, setCopied] = useState<string | null>(null)

    useEffect(() => {
        mermaid.contentLoaded()
    }, [content])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(text)
        setTimeout(() => setCopied(null), 2000)
    }
    
    return (
        <>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Headings
                    h1: ({ node, ...props }) => (
                        <h1
                            className="text-4xl font-bold mt-8 mb-4 text-foreground border-b pb-2"
                            {...props}
                        />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2
                            className="text-3xl font-bold mt-7 mb-3 text-foreground border-b pb-2"
                            {...props}
                        />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 className="text-2xl font-semibold mt-6 mb-3 text-foreground" {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                        <h4 className="text-xl font-semibold mt-5 mb-2 text-foreground" {...props} />
                    ),

                    // Paragraphs
                    p: ({ node, ...props }) => (
                        <p className="text-base leading-relaxed mb-4 text-foreground/90" {...props} />
                    ),

                    // Code blocks (including Mermaid)
                    code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || "")
                        const lang = match ? match[1] : "text"
                        const codeString = String(children).replace(/\n$/, "")

                        // Mermaid diagrams
                        if (lang === "mermaid") {
                            return (
                                <div className="my-6 p-6 bg-white rounded-lg border border-border overflow-auto">
                                    <div className="mermaid">{codeString}</div>
                                </div>
                            )
                        }

                        // Regular code blocks
                        if (!inline) {
                            return (
                                <div className="relative my-6 rounded-lg overflow-hidden border border-border">
                                    <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b border-border">
                                        <span className="text-xs font-mono text-muted-foreground">
                                            {lang}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 px-2"
                                            onClick={() => copyToClipboard(codeString)}
                                        >
                                            {copied === codeString ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <SyntaxHighlighter
                                        language={lang}
                                        style={dracula}
                                        customStyle={{
                                            margin: 0,
                                            padding: "1rem",
                                            background: "transparent",
                                        }}
                                    >
                                        {codeString}
                                    </SyntaxHighlighter>
                                </div>
                            )
                        }

                        return (
                            <code
                                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
                                {...props}
                            >
                                {children}
                            </code>
                        )
                    },

                    // Images
                    img: ({ node, src, alt, ...props }: any) => (
                        <div className="my-6 flex flex-col gap-2">
                            <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
                                <img
                                    src={src}
                                    alt={alt}
                                    className="w-full h-auto max-h-96 object-cover"
                                    {...props}
                                />
                            </div>
                            {alt && (
                                <p className="text-sm text-muted-foreground text-center italic">
                                    {alt}
                                </p>
                            )}
                            <div className="flex gap-2">
                                <a href={src} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline">
                                        View Full Size
                                    </Button>
                                </a>
                            </div>
                        </div>
                    ),

                    // Lists
                    ul: ({ node, ...props }) => (
                        <ul className="list-disc list-inside space-y-2 mb-4 ml-2" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol className="list-decimal list-inside space-y-2 mb-4 ml-2" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <li className="text-base text-foreground/90" {...props} />
                    ),

                    // Links
                    a: ({ node, ...props }) => (
                        < a target="_blank"
                            className="text-blue-600 hover:text-blue-700 underline font-medium"
                            rel="noopener noreferrer"
                            {...props}
                        />
                    ),

                    // Blockquotes
                    blockquote: ({ node, ...props }) => (
                        <blockquote
                            className="border-l-4 border-blue-500 bg-blue-50/50 px-4 py-2 my-4 rounded-r-lg text-foreground/80 italic"
                            {...props}
                        />
                    ),

                    // Tables
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-6 border border-border rounded-lg">
                            <table className="w-full border-collapse text-sm" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => (
                        <thead className="bg-muted/50 border-b border-border" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                        <th
                            className="px-4 py-2 text-left font-semibold text-foreground border-b border-border"
                            {...props}
                        />
                    ),
                    td: ({ node, ...props }) => (
                        <td
                            className="px-4 py-2 border-b border-border text-foreground/90"
                            {...props}
                        />
                    ),

                    // Horizontal rule
                    hr: () => <hr className="my-6 border-border" />,

                    // Text styling
                    strong: ({ node, ...props }) => (
                        <strong className="font-bold text-foreground" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                        <em className="italic text-foreground/90" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown >
        </>
    )
}