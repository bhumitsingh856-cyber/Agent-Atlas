"use server";
import { currentUser } from "@clerk/nextjs/server";
import api from "@/service/api";
export default async function createUser() {
  const user = await currentUser();

  const clerk_id: string | undefined = user?.id;
  try {
    const res = await api.post("/create-user", {
      name: user?.fullName,
      email: user?.emailAddresses[0].emailAddress,
      clerk_id: clerk_id,
    });
    return res.data;
  } catch (err) {
    console.log(err);
  }
}
