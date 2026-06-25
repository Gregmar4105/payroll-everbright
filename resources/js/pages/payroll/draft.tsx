import { Head } from '@inertiajs/react';
import { RefreshCw, Play, CheckCircle, Clock, ChevronRight, Coins, Percent, FileText } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, CalculatedPayrollRecord } from '@/lib/payrollStore';

export default function Draft() {
    const { state, runCalculation, finalizePayrollCycle } = usePayroll();
    const [calculating, setCalculating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [calcResults, setCalcResults] = useState<CalculatedPayrollRecord[] | null>(null);

    const canModify = state.userRole === 'System Admin' || state.userRole === 'Payroll Officer';

    const handleRunCalculations = () => {
        if (!canModify) return;
        setCalculating(true);
        setCalcResults(null);
        setProgress(10);
        
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 30;
            });
        }, 300);

        setTimeout(() => {
            const results = runCalculation();
            setCalcResults(results);
            setCalculating(false);
        }, 1200);
    };

    // Calculate totals
    const totalGross = calcResults?.reduce((sum, r) => sum + r.grossPay, 0) || 0;
    const totalTax = calcResults?.reduce((sum, r) => sum + r.withholdingTax, 0) || 0;
    const totalSSS = calcResults?.reduce((sum, r) => sum + r.sssDeduct, 0) || 0;
    const totalPHIC = calcResults?.reduce((sum, r) => sum + r.phicDeduct, 0) || 0;
    const totalHDMF = calcResults?.reduce((sum, r) => sum + r.hdmfDeduct, 0) || 0;
    const totalUnion = calcResults?.reduce((sum, r) => sum + r.unionDuesDeduct, 0) || 0;
    const totalLoans = calcResults?.reduce((sum, r) => sum + r.totalLoanDeduct, 0) || 0;
    const totalNet = calcResults?.reduce((sum, r) => sum + r.netPay, 0) || 0;

    return (
        <>
            <Head title="Draft Payroll Generation" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Draft Payroll Generation</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Run and process calculations for the current payroll cutoff.
                        </p>
                    </div>
                </div>

                {/* Processing Steps */}
                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        { num: '01', title: 'Timesheet Sync', desc: 'Sync biometric clockings.', status: state.attendance.length > 0 ? 'Completed' : 'Pending' },
                        { num: '02', title: 'Adjustments & Overrides', desc: 'Retro pay & deductions.', status: 'Completed' },
                        { num: '03', title: 'Calculations Run', desc: 'Gross-to-net processor.', status: calcResults ? 'Completed' : calculating ? 'In Progress' : 'Pending' },
                        { num: '04', title: 'Variance & Locking', desc: 'Authorize and generate.', status: 'Pending' },
                    ].map((step) => (
                        <Card key={step.num} className={`
                            border-neutral-200/60 dark:border-neutral-800
                            ${step.status === 'In Progress' && 'ring-1 ring-emerald-500/50 border-emerald-500/50'}
                        `}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black text-emerald-600/20 dark:text-emerald-500/10">{step.num}</span>
                                    <Badge className={`
                                        font-medium text-[10px]
                                        ${step.status === 'Completed' && 'bg-emerald-50 text-emerald-700 border-emerald-100'}
                                        ${step.status === 'In Progress' && 'bg-emerald-500 text-white border-transparent animate-pulse'}
                                        ${step.status === 'Pending' && 'bg-neutral-100 text-neutral-450 border-neutral-200'}
                                    `}>
                                        {step.status}
                                    </Badge>
                                </div>
                                <CardTitle className="text-sm font-bold text-neutral-900 dark:text-white mt-1">{step.title}</CardTitle>
                                <CardDescription className="text-[11px]">{step.desc}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* Calculation Processor Area */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Payroll Calculation Engine</CardTitle>
                        <CardDescription>Initiate global calculations for active employees under schedule.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100 dark:bg-neutral-900/40 dark:border-neutral-800 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-xs">
                                <div>
                                    <span className="text-neutral-400 block text-[10px] uppercase">Active Cutoff Batch:</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{state.currentCutoff.id} ({state.currentCutoff.schedule})</span>
                                </div>
                                <div>
                                    <span className="text-neutral-400 block text-[10px] uppercase">Cutoff Span:</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">{state.currentCutoff.start} to {state.currentCutoff.end}</span>
                                </div>
                                <div>
                                    <span className="text-neutral-400 block text-[10px] uppercase">Employees in Cycle:</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                        {state.employees.filter(e => e.paySchedule === state.currentCutoff.schedule && e.status === 'Active').length} Active
                                    </span>
                                </div>
                                <div>
                                    <span className="text-neutral-400 block text-[10px] uppercase">Tax Rules:</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">TRAIN Law progressive brackets</span>
                                </div>
                            </div>
                        </div>

                        {calculating && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-neutral-500">
                                    <span>Running tax and overtime algorithms...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-850">
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <Clock className="h-4 w-4 text-neutral-400" />
                                <span>Last run: June 18, 2026 by Maria Santos (HR)</span>
                            </div>
                            <div className="flex gap-2">
                                {canModify ? (
                                    <Button onClick={handleRunCalculations} disabled={calculating} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 h-9 font-semibold">
                                        <Play className="h-4 w-4" /> Run Payroll Calculator <ChevronRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 px-3 py-1.5 text-xs">
                                        Calculation limited to Payroll Master role ({state.userRole})
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Calculation Results Summary */}
                {calcResults && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Summary Numbers */}
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                            <Card className="border-neutral-200/60 dark:border-neutral-850">
                                <CardHeader className="p-4 pb-2">
                                    <CardDescription className="text-[10px] uppercase font-bold text-neutral-400">Total Gross Payout</CardDescription>
                                    <CardTitle className="text-xl font-bold font-mono">₱{totalGross.toLocaleString()}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="border-neutral-200/60 dark:border-neutral-850">
                                <CardHeader className="p-4 pb-2">
                                    <CardDescription className="text-[10px] uppercase font-bold text-neutral-400">Total Tax Withheld</CardDescription>
                                    <CardTitle className="text-xl font-bold font-mono text-rose-600">₱{totalTax.toLocaleString()}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="border-neutral-200/60 dark:border-neutral-850">
                                <CardHeader className="p-4 pb-2">
                                    <CardDescription className="text-[10px] uppercase font-bold text-neutral-400">Total Premium + Loans</CardDescription>
                                    <CardTitle className="text-xl font-bold font-mono text-rose-600">₱{(totalSSS + totalPHIC + totalHDMF + totalUnion + totalLoans).toLocaleString()}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="border-neutral-250 bg-emerald-50/10 dark:border-emerald-950 dark:bg-emerald-950/10">
                                <CardHeader className="p-4 pb-2">
                                    <CardDescription className="text-[10px] uppercase font-bold text-emerald-600">Total Net Payout</CardDescription>
                                    <CardTitle className="text-xl font-bold font-mono text-emerald-600">₱{totalNet.toLocaleString()}</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>

                        {/* Detailed Calculation Grid */}
                        <Card className="border-neutral-200/60 dark:border-neutral-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-lg">Calculations Register</CardTitle>
                                    <CardDescription>Breakdown values for active employees in cutoff.</CardDescription>
                                </div>
                                <Button 
                                    onClick={() => {
                                        finalizePayrollCycle(calcResults);
                                        setCalcResults(null);
                                        alert('Successfully locked and finalized payroll cycle! Loan outstanding balances were adjusted.');
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1"
                                >
                                    <CheckCircle className="h-4 w-4" /> Authorize & Finalize Payouts
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 font-semibold text-neutral-500 uppercase tracking-wider">
                                                <th className="py-3.5 px-6">Employee</th>
                                                <th className="py-3.5 px-3 text-right">Basic Pay</th>
                                                <th className="py-3.5 px-3 text-right">Allowance</th>
                                                <th className="py-3.5 px-3 text-right">OT Pay</th>
                                                <th className="py-3.5 px-3 text-right">NSD Pay</th>
                                                <th className="py-3.5 px-3 text-right">Holiday Pay</th>
                                                <th className="py-3.5 px-3 text-right">Gross Pay</th>
                                                <th className="py-3.5 px-3 text-right">Deductions</th>
                                                <th className="py-3.5 px-3 text-right">W/Tax</th>
                                                <th className="py-3.5 px-3 text-right">Loans</th>
                                                <th className="py-3.5 px-6 text-right">Net Pay</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
                                            {calcResults.map((rec) => (
                                                <tr key={rec.employeeId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10">
                                                    <td className="py-3 px-6 font-sans font-semibold">
                                                        <div>{rec.employeeName}</div>
                                                        <div className="text-[10px] text-neutral-400 font-normal font-mono">{rec.employmentStatus} | {rec.employeeId}</div>
                                                    </td>
                                                    <td className="py-3 px-3 text-right">₱{rec.basicPayEarned.toLocaleString()}</td>
                                                    <td className="py-3 px-3 text-right">₱{rec.allowanceEarned.toLocaleString()}</td>
                                                    <td className="py-3 px-3 text-right text-emerald-600">₱{rec.otPay.toLocaleString()}</td>
                                                    <td className="py-3 px-3 text-right text-emerald-600">₱{rec.nsdPay.toLocaleString()}</td>
                                                    <td className="py-3 px-3 text-right text-emerald-600">₱{(rec.restDayHolidayPay + rec.legalHolidayPay).toLocaleString()}</td>
                                                    <td className="py-3 px-3 text-right font-bold">₱{rec.grossPay.toLocaleString()}</td>
                                                    <td className="py-3 px-3 text-right text-rose-600">
                                                        ₱{(rec.sssDeduct + rec.phicDeduct + rec.hdmfDeduct + rec.unionDuesDeduct + rec.canteenDeduct + rec.coValeDeduct + rec.otherDeductions).toLocaleString()}
                                                    </td>
                                                    <td className="py-3 px-3 text-right text-rose-600">₱{rec.withholdingTax.toLocaleString()}</td>
                                                    <td className="py-3 px-3 text-right text-rose-600">₱{rec.totalLoanDeduct.toLocaleString()}</td>
                                                    <td className="py-3 px-6 text-right font-black text-emerald-600 text-sm">₱{rec.netPay.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}

Draft.layout = {
    breadcrumbs: [
        { title: 'Payroll', href: '/payroll/draft' },
        { title: 'Draft generation', href: '/payroll/draft' },
    ],
};
