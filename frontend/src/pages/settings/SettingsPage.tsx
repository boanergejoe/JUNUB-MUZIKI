import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Bell, Shield, Download, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";

const SettingsPage = () => {
    const resetTasteProfile = () => {
        localStorage.removeItem("junub-muziki-taste-profile");
        toast.success("Taste profile reset");
    };

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col bg-gradient-to-b from-zinc-950 to-zinc-900 px-3 py-4 sm:mx-auto sm:max-w-4xl sm:px-6 sm:py-6">
            <div className="mb-5 border-b border-zinc-800 pb-5 sm:mb-7">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Account centre</p>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="mt-2 max-w-xl text-sm text-zinc-400">Shape your listening experience, privacy, and notification preferences.</p>
            </div>

            <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-4 sm:space-y-5">
                    <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl shadow-black/10">
                        <CardHeader className="border-b border-zinc-800/80 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Account
                            </CardTitle>
                            <CardDescription>Manage your account settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1 pt-4">
                            <div className="flex min-h-12 items-center justify-between gap-4 rounded-lg px-3 py-2 transition hover:bg-zinc-800/60">
                                <Label htmlFor="private-profile" className="cursor-pointer">Private Profile</Label>
                                <Switch id="private-profile" />
                            </div>
                            <div className="flex min-h-12 items-center justify-between gap-4 rounded-lg px-3 py-2 transition hover:bg-zinc-800/60">
                                <Label htmlFor="activity-status" className="cursor-pointer">Show Activity Status</Label>
                                <Switch id="activity-status" defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl shadow-black/10">
                        <CardHeader className="border-b border-zinc-800/80 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notifications
                            </CardTitle>
                            <CardDescription>Control your notification preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1 pt-4">
                            <div className="flex min-h-12 items-center justify-between gap-4 rounded-lg px-3 py-2 transition hover:bg-zinc-800/60">
                                <Label htmlFor="push-notifications" className="cursor-pointer">Push Notifications</Label>
                                <Switch id="push-notifications" defaultChecked />
                            </div>
                            <div className="flex min-h-12 items-center justify-between gap-4 rounded-lg px-3 py-2 transition hover:bg-zinc-800/60">
                                <Label htmlFor="email-updates" className="cursor-pointer">Email Updates</Label>
                                <Switch id="email-updates" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl shadow-black/10">
                        <CardHeader className="border-b border-zinc-800/80 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Privacy & Security
                            </CardTitle>
                            <CardDescription>Manage your privacy settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                            <div className="flex min-h-12 items-center justify-between gap-4 rounded-lg px-3 py-2 transition hover:bg-zinc-800/60">
                                <Label htmlFor="data-collection" className="cursor-pointer">Allow Data Collection</Label>
                                <Switch id="data-collection" defaultChecked />
                            </div>
                            <div className="space-y-2">
                                <Label>Playback Quality</Label>
                                <Select defaultValue="high">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low (96 kbps)</SelectItem>
                                        <SelectItem value="medium">Medium (160 kbps)</SelectItem>
                                        <SelectItem value="high">High (320 kbps)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl shadow-black/10">
                        <CardHeader className="border-b border-zinc-800/80 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Downloads
                            </CardTitle>
                            <CardDescription>Download the app for offline use</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <p className="text-sm text-zinc-400">
                                Install Junub Muziki as a Progressive Web App for offline access and better performance.
                            </p>
                            <div className="grid gap-2 sm:flex">
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Install for Mobile
                                </Button>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Install for Desktop
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl shadow-black/10">
                        <CardHeader className="border-b border-zinc-800/80 pb-4">
                            <CardTitle className="flex items-center gap-2"><RotateCcw className="h-5 w-5" /> Taste profile</CardTitle>
                            <CardDescription>Clear local mood and listening preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Button variant="outline" className="w-full sm:w-auto" onClick={resetTasteProfile}>Reset taste profile</Button>
                        </CardContent>
                    </Card>
                    <Footer />
                </div>
            </ScrollArea>
        </div>
    );
};

export default SettingsPage;