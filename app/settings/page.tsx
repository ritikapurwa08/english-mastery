"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Menu, Save, Flag } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";


export default function SettingsPage() {
    const user = useQuery(api.users.viewer);
    const updateGoal = useMutation(api.users.updateSettings);

    // Fallback if specific mutation missing: use a generic update or implement specific.
    // Assuming we'll add updateWeeklyGoal to convex/users.ts if needed, or reuse an existing one.
    // For now, let's assume `updateWeeklyGoal` will be created.

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [goal, setGoal] = useState("50");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user?.weeklyGoal) {
            setGoal(user.weeklyGoal.toString());
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateGoal({ weeklyGoal: parseInt(goal) });
            // Optionally show success toast
        } catch (e) {
            console.error("Failed to update goal", e);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading...</div>;

    const firstName = user.name?.split(' ')[0] || 'User';

    return (
        <div className="flex min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">
            <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
                    <div className="flex items-center lg:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </Button>
                    </div>

                    <h1 className="text-lg font-bold text-white hidden md:block">Settings</h1>

                    <div className="flex items-center space-x-4 ml-auto">
                        <Link href="/profile" className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                            {firstName.slice(0, 2)}
                        </Link>
                    </div>
                </header>

                <div className="flex-1 p-6 max-w-md mx-auto w-full space-y-8">

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-500 mb-2">
                             <Flag size={20} />
                             <h2 className="text-lg font-bold text-white">Learning Goals</h2>
                        </div>

                        <Card className="p-5 bg-zinc-900/40 border-zinc-800 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-zinc-400 mb-1.5 block">Weekly Word Goal</label>
                                <div className="flex gap-3">
                                    <Input
                                        type="number"
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        className="bg-zinc-900 border-zinc-700 focus:ring-indigo-500/50"
                                    />
                                    <Button
                                        variant="accent"
                                        onClick={handleSave}
                                        isLoading={isSaving}
                                        icon={Save}
                                    >
                                        Save
                                    </Button>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">
                                    Set a realistic target for how many new words you want to learn each week.
                                </p>
                            </div>
                        </Card>
                    </section>
                </div>
            </main>
        </div>
    );
}
