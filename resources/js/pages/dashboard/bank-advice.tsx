import { Head } from '@inertiajs/react';
import { Landmark, Download, CheckCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, runPayrollCalculations } from '@/lib/payrollStore';

export default function BankAdvice() {
    const { state } = usePayroll();
    const [selectedPeriod, setSelectedPeriod] = useState<'active' | 'finalized'>('active');

    const canModify = state.userRole === 'System Admin' || state.userRole === 'Payroll Officer';

    // Get active draft records or finalized records
    const latestCycle = state.payrollCycles.find(c => c.finalized);
    const draftRecords = runPayrollCalculations(state, state.currentCutoff.schedule);

    const activeRecords = selectedPeriod === 'active' 
        ? draftRecords 
        : (latestCycle ? latestCycle.records : []);

    // Group net pay by bank name
    const getBankAggregates = () => {
        const aggregates: Record<string, { count: number; total: number }> = {
            'BDO Unibank': { count: 0, total: 0 },
            'BPI': { count: 0, total: 0 },
            'Metrobank': { count: 0, total: 0 },
            'Security Bank': { count: 0, total: 0 },
            'UnionBank': { count: 0, total: 0 },
        };

        activeRecords.forEach(r => {
            const emp = state.employees.find(e => e.id === r.employeeId);
            const bank = emp ? emp.bankName : 'BDO Unibank';
            
            if (aggregates[bank]) {
                aggregates[bank].count++;
                aggregates[bank].total += r.netPay;
            } else {
                aggregates[bank] = { count: 1, total: r.netPay };
            }
        });

        return Object.entries(aggregates).map(([name, data]) => ({
            name,
            code: name.split(' ')[0].toUpperCase(),
            file: `${name.replace(' ', '_').toUpperCase()}_PR_${selectedPeriod === 'active' ? 'DRAFT' : 'FINAL'}_2026.txt`,
            desc: `${name} Direct Credit Transmittal Format`,
            count: `${data.count} Accounts`,
            amount: `₱${data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            totalVal: data.total
        })).filter(a => a.totalVal > 0);
    };

    const bankAggs = getBankAggregates();

    return (
        <>
            <Head title="Bank Advice Files" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Bank Advice Files</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Download bank transmittal instructions to automate electronic salary distribution.
                        </p>
                    </div>
                </div>

                {/* Period Selector Card */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-neutral-400 font-sans">Payment Target Period</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <select 
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value as any)}
                            className="text-sm rounded-md border border-neutral-200 p-2 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-205 flex-1"
                        >
                            <option value="active">Active Draft Cutoff: {state.currentCutoff.id}</option>
                            {latestCycle && (
                                <option value="finalized">Latest Finalized Cycle: {latestCycle.id}</option>
                            )}
                        </select>
                        <Button onClick={() => alert('Bank transmittal hashes successfully re-compiled!')} variant="outline" className="gap-1.5 h-9 border-neutral-205">
                            <RefreshCw className="h-4 w-4" /> Re-encrypt Files
                        </Button>
                    </CardContent>
                </Card>

                {/* Main Content Card Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {bankAggs.map((bank) => (
                        <Card key={bank.name} className="border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between hover:shadow-xs transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Landmark className="h-5 w-5 text-emerald-600 dark:text-emerald-450" />
                                    <Badge variant="secondary" className="text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-none font-semibold">
                                        {bank.code}
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">{bank.name}</CardTitle>
                                <CardDescription className="text-xs">{bank.desc}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-100 dark:bg-neutral-900/40 dark:border-neutral-800 space-y-2.5 text-xs font-sans">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Transmittal File:</span>
                                        <span className="font-semibold text-neutral-850 dark:text-neutral-200 font-mono text-[10px]">{bank.file}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Credited Count:</span>
                                        <span className="font-semibold text-neutral-850 dark:text-neutral-205">{bank.count}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 border-neutral-200/40">
                                        <span className="text-neutral-500">Total Net Payout:</span>
                                        <span className="font-bold text-emerald-650 dark:text-emerald-400 font-mono text-sm">{bank.amount}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        <span className="font-medium">Ready</span>
                                    </div>
                                    <Button onClick={() => alert(`${bank.name} bulk crediting transmittal sheet successfully downloaded!`)} size="sm" className="h-8 gap-1.5 bg-emerald-650 text-white font-medium">
                                        Download <Download className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

BankAdvice.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Bank advice files', href: '/dashboard/bank-advice' },
    ],
};
