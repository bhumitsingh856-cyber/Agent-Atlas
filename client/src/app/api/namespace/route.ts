import api from "@/service/api";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
    const { research_id,report } = await req.json();
    try{
        const res = await api.post("/create-namespace", { research_id ,report});
        return NextResponse.json(res.data);
    }
    catch(e){
        return NextResponse.json({success:false, message:"Failed to create namespace"});
    }
}