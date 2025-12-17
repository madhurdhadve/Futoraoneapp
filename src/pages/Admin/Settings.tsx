import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const SettingsPage = () => {
    return (
        <AdminLayout>
            <div className="space-y-6 max-w-4xl">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Settings</h2>
                    <p className="text-muted-foreground mt-1">Configure global application settings.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>General Configuration</CardTitle>
                        <CardDescription>Basic settings for the application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="site-name">Site Name</Label>
                            <Input id="site-name" defaultValue="Futora One" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="support-email">Support Email</Label>
                            <Input id="support-email" defaultValue="support@futoraone.com" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security & Privacy</CardTitle>
                        <CardDescription>Control access and data visibility.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Public Registration</Label>
                                <p className="text-sm text-muted-foreground">Allow new users to sign up.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Force 2FA for Admins</Label>
                                <p className="text-sm text-muted-foreground">Require two-factor authentication for admin entry.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Maintenance Mode</Label>
                                <p className="text-sm text-muted-foreground">Disable access for non-admin users.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Manage automated email alerts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>New User Alerts</Label>
                                <p className="text-sm text-muted-foreground">Receive email when a new user registers.</p>
                            </div>
                            <Switch />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Report Alerts</Label>
                                <p className="text-sm text-muted-foreground">Receive email when content is reported.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline">Reset Changes</Button>
                    <Button>Save Settings</Button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SettingsPage;
