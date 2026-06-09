"use server"
import { currentUser } from "@clerk/nextjs/server"
import api from "@/service/api"
export default async function createNewResearch() {
    const user = await currentUser();
    const clerk_id: string | undefined= user?.id;
    try{

        const res = await api.post("/new-research", {
            clerk_id: clerk_id,
        });
        return JSON.parse(JSON.stringify(res.data));
    }catch(e){
        return JSON.parse(JSON.stringify({success:false, message:"Something went wrong while creating new Thread !"}));
    }
    
}