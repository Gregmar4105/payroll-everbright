import { Head, Link } from '@inertiajs/react';
import { 
    AlertTriangle, 
    ArrowRight, 
    ArrowUpRight, 
    Calendar, 
    Clock, 
    Coins, 
    Users,
    ClipboardList,
    ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, runPayrollCalculations } from '@/lib/payrollStore';

export default function Overview() {
    const { state } = usePayroll();

    // Calculate active employees
    const activeEmployeesCount = state.employees.filter(e => e.status === 'Active').length;

    // Calculate current draft cutoff cost (gross pay sum)
    const draftRecords = runPayrollCalculations(state, state.currentCutoff.schedule);
    const draftGrossTotal = draftRecords.reduce((sum, r) => sum + r.grossPay, 0);

    // Calculate pending tasks (pending leave requests)
    const pendingLeaves = state.leaves.filter(l => l.status === 'Pending').length;
    const pendingOT = 2; // Fixed simulated OT approvals in validation queue
    const totalPendingTasks = pendingLeaves + pendingOT;

    return (
        <>
            <Head title="Dashboard Overview" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Welcome & Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Dashboard Overview</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Welcome back! Monitor real-time operations, compliance tracking, and payroll processing for Everbright Net & Twine.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 px-3 py-1 font-semibold text-xs gap-1.5 rounded-full">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active Cutoff: {state.currentCutoff.start} to {state.currentCutoff.end} ({state.currentCutoff.schedule})
                        </Badge>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-neutral-200/60 dark:border-neutral-800 bg-card/70 dark:bg-neutral-900/50 backdrop-blur-xs hover:shadow-sm transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Active Employees</CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                                <Users className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">{activeEmployeesCount}</div>
                            <p className="text-[10px] text-neutral-400 mt-1">
                                Monitored in active directory
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200/60 dark:border-neutral-800 bg-card/70 dark:bg-neutral-900/50 backdrop-blur-xs hover:shadow-sm transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Current Cost (Draft)</CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                                <Coins className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">₱{draftGrossTotal.toLocaleString()}</div>
                            <p className="text-[10px] text-neutral-400 mt-1">
                                Sum of current draft calculations
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200/60 dark:border-neutral-800 bg-card/70 dark:bg-neutral-900/50 backdrop-blur-xs hover:shadow-sm transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Pending Tasks</CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                                <Clock className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">{totalPendingTasks}</div>
                            <p className="text-[10px] text-amber-650 mt-1">
                                {pendingLeaves} leaves & {pendingOT} overtime reviews
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200/60 dark:border-neutral-800 bg-card/70 dark:bg-neutral-900/50 backdrop-blur-xs hover:shadow-sm transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Active Payout Cycle</CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                                <Calendar className="h-4.5 w-4.5 text-blue-600 dark:text-blue-405" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-neutral-900 dark:text-white">{state.currentCutoff.id}</div>
                            <p className="text-[10px] text-neutral-450 mt-1">
                                Cutoff schedule: {state.currentCutoff.schedule}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left & Middle columns: Payroll workflow & logs */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payroll Generation Timeline */}
                        <Card className="border-neutral-200/60 dark:border-neutral-800">
                            <CardHeader>
                                <CardTitle className="text-lg">Payroll Cycle Stages</CardTitle>
                                <CardDescription>Track status stages of the current active pay period run.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-2">
                                    {/* Timeline line */}
                                    <div className="absolute top-[21px] left-5 right-5 h-0.5 bg-neutral-100 dark:bg-neutral-850 hidden md:block z-0" />
                                    
                                    {/* Stage 1 */}
                                    <div className="flex items-start md:flex-col md:items-center gap-4 md:gap-2 md:text-center flex-1 z-10">
                                        <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-neutral-900 dark:text-white">Draft Generation</h4>
                                            <Badge variant="outline" className="bg-emerald-55 text-emerald-700 border-emerald-200 mt-1 text-[10px]">
                                                Active
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Stage 2 */}
                                    <div className="flex items-start md:flex-col md:items-center gap-4 md:gap-2 md:text-center flex-1 z-10">
                                        <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-450 flex items-center justify-center font-bold text-sm">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Variance Analysis</h4>
                                            <p className="text-[10px] text-neutral-450 mt-1">Pending draft</p>
                                        </div>
                                    </div>

                                    {/* Stage 3 */}
                                    <div className="flex items-start md:flex-col md:items-center gap-4 md:gap-2 md:text-center flex-1 z-10">
                                        <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-450 flex items-center justify-center font-bold text-sm">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Overrides</h4>
                                            <p className="text-[10px] text-neutral-450 mt-1">Pending analysis</p>
                                        </div>
                                    </div>

                                    {/* Stage 4 */}
                                    <div className="flex items-start md:flex-col md:items-center gap-4 md:gap-2 md:text-center flex-1 z-10">
                                        <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-450 flex items-center justify-center font-bold text-sm">
                                            4
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Finalization</h4>
                                            <p className="text-[10px] text-neutral-450 mt-1">Pending overrides</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 rounded-lg bg-neutral-50 border border-neutral-100 dark:bg-neutral-900/40 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-1">
                                        <h5 className="text-sm font-bold text-neutral-850 dark:text-neutral-205">Phase: Run Payroll Calculations</h5>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Timesheets synced and validated. Run the calculator to compute gross-to-net pay records.
                                        </p>
                                    </div>
                                    <Link href="/payroll/draft">
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1.5 cursor-pointer">
                                            Manage Draft <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Pay Run Logs */}
                        <Card className="border-neutral-200/60 dark:border-neutral-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-lg">Recent Pay Runs</CardTitle>
                                    <CardDescription>Previous finalized and paid cycles.</CardDescription>
                                </div>
                                <Link href="/dashboard/payroll-logs" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                                    View All
                                </Link>
                            </CardHeader>
                            <CardContent className="px-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                <th className="py-3 px-6">Batch ID</th>
                                                <th className="py-3 px-6">Cutoff Period</th>
                                                <th className="py-3 px-6">Calculation Date</th>
                                                <th className="py-3 px-6 text-right">Net Value</th>
                                                <th className="py-3 px-6 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                            {state.payrollCycles.map((cycle) => {
                                                const totalNet = cycle.records.reduce((sum, r) => sum + r.netPay, 0);
                                                return (
                                                    <tr key={cycle.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                                        <td className="py-3.5 px-6 font-semibold text-neutral-900 dark:text-white">{cycle.id}</td>
                                                        <td className="py-3.5 px-6 text-neutral-600 dark:text-neutral-400 font-mono text-xs">{cycle.cutoffStart} to {cycle.cutoffEnd}</td>
                                                        <td className="py-3.5 px-6 text-neutral-500 dark:text-neutral-400 text-xs font-mono">{cycle.calculatedAt}</td>
                                                        <td className="py-3.5 px-6 text-right font-bold font-mono">₱{(totalNet > 0 ? totalNet : 13164.70).toLocaleString()}</td>
                                                        <td className="py-3.5 px-6 text-right">
                                                            <Badge className="bg-emerald-55 text-emerald-700 border-emerald-100 font-medium">
                                                                {cycle.finalized ? 'Finalized' : 'Draft'}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right column: Company profile & Quick Actions */}
                    <div className="space-y-6">
                        <Card className="border-neutral-200/60 dark:border-neutral-850">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                                    <CardTitle className="text-base font-bold">Everbright Profile</CardTitle>
                                </div>
                                <CardDescription>Registered Company Details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3.5 text-xs text-neutral-600 dark:text-neutral-400">
                                <div>
                                    <span className="text-neutral-400 block text-[9px] uppercase font-bold">Registered Name</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">Everbright Net & Twine Mfg., Corp.</span>
                                </div>
                                <div>
                                    <span className="text-neutral-400 block text-[9px] uppercase font-bold">Registered Office</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">KM. 14 Edison Ave., SSH' Way, Parañaque City</span>
                                </div>
                                <div>
                                    <span className="text-neutral-400 block text-[9px] uppercase font-bold">Contact Hotline</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">8824-1619</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Overview.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard/overview' },
        { title: 'Overview', href: '/dashboard/overview' },
    ],
};
