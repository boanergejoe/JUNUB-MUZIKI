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
        <div className="flex h-full min-h-0 max-w-4xl mx-auto flex-col p-4 sm:p-6">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Account
                            </CardTitle>
                            <CardDescription>Manage your account settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="private-profile">Private Profile</Label>
                                <Switch id="private-profile" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="activity-status">Show Activity Status</Label>
                                <Switch id="activity-status" defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notifications
                            </CardTitle>
                            <CardDescription>Control your notification preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="push-notifications">Push Notifications</Label>
                                <Switch id="push-notifications" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email-updates">Email Updates</Label>
                                <Switch id="email-updates" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Privacy & Security
                            </CardTitle>
                            <CardDescription>Manage your privacy settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="data-collection">Allow Data Collection</Label>
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Downloads
                            </CardTitle>
                            <CardDescription>Download the app for offline use</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-zinc-400">
                                Install Junub Muziki as a Progressive Web App for offline access and better performance.
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    Install for Mobile
                                </Button>
                                <Button variant="outline">
                                    Install for Desktop
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><RotateCcw className="h-5 w-5" /> Taste profile</CardTitle>
                            <CardDescription>Clear local mood and listening preferences.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" onClick={resetTasteProfile}>Reset taste profile</Button>
                        </CardContent>
                    </Card>
                    <Footer />
                </div>
            </ScrollArea>
        </div>
    );
};

export default SettingsPage;