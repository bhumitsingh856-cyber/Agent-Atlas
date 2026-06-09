"use server"
import api from "@/service/api"
export default async function deleteResearchById(id:number){
    try{
        const res=await api.post("/delete-research", {research_id:id});
        return JSON.parse(JSON.stringify(res.data));
    }catch(err){
        return JSON.parse(JSON.stringify({success:false, message:"Something went wrong while deleting !"}))
    }   
}