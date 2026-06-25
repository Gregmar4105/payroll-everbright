import { Head } from '@inertiajs/react';
import { BarChart3, TrendingUp, Users, Clock, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Analytics() {
    return (
        <>
            <Head title="Payroll Analytics" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Payroll Analytics</h1>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Deep dive into Everbright Net & Twine's payroll costs, headcounts, and overtime trends.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                            <RefreshCw className="h-3.5 w-3.5" /> Sync Data
                        </Button>
                        <Button size="sm" className="bg-primary text-primary-foreground">
                            Export PDF Report
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-emerald-100 dark:border-emerald-950 bg-card/70 dark:bg-neutral-900/50 backdrop-blur-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Payroll Cost</CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">₱4,821,450.80</div>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-1">
                                <ArrowUpRight className="h-3 w-3" /> +2.4% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-100 dark:border-emerald-950 bg-card/70 dark:bg-neutral-900/50 backdrop-blur-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active Employees</CardTitle>
                            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">342</div>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-1">
                                <ArrowUpRight className="h-3 w-3" /> +5 new members this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-100 dark:border-emerald-950 bg-card/70 dark:bg-neutral-900/50 backdrop-blur-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Average Overtime Cost</CardTitle>
                            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">₱340,120.50</div>
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-0.5 mt-1">
                                <ArrowUpRight className="h-3 w-3" /> +12.1% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-100 dark:border-emerald-950 bg-card/70 dark:bg-neutral-900/50 backdrop-blur-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Tax Deductions</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">₱824,310.20</div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-0.5 mt-1">
                                Stable month-on-month variance
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 border-neutral-200/60 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Monthly Cost Trend</CardTitle>
                            <CardDescription>Visual breakdown of payroll costs over the past 6 months.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-end justify-between gap-2 pt-4 px-6 pb-2">
                            {/* Monthly Bar Charts */}
                            {[
                                { month: 'Jan', cost: '₱4.2M', height: '60%' },
                                { month: 'Feb', cost: '₱4.3M', height: '65%' },
                                { month: 'Mar', cost: '₱4.5M', height: '75%' },
                                { month: 'Apr', cost: '₱4.6M', height: '80%' },
                                { month: 'May', cost: '₱4.7M', height: '88%' },
                                { month: 'Jun', cost: '₱4.8M', height: '95%' },
                            ].map((item) => (
                                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 rounded-t-lg transition-all duration-300 relative group flex items-end justify-center" style={{ height: item.height }}>
                                        <div className="w-full bg-emerald-500 dark:bg-emerald-400 rounded-t-lg" style={{ height: '30%' }}></div>
                                        <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-neutral-900 text-white text-xs px-2 py-1 rounded shadow-lg transition-transform duration-200">{item.cost}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{item.month}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="col-span-3 border-neutral-200/60 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Department Distribution</CardTitle>
                            <CardDescription>Payroll cost share by business function.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {[
                                { name: 'Manufacturing (Factory Floor)', amount: '₱2,145,000', percentage: '44.5%', color: 'bg-emerald-500' },
                                { name: 'Logistics & Supply Chain', amount: '₱1,050,000', percentage: '21.8%', color: 'bg-teal-500' },
                                { name: 'Administration & HR', amount: '₱830,000', percentage: '17.2%', color: 'bg-lime-500' },
                                { name: 'Sales & Distribution', amount: '₱796,450', percentage: '16.5%', color: 'bg-emerald-600' },
                            ].map((dept) => (
                                <div key={dept.name} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-neutral-700 dark:text-neutral-300">{dept.name}</span>
                                        <span className="font-semibold text-neutral-900 dark:text-white">{dept.amount} ({dept.percentage})</span>
                                    </div>
                                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${dept.color}`} style={{ width: dept.percentage }}></div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Analytics.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Analytics', href: '/dashboard/analytics' },
    ],
};
