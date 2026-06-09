import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { research_id, query } = await req.json();

  const res = await fetch(`${process.env.FAST_API_URL}/research-QA`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ research_id, query }),
  });
  return new NextResponse(res.body, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
