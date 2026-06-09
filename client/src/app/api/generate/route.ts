import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { topic,id } = await req.json();
  
  const res = await fetch(
    `${process.env.FAST_API_URL}/generate-research`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic , id }),
    },
  );
  return new NextResponse(res.body, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
