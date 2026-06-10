"use client"

import { memo } from "react"
import { Sidebar, SidebarMenuButton, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroupLabel, SidebarTrigger, SidebarMenu, SidebarMenuItem } from "./ui/sidebar"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Plus, BookOpenText, Workflow } from "lucide-react"
import { ThemeToggle } from "./Theme-toggle"
import { UserButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { useResearchStore } from "@/store/zustand"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Loader, Loader2, Trash, Clock5 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog"
import Logo from "./Logo"
import createNewResearch from "@/actions/newResearch"
import Link from "next/link"
import deleteResearchById from "@/actions/deleteResearch"
function SideBar() {
    const { user } = useUser();
    const router = useRouter();
    const params = useParams();

    const [loading, setLoading] = useState<true | false>(false);
    const [showDelete, setShowDelete] = useState<true | false>(false);
    const [isDeleting, setIsDeleting] = useState<true | false>(false);
    
    const deleteResearch = useResearchStore(state => state.deleteResearch)
    const researches = useResearchStore(state => state.researches)
    const addResearch = useResearchStore(state => state.addResearch)
    const handleNewResearch = async () => {
        setLoading(true)
        try {
            const res = await createNewResearch()
            if (res.success) {
                addResearch(res.research)
                router.push(`/research/${res.research.id}`)
                toast.success(res.message)
            } else {
                toast.error(res.message)
            }
        } finally {
            setLoading(false)
        }
    }
    const handleDelete = async (id: number) => {
        setIsDeleting(true)
        try {
            const res = await deleteResearchById(id)
            if (res.success) {
                deleteResearch(id)
                setIsDeleting(false)
                toast.success(res.message)
            } else {
                toast.error(res.message)
            }
        } finally {
            setIsDeleting(false)
            setShowDelete(false)
        }
    }
    return (
        <Sidebar collapsible="offcanvas" className="">
            <SidebarHeader>
                <Logo></Logo>
                <Button disabled={loading} onClick={() => { handleNewResearch() }} className={`${loading ? "cursor-not-allowed" : "cursor-pointer"} hover:scale-102`}>
                    {
                        loading ? (<div className="flex gap-2 items-center">Creating Thread<Loader2 className="animate-spin" /></div>) : (
                            <div className="flex  gap-2">
                                <Plus></Plus>New Thread
                            </div>
                        )
                    }
                </Button>

            </SidebarHeader>
            <hr />
            <SidebarContent>
                <SidebarGroupLabel className="flex gap-2 items-center">Recent Researches<Clock5 /></SidebarGroupLabel>
                <br />
                <SidebarMenu className="p-1">
                    {
                        researches.length === 0 && <h1 className=" justify-center flex items-center gap-2 mt-12 font-black"><Workflow></Workflow>No Researches Found</h1>
                    }
                    {
                        researches.map((e) => (
                            <SidebarMenuItem key={e.id} className="flex items-center">
                                <SidebarMenuButton className={`mb-2 ${params.id == (e.id).toString() && "border-l-4 border-b-4"} rounded-sm py-6 shadow-2xl`}>
                                    <Link href={`/research/${e.id}`}>
                                        <div className="flex gap-4 items-center ">
                                            <BookOpenText className="w-4 h-4" />
                                            <div className="flex flex-col line-clamp-1">
                                                <h1 className="line-clamp-1 ">
                                                    {e.topic.length == 0 ? "Untitled" : e.topic}
                                                </h1>
                                                <span className="text-[15px] opacity-50">{new Date(e.createdAt + 'Z').toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="flex items-center text-xl cursor-pointer pb-1">⋮</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-40" align="start">

                                        <DropdownMenuItem className="cursor-pointer" onClick={() => setShowDelete(true)} variant="destructive"><Trash></Trash>{" "}Delete Research</DropdownMenuItem>

                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialog open={showDelete}>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your research
                                                from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="cursor-pointer" disabled={isDeleting} onClick={() => { setShowDelete(false) }}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction className="cursor-pointer" disabled={isDeleting} variant="destructive" onClick={(a) => { handleDelete(e.id); a.preventDefault(); }}>{isDeleting ? <span className="flex items-center gap-2">Deleting <Loader className="animate-spin" /></span> : <span>Confirm</span>}</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </SidebarMenuItem>
                        ))
                    }

                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="bg-background rounded-sm">
                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <UserButton></UserButton>
                        <span>{user?.fullName}</span>
                    </div>
                    <ThemeToggle></ThemeToggle>
                </div>
            </SidebarFooter>
        </Sidebar>

    )
}

export default memo(SideBar)