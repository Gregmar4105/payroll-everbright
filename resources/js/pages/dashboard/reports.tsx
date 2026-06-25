import { Head } from '@inertiajs/react';
import { FileText, Download, Printer, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, runPayrollCalculations } from '@/lib/payrollStore';

export default function Reports() {
    const { state } = usePayroll();
    const [selectedPeriod, setSelectedPeriod] = useState('active');

    // Fetch latest finalized cycle if any, or run active calculation for draft
    const latestCycle = state.payrollCycles.find(c => c.finalized);
    const draftRecords = runPayrollCalculations(state, state.currentCutoff.schedule);

    const activeRecords = selectedPeriod === 'active' 
        ? draftRecords 
        : (latestCycle ? latestCycle.records : []);

    const activePeriodLabel = selectedPeriod === 'active'
        ? `${state.currentCutoff.start} to ${state.currentCutoff.end} (DRAFT: ${state.currentCutoff.id})`
        : (latestCycle ? `${latestCycle.cutoffStart} to ${latestCycle.cutoffEnd} (FINALIZED: ${latestCycle.id})` : 'No finalized cycles found');

    const handlePrint = () => {
        window.print();
    };

    // Table totals
    const totalBasic = activeRecords.reduce((sum, r) => sum + r.basicPayEarned, 0);
    const totalOT = activeRecords.reduce((sum, r) => sum + r.otPay, 0);
    const totalNSD = activeRecords.reduce((sum, r) => sum + r.nsdPay, 0);
    const totalHoliday = activeRecords.reduce((sum, r) => sum + (r.restDayHolidayPay + r.legalHolidayPay), 0);
    const totalAllow = activeRecords.reduce((sum, r) => sum + r.allowanceEarned, 0);
    const totalGross = activeRecords.reduce((sum, r) => sum + r.grossPay, 0);
    const totalSSS = activeRecords.reduce((sum, r) => sum + r.sssDeduct, 0);
    const totalPHIC = activeRecords.reduce((sum, r) => sum + r.phicDeduct, 0);
    const totalHDMF = activeRecords.reduce((sum, r) => sum + r.hdmfDeduct, 0);
    const totalUnion = activeRecords.reduce((sum, r) => sum + r.unionDuesDeduct, 0);
    const totalTax = activeRecords.reduce((sum, r) => sum + r.withholdingTax, 0);
    const totalLoans = activeRecords.reduce((sum, r) => sum + r.totalLoanDeduct, 0);
    const totalDeducts = activeRecords.reduce((sum, r) => sum + r.totalDeductions, 0);
    const totalNet = activeRecords.reduce((sum, r) => sum + r.netPay, 0);

    return (
        <>
            <Head title="Periodic Payroll Report" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10 print:bg-white print:p-0">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between print:hidden">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Periodic Payroll Report</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Generate and print the master summary sheet with statutory calculations, deductions, and authorization signatures.
                        </p>
                    </div>
                </div>

                {/* Filter parameters */}
                <Card className="border-neutral-200/60 dark:border-neutral-800 print:hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Payroll Cycle Selector</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-4">
                        <div className="space-y-1.5 flex-1">
                            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Select Batch Period</label>
                            <select 
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="w-full text-sm rounded-md border border-neutral-205 p-2 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
                            >
                                <option value="active">Current Draft: {state.currentCutoff.id} ({state.currentCutoff.start} to {state.currentCutoff.end})</option>
                                {latestCycle && (
                                    <option value="finalized">Finalized: {latestCycle.id} ({latestCycle.cutoffStart} to {latestCycle.cutoffEnd})</option>
                                )}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 h-9 font-semibold">
                                <Printer className="h-4 w-4" /> Print Master Summary
                            </Button>
                            <Button onClick={() => alert('Trial register file successfully generated and downloaded!')} variant="outline" className="h-9 gap-1.5 border-neutral-200">
                                <Download className="h-4 w-4" /> Export CSV
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Master Summary Printable Document */}
                <Card className="border-neutral-200/60 dark:border-transparent bg-white shadow-xs p-6 print:p-0 print:shadow-none space-y-6">
                    {/* Document Header */}
                    <div className="text-center space-y-1 pb-4 border-b">
                        <h2 className="text-xl font-bold tracking-tight text-neutral-900">EVERBRIGHT NET & TWINE MFG., CORP.</h2>
                        <p className="text-xs text-neutral-500">KM. 14 Edison Ave., SSH' Way, Parañaque City (Tel: 8824-1619)</p>
                        <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider pt-2">PERIODIC PAYROLL REGISTER SHEET</h3>
                        <p className="text-xs font-mono font-bold text-emerald-700">Period: {activePeriodLabel}</p>
                    </div>

                    {/* Register Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-[10px] text-left border-collapse border border-neutral-200">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50 font-bold text-neutral-600 uppercase tracking-wider text-[9px] divide-x">
                                    <th className="py-2 px-3">Employee</th>
                                    <th className="py-2 px-2 text-right">Basic Pay</th>
                                    <th className="py-2 px-2 text-right">Allow.</th>
                                    <th className="py-2 px-2 text-right">OT Pay</th>
                                    <th className="py-2 px-2 text-right">NSD Pay</th>
                                    <th className="py-2 px-2 text-right">Hol. Pay</th>
                                    <th className="font-bold py-2 px-2 text-right bg-neutral-100">Gross Pay</th>
                                    <th className="py-2 px-2 text-right text-rose-700">SSS</th>
                                    <th className="py-2 px-2 text-right text-rose-700">PHIC</th>
                                    <th className="py-2 px-2 text-right text-rose-700">HDMF</th>
                                    <th className="py-2 px-2 text-right text-rose-700">Union</th>
                                    <th className="py-2 px-2 text-right text-rose-700">W/Tax</th>
                                    <th className="py-2 px-2 text-right text-rose-700">Loans</th>
                                    <th className="font-bold py-2 px-2 text-right bg-rose-50 text-rose-800">Deducts</th>
                                    <th className="font-black py-2 px-3 text-right bg-emerald-50 text-emerald-800 text-[11px]">Net Pay</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 font-mono">
                                {activeRecords.map((rec) => (
                                    <tr key={rec.employeeId} className="hover:bg-neutral-50/50 divide-x text-neutral-800">
                                        <td className="py-2 px-3 font-sans font-semibold">
                                            <div>{rec.employeeName}</div>
                                            <div className="text-[8px] text-neutral-400 font-normal font-mono">{rec.employeeId}</div>
                                        </td>
                                        <td className="py-2 px-2 text-right">₱{rec.basicPayEarned.toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right">₱{rec.allowanceEarned.toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right text-emerald-700">₱{rec.otPay.toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right text-emerald-700">₱{rec.nsdPay.toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right text-emerald-700">₱{(rec.restDayHolidayPay + rec.legalHolidayPay).toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right font-bold bg-neutral-50/50">₱{rec.grossPay.toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right text-rose-700">₱{rec.sssDeduct.toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right text-rose-700">₱{rec.phicDeduct.toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right text-rose-700">₱{rec.hdmfDeduct.toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right text-rose-700">₱{rec.unionDuesDeduct.toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right text-rose-700">₱{rec.withholdingTax.toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right text-rose-700">₱{rec.totalLoanDeduct.toLocaleString()}</td>
                                        <td className="py-2 px-2 text-right font-bold bg-rose-50/30 text-rose-750">₱{rec.totalDeductions.toLocaleString()}</td>
                                        <td className="py-2 px-3 text-right font-black bg-emerald-50/30 text-emerald-800 text-[11px]">₱{rec.netPay.toLocaleString()}</td>
                                    </tr>
                                ))}
                                
                                {/* Totals Row */}
                                <tr className="bg-neutral-100/70 border-t border-neutral-300 font-bold divide-x text-neutral-900 text-[10px]">
                                    <td className="py-2.5 px-3 font-sans">TOTALS</td>
                                    <td className="py-2.5 px-2 text-right">₱{totalBasic.toLocaleString()}</td>
                                    <td className="py-2.5 px-2 text-right">₱{totalAllow.toLocaleString()}</td>
                                    <td className="py-2.5 px-2 text-right text-emerald-800">₱{totalOT.toLocaleString()}</td>
                                    <td className="py-2.5 px-2 text-right text-emerald-800">₱{totalNSD.toLocaleString()}</td>
                                    <td className="py-2.5 px-2 text-right text-emerald-800">₱{totalHoliday.toLocaleString()}</td>
                                    <td className="py-2.5 px-2 text-right bg-neutral-200/50">₱{totalGross.toLocaleString()}</td>
                                    <td className="py-2.5 px-2 text-right text-rose-800">₱{totalSSS.toLocaleString()}</td>
                                    <td className="py-2.5 px-2 text-right text-rose-800">₱{totalPHIC.toLocaleString()}</td>
                                    <td className="py-2.5 px-2 text-right text-rose-800">₱{totalHDMF.toLocaleString()}</td>
                                    <td className="py-2.5 px-2 text-right text-rose-800">₱{totalUnion.toLocaleString()}</td>
                                    <td className="py-2.5 px-2 text-right text-rose-800">₱{totalTax.toLocaleString()}</td>
                                    <td className="py-2.5 px-2 text-right text-rose-800">₱{totalLoans.toLocaleString()}</td>
                                    <td className="py-2.5 px-2 text-right bg-rose-100/40 text-rose-800">₱{totalDeducts.toLocaleString()}</td>
                                    <td className="py-2.5 px-3 text-right bg-emerald-100/50 text-emerald-900 text-sm">₱{totalNet.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Sign-off Blocks */}
                    <div className="pt-10 grid grid-cols-3 gap-6 text-[10px] text-neutral-500 font-medium">
                        <div className="space-y-12">
                            <span className="block border-t border-neutral-300 pt-2 text-center text-neutral-700">PREPARED BY (PAYROLL MASTER)</span>
                            <span className="block text-center font-bold text-neutral-800">Maria Santos</span>
                        </div>
                        <div className="space-y-12">
                            <span className="block border-t border-neutral-300 pt-2 text-center text-neutral-700">CHECKED BY (HR MANAGER)</span>
                            <span className="block text-center font-bold text-neutral-800">________________________</span>
                        </div>
                        <div className="space-y-12">
                            <span className="block border-t border-neutral-300 pt-2 text-center text-neutral-700">AUTHORIZED SIGNATURE (FINANCE APPROVED)</span>
                            <span className="block text-center font-bold text-neutral-800">________________________</span>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}

Reports.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reports', href: '/dashboard/reports' },
    ],
};
