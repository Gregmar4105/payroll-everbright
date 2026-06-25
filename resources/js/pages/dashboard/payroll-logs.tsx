import { Head } from '@inertiajs/react';
import { CheckCircle, Eye, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll } from '@/lib/payrollStore';

export default function PayrollLogs() {
    const { state } = usePayroll();

    // Combined seed data and dynamic payroll cycles
    const getPayrollLogs = () => {
        // Map dynamic cycles from state
        const dynamicLogs = state.payrollCycles.map(c => {
            const employeesCount = c.records.length;
            const grossSum = c.records.reduce((sum, r) => sum + r.grossPay, 0);
            const netSum = c.records.reduce((sum, r) => sum + r.netPay, 0);

            return {
                id: c.id,
                period: `${c.cutoffStart} to ${c.cutoffEnd}`,
                payDate: c.cutoffEnd,
                gross: `₱${(grossSum > 0 ? grossSum : 15600.20).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                net: `₱${(netSum > 0 ? netSum : 13164.70).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                employees: employeesCount > 0 ? employeesCount : 5,
                status: c.finalized ? 'Completed' : 'Draft'
            };
        });

        // Add some older static seed records for history
        const staticSeedLogs = [
            { id: 'PR-2026-09', period: 'May 1, 2026 - May 15, 2026', payDate: '2026-05-15', gross: '₱2,398,510.90', net: '₱1,972,115.60', employees: 337, status: 'Completed' },
            { id: 'PR-2026-08', period: 'Apr 16, 2026 - Apr 30, 2026', payDate: '2026-04-30', gross: '₱2,382,900.00', net: '₱1,960,250.00', employees: 335, status: 'Completed' },
            { id: 'PR-2026-07', period: 'Apr 1, 2026 - Apr 15, 2026', payDate: '2026-04-15', gross: '₱2,350,110.50', net: '₱1,935,680.10', employees: 330, status: 'Completed' },
        ];

        return [...dynamicLogs, ...staticSeedLogs];
    };

    const logs = getPayrollLogs();

    return (
        <>
            <Head title="Periodic Payroll Logs" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Periodic Payroll Logs</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            View historical pay runs, download tax summaries, payslips, and bank advices.
                        </p>
                    </div>
                </div>

                {/* Main Content Table */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Pay Run Logs</CardTitle>
                        <CardDescription>Records of finalized payroll batches.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                        <th className="py-3 px-6">Batch ID</th>
                                        <th className="py-3 px-6">Payroll Period</th>
                                        <th className="py-3 px-6">Payment Date</th>
                                        <th className="py-3 px-6 text-center">Employees</th>
                                        <th className="py-3 px-6">Total Gross</th>
                                        <th className="py-3 px-6 font-semibold">Total Net Pay</th>
                                        <th className="py-3 px-6">Status</th>
                                        <th className="py-3 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                            <td className="py-3.5 px-6 font-semibold text-emerald-600 dark:text-emerald-400">{log.id}</td>
                                            <td className="py-3.5 px-6 text-neutral-700 dark:text-neutral-300 font-mono text-xs">{log.period}</td>
                                            <td className="py-3.5 px-6 text-neutral-600 dark:text-neutral-450 font-mono text-xs">{log.payDate}</td>
                                            <td className="py-3.5 px-6 text-center font-medium text-neutral-800 dark:text-neutral-200 font-mono">{log.employees}</td>
                                            <td className="py-3.5 px-6 text-neutral-800 dark:text-neutral-200 font-mono text-xs">{log.gross}</td>
                                            <td className="py-3.5 px-6 font-semibold text-neutral-950 dark:text-white font-mono text-xs">{log.net}</td>
                                            <td className="py-3.5 px-6">
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 gap-1 font-medium">
                                                    <CheckCircle className="h-3 w-3 animate-pulse" /> {log.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button onClick={() => alert(`Opening details for batch ${log.id}`)} variant="ghost" size="icon" className="h-8 w-8 hover:text-emerald-600">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button onClick={() => alert(`Exporting audit sheets for batch ${log.id}`)} variant="ghost" size="icon" className="h-8 w-8 hover:text-emerald-600">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
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

PayrollLogs.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Periodic payroll logs', href: '/dashboard/payroll-logs' },
    ],
};
