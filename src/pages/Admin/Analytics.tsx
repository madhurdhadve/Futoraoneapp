import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from "recharts";

const engagementData = [
    { name: 'Mon', likes: 4000, comments: 2400, shares: 2400 },
    { name: 'Tue', likes: 3000, comments: 1398, shares: 2210 },
    { name: 'Wed', likes: 2000, comments: 9800, shares: 2290 },
    { name: 'Thu', likes: 2780, comments: 3908, shares: 2000 },
    { name: 'Fri', likes: 1890, comments: 4800, shares: 2181 },
    { name: 'Sat', likes: 2390, comments: 3800, shares: 2500 },
    { name: 'Sun', likes: 3490, comments: 4300, shares: 2100 },
];

const revenueData = [
    { name: 'Week 1', revenue: 4000 },
    { name: 'Week 2', revenue: 3000 },
    { name: 'Week 3', revenue: 5000 },
    { name: 'Week 4', revenue: 4500 },
];

const AnalyticsPage = () => {
    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Analytics Reports</h2>
                    <p className="text-muted-foreground mt-1">Detailed performance metrics and trends.</p>
                </div>

                <Tabs defaultValue="engagement" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="engagement">Engagement</TabsTrigger>
                        <TabsTrigger value="revenue">Revenue</TabsTrigger>
                        <TabsTrigger value="users">User Retention</TabsTrigger>
                    </TabsList>

                    <TabsContent value="engagement" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">12m 30s</div>
                                    <p className="text-xs text-muted-foreground">+10% from last week</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">4,321</div>
                                    <p className="text-xs text-muted-foreground">+5% from yesterday</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">42%</div>
                                    <p className="text-xs text-muted-foreground">-2% improvement</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>User Engagement Trends</CardTitle>
                                <CardDescription>Likes, Comments, and Shares over the last 7 days</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={engagementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                            <YAxis tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="likes" stroke="#8884d8" strokeWidth={2} />
                                            <Line type="monotone" dataKey="comments" stroke="#82ca9d" strokeWidth={2} />
                                            <Line type="monotone" dataKey="shares" stroke="#ffc658" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="revenue">
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                            <YAxis tickLine={false} axisLine={false} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                            <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default AnalyticsPage;
