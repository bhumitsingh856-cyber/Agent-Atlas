"use server";
import api from "@/service/api";

export default async function getResearch(id: number) {
  try {
    const res = await api.post("/get-research", {
      research_id: id,
    });
    return JSON.parse(JSON.stringify(res.data));
  } catch (err) {
    return JSON.parse(
      JSON.stringify({ success: false, message: "Failed to fetch !" }),
    );
  }
}
