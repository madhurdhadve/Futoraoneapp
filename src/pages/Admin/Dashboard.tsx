import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/AdminLayout";
import {
    Users,
    TrendingUp,
    Activity,
    DollarSign,
    ArrowUpRight,
    CheckCircle,
    MoreHorizontal,
    FileText,
    Briefcase
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        userCount: 0,
        postCount: 0,
        projectCount: 0,
        revenue: 0 // Placeholder until monetization
    });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [growthData, setGrowthData] = useState<any[]>([]);
    const [verificationData, setVerificationData] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch counts
            const { count: userCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
            const { count: postCount } = await supabase.from("posts").select("*", { count: 'exact', head: true });
            const { count: projectCount } = await supabase.from("projects").select("*", { count: 'exact', head: true });

            // Fetch recent users
            const { data: users } = await supabase
                .from("profiles")
                .select("id, username, full_name, avatar_url, created_at, is_verified")
                .order("created_at", { ascending: false }); // Fetch all to aggregate for charts

            if (users) {
                setStats({
                    userCount: userCount || 0,
                    postCount: postCount || 0,
                    projectCount: projectCount || 0,
                    revenue: 0
                });

                // Recent users for table (top 5)
                setRecentUsers(users.slice(0, 5));

                // Aggregate User Growth (by month)
                const growthMap = new Map();
                users.forEach(user => {
                    const date = new Date(user.created_at);
                    const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' }); // e.g., "Jan 24"
                    growthMap.set(monthYear, (growthMap.get(monthYear) || 0) + 1);
                });

                // Convert map to array and reverse to show chronological order
                const growthChart = Array.from(growthMap, ([name, value]) => ({ name, users: value })).reverse();
                // If minimal data, pad with mock previous months or current month? 
                // For now, let's just show what we have. If < 2 points, maybe show at least current.
                if (growthChart.length === 0) {
                    const currentMonth = new Date().toLocaleString('default', { month: 'short', year: '2-digit' });
                    growthChart.push({ name: currentMonth, users: 0 });
                }
                setGrowthData(growthChart);

                // Aggregate Verification Stat
                const verifiedCount = users.filter(u => u.is_verified).length;
                const unverifiedCount = users.length - verifiedCount;
                setVerificationData([
                    { name: 'Verified', value: verifiedCount, color: '#22c55e' }, // Green
                    { name: 'Unverified', value: unverifiedCount, color: '#94a3b8' }, // Gray
                ]);
            }

        } catch (error) {
            console.error("Error fetching admin stats:", error);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                    <p className="text-muted-foreground mt-2">Welcome back! Real-time data from Supabase.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.userCount}</div>
                            <p className="text-xs text-green-500 flex items-center mt-1">
                                <ArrowUpRight className="w-3 h-3 mr-1" />
                                Live Data
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.projectCount}</div>
                            <p className="text-xs text-green-500 flex items-center mt-1">
                                <ArrowUpRight className="w-3 h-3 mr-1" />
                                Live Data
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.postCount}</div>
                            <p className="text-xs text-green-500 flex items-center mt-1">
                                <ArrowUpRight className="w-3 h-3 mr-1" />
                                Live Data
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.revenue}</div>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                                From DB (Pending)
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Main Chart */}
                    <Card className="col-span-4 shadow-sm">
                        <CardHeader>
                            <CardTitle>User Growth (New Users per Month)</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                        <XAxis dataKey="name" className="text-xs" tickLine={false} axisLine={false} />
                                        <YAxis className="text-xs" tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        />
                                        <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Stats */}
                    <Card className="col-span-3 shadow-sm">
                        <CardHeader>
                            <CardTitle>User Verification Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={verificationData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {verificationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-6 mt-4">
                                    {verificationData.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="text-sm text-muted-foreground">{entry.name} ({entry.value})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Users Table */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Users (Real Data)</CardTitle>
                        <Button variant="outline" size="sm">View All</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-primary font-bold">{user.username?.[0]?.toUpperCase() || "U"}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{user.full_name || user.username || "Unknown User"}</p>
                                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {user.is_verified && (
                                            <CheckCircle className="w-4 h-4 text-blue-500" />
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
