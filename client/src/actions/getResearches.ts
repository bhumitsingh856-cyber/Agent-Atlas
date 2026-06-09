"use server"
import { currentUser } from "@clerk/nextjs/server"
import api from "@/service/api";

export default async function getResearches() {
    const user = await currentUser();
    const clerk_id: string | undefined= user?.id;
    try {
        const res = await api.post("/get-researches", {
            clerk_id: clerk_id,
        });
        return JSON.parse(JSON.stringify(res.data));
    } catch (err) {
        return JSON.parse(JSON.stringify({success:false, message:"Something went wrong !"}))
    }
}