import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DollarSign,
    CreditCard,
    Download,
    Filter,
    Search,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const FinancePage = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const fetchFinanceData = async () => {
        try {
            setLoading(true);

            // Fetch Transactions
            const { data: txData, error: txError } = await supabase
                .from("transactions")
                .select(`
                    *,
                    sender:sender_id(full_name, username),
                    receiver:receiver_id(full_name, username)
                `)
                .order("created_at", { ascending: false });

            if (txError) throw txError;
            setTransactions(txData || []);

            // Fetch Subscriptions
            const { data: subData, error: subError } = await supabase
                .from("subscriptions")
                .select(`
                    *,
                    profile:user_id(full_name, username, avatar_url)
                `)
                .order("created_at", { ascending: false });

            if (subError) throw subError;
            setSubscriptions(subData || []);

        } catch (error) {
            console.error("Error fetching finance data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
            case 'active':
                return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" /> {status}</Badge>;
            case 'failed':
            case 'cancelled':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Finance & Revenue</h2>
                        <p className="text-muted-foreground mt-1">Monitor transactions, fees, and subscription revenue.</p>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export Report
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$0.00</div>
                            <p className="text-xs text-muted-foreground mt-1">From fees & subscriptions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$0.00</div>
                            <p className="text-xs text-muted-foreground mt-1">To freelancers</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Founders Pro/Elite</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="transactions" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                        <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="transactions" className="space-y-4">
                        <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input placeholder="Search ID or user..." className="pl-10" />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>

                        <Card>
                            <CardHeader className="px-6 py-4">
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>All marketplace payments and subscription charges.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-6">ID</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Fee (2%)</TableHead>
                                            <TableHead>From / To</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right pr-6">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-6">Loading transactions...</TableCell>
                                            </TableRow>
                                        ) : transactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No transactions found.</TableCell>
                                            </TableRow>
                                        ) : (
                                            transactions.map((tx) => (
                                                <TableRow key={tx.id}>
                                                    <TableCell className="font-mono text-xs pl-6">{tx.id.slice(0, 8)}...</TableCell>
                                                    <TableCell className="capitalize">{tx.type.replace('_', ' ')}</TableCell>
                                                    <TableCell>${tx.amount}</TableCell>
                                                    <TableCell className="text-green-600">+${tx.platform_fee}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col text-xs">
                                                            <span className="text-muted-foreground">From: {tx.sender?.username || 'System'}</span>
                                                            <span>To: {tx.receiver?.username || 'Platform'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {new Date(tx.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        {getStatusBadge(tx.status)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="subscriptions" className="space-y-4">
                        <Card>
                            <CardHeader className="px-6 py-4">
                                <CardTitle>Founder Subscriptions</CardTitle>
                                <CardDescription>Active and past subscription plans.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-6">User</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>End Date</TableHead>
                                            <TableHead className="text-right pr-6">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-6">Loading subscriptions...</TableCell>
                                            </TableRow>
                                        ) : subscriptions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No subscriptions found.</TableCell>
                                            </TableRow>
                                        ) : (
                                            subscriptions.map((sub) => (
                                                <TableRow key={sub.id}>
                                                    <TableCell className="pl-6 font-medium">{sub.profile?.username || 'Unknown'}</TableCell>
                                                    <TableCell className="capitalize">{sub.plan_id.replace('_', ' ')}</TableCell>
                                                    <TableCell>{new Date(sub.current_period_start).toLocaleDateString()}</TableCell>
                                                    <TableCell>{new Date(sub.current_period_end).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        {getStatusBadge(sub.status)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default FinancePage;
