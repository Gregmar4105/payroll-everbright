import { Head } from '@inertiajs/react';
import { GitCompare, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, runPayrollCalculations } from '@/lib/payrollStore';

export default function Variance() {
    const { state } = usePayroll();

    // Run dynamic draft calculations for the current schedule
    const currentDraftRecords = runPayrollCalculations(state, state.currentCutoff.schedule);
    
    // Previous payroll cycle record (PR-2026-10)
    const prevCycle = state.payrollCycles.find(c => c.id === 'PR-2026-10');

    const calculateVariance = () => {
        return currentDraftRecords.map(curr => {
            // Find employee's previous pay record
            const prevRec = prevCycle?.records.find(r => r.employeeId === curr.employeeId);
            
            // If no previous record, simulate a baseline (e.g. 92% of gross basic)
            const prevNet = prevRec ? prevRec.netPay : parseFloat((curr.basicSalary * 0.90).toFixed(2));
            const diff = parseFloat((curr.netPay - prevNet).toFixed(2));
            const pct = prevNet > 0 ? parseFloat(((diff / prevNet) * 100).toFixed(1)) : 0;

            // Generate reason
            let reason = 'Standard cutoff salary';
            if (curr.otHours > 0) reason = `Overtime Approved (${curr.otHours} hrs)`;
            if (curr.nsdHours > 0) reason += (curr.otHours > 0 ? ' + ' : '') + `Night Shift Diff (${curr.nsdHours} hrs)`;
            if (curr.legalHolidayHours > 0 || curr.specialHolidayHours > 0) reason += ' + Holiday premium pay';
            if (curr.totalLoanDeduct > 0) reason += ' - Active loan amortizations';
            if (curr.retroPay > 0) reason += ` + Retro pay (₱${curr.retroPay})`;

            return {
                id: curr.employeeId,
                name: curr.employeeName,
                role: curr.employmentStatus + ' ' + curr.dept,
                prevNet,
                currNet: curr.netPay,
                diff,
                pct,
                reason
            };
        });
    };

    const variances = calculateVariance();
    const highVariances = variances.filter(v => Math.abs(v.pct) >= 5);

    return (
        <>
            <Head title="Payroll Variance Analysis" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Payroll Variance Analysis</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Review deviations, anomalous payouts, and comparing current batch figures to the previous pay period.
                        </p>
                    </div>
                </div>

                {/* Audit Warning */}
                {highVariances.length > 0 && (
                    <Card className="border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10">
                        <CardHeader className="py-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <CardTitle className="text-sm font-semibold text-amber-855 dark:text-amber-300">Variance Threshold Alerts</CardTitle>
                            </div>
                            <CardDescription className="text-xs text-amber-700/80 dark:text-amber-400/80">
                                There are {highVariances.length} employee payouts with fluctuations exceeding ±5.0% compared to the previous cutoff. Please verify timecard approvals and manual overrides.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {/* Variance Table */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Deviation Audit Logs</CardTitle>
                        <CardDescription>Individual net wage variance comparison ({state.currentCutoff.schedule} Cutoff).</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                        <th className="py-3 px-6">Employee</th>
                                        <th className="py-3 px-6">Previous Net Pay</th>
                                        <th className="py-3 px-6">Current Draft Net</th>
                                        <th className="py-3 px-6">Difference</th>
                                        <th className="py-3 px-6">% Change</th>
                                        <th className="py-3 px-6">Calculated Variance Justification</th>
                                        <th className="py-3 px-6 text-right">Verification</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                    {variances.map((row) => (
                                        <tr key={row.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                            <td className="py-3.5 px-6">
                                                <div className="font-semibold text-neutral-900 dark:text-white">{row.name}</div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">{row.role}</div>
                                            </td>
                                            <td className="py-3.5 px-6 font-mono text-xs text-neutral-600 dark:text-neutral-400">₱{row.prevNet.toLocaleString()}</td>
                                            <td className="py-3.5 px-6 font-mono text-xs font-semibold text-neutral-900 dark:text-white">₱{row.currNet.toLocaleString()}</td>
                                            <td className={`py-3.5 px-6 font-bold font-mono text-xs flex items-center gap-0.5 ${row.diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-455'}`}>
                                                {row.diff >= 0 ? (
                                                    <>
                                                        <ArrowUpRight className="h-3.5 w-3.5" /> +₱{row.diff.toLocaleString()}
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowDownRight className="h-3.5 w-3.5" /> -₱{Math.abs(row.diff).toLocaleString()}
                                                    </>
                                                )}
                                            </td>
                                            <td className={`py-3.5 px-6 font-bold font-mono text-xs ${row.diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-455'}`}>
                                                {row.pct >= 0 ? '+' : ''}{row.pct}%
                                            </td>
                                            <td className="py-3.5 px-6 text-xs text-neutral-500 dark:text-neutral-400 font-sans">{row.reason}</td>
                                            <td className="py-3.5 px-6 text-right">
                                                <Badge className={`
                                                    font-semibold text-[10px]
                                                    ${Math.abs(row.pct) >= 5 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
                                                `}>
                                                    {Math.abs(row.pct) >= 5 ? 'Pending Review' : 'Verified'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Variance.layout = {
    breadcrumbs: [
        { title: 'Payroll', href: '/payroll/draft' },
        { title: 'Variance analysis', href: '/payroll/variance' },
    ],
};
