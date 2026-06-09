"use client";
import { useEffect } from 'react';
import SideBar from '@/components/Sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useResearchStore } from '@/store/zustand';
import getResearches from "@/actions/getResearches"
import { Toaster } from '@/components/ui/sonner';
import { toast } from "sonner"
export default function Layout({ children }: Readonly<{ children: React.ReactNode; }>) {

    const setResearches = useResearchStore(state => state.setResearches)
    const loadResearches = async () => {
        const res = await getResearches()
        if (res.success) {
            setResearches(res.researches)
        }
        else{
            toast.error(res.message)
        }
    }
    useEffect(() => {
        loadResearches()
    }, [])

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <header >
                    <SideBar />
                </header>
                <SidebarTrigger className='fixed top-0 z-20 '></SidebarTrigger>
                <main className="overflow-y-auto flex-1">
                    {children}
                    <Toaster />
                </main>
            </div>
        </SidebarProvider>
    )
}
