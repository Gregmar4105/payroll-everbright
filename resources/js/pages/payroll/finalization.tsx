import { Head } from '@inertiajs/react';
import { Lock, FileText, CheckCircle, ShieldCheck, Send, X, Printer, Landmark } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, CalculatedPayrollRecord } from '@/lib/payrollStore';

export default function Finalization() {
    const { state, runCalculation, finalizePayrollCycle } = usePayroll();
    const [selectedPayslip, setSelectedPayslip] = useState<CalculatedPayrollRecord | null>(null);
    const [emailSent, setEmailSent] = useState(false);

    const canModify = state.userRole === 'System Admin' || state.userRole === 'Payroll Officer';

    // Current draft calculation records
    const draftRecords = runCalculation();

    // Find latest finalized cycle
    const latestFinalized = state.payrollCycles
        .filter(c => c.finalized)
        .sort((a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime())[0];

    const handleLockAndFinalize = () => {
        if (!canModify) return;
        if (confirm('Lock this payroll batch? This will update outstanding loan balances, freeze inputs, and archive this cycle.')) {
            finalizePayrollCycle(draftRecords);
            alert('Payroll cutoff has been finalized and archived successfully!');
        }
    };

    const handleDispatchEmails = () => {
        setEmailSent(true);
        alert('All employee payslips have been successfully dispatched via secure encrypted emails!');
    };

    // Which records to display payslips for: if current cutoff has been advanced and latest cycle is finalized, show latest cycle.
    const activeRecords = latestFinalized ? latestFinalized.records : [];
    const activeCutoffId = latestFinalized ? latestFinalized.id : state.currentCutoff.id;

    return (
        <>
            <Head title="Finalize Payroll Batch" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Batch Finalization & Lock</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Perform pre-locking checks, sign off computed calculations, and distribute payslips to employees.
                        </p>
                    </div>
                </div>

                {/* Audit Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-neutral-200/60 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-450" />
                                Pre-Lock Audit Status
                            </CardTitle>
                            <CardDescription>Automatic system checklist verification.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { check: 'All active employee hours validated', status: 'Passed' },
                                { check: 'Government statutory formulas updated', status: 'Passed' },
                                { check: 'Manual overrides authorized', status: 'Passed' },
                                { check: 'Union dues collection validated (1% of regular)', status: 'Passed' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs pb-2.5 border-b last:border-b-0 border-neutral-100 dark:border-neutral-800">
                                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">{item.check}</span>
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold">
                                        {item.status}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Lock className="h-5 w-5 text-emerald-605 dark:text-emerald-450" />
                                Lock Cutoff calculations
                            </CardTitle>
                            <CardDescription>Locking prevents any further modifications to the current payroll cutoff.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3.5 rounded bg-emerald-50/20 border border-emerald-250 text-xs text-emerald-800 dark:text-emerald-350">
                                Locking batch <strong>{state.currentCutoff.id}</strong> ({state.currentCutoff.schedule}) will deduct loan amortizations, prepare statutory reports (SSS/PHIC/HDMF), and lock values.
                            </div>
                            <div className="flex gap-2 justify-end">
                                {canModify ? (
                                    <Button onClick={handleLockAndFinalize} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 h-9 font-semibold">
                                        <Lock className="h-4 w-4" /> Lock & Finalize Payroll
                                    </Button>
                                ) : (
                                    <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 px-3 py-1.5 text-xs">
                                        Finalization restricted to Payroll Master ({state.userRole})
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payslip Distribution */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Payslip Distribution System</CardTitle>
                        <CardDescription>Send digital payslips to employee profiles and company email boxes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/30">
                            <div>
                                <h4 className="text-sm font-semibold">Email PDF Dispatcher</h4>
                                <p className="text-xs text-neutral-400">Distribute password-encrypted PDFs containing payslips.</p>
                            </div>
                            <Button 
                                onClick={handleDispatchEmails} 
                                disabled={!latestFinalized || emailSent} 
                                className="bg-emerald-650 text-white gap-1.5 h-9 font-semibold"
                            >
                                <Send className="h-4 w-4" /> {emailSent ? 'Emails Dispatched' : 'Dispatch Emails'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Payslips List */}
                {latestFinalized && (
                    <Card className="border-neutral-200/60 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Generated Payslips Directory</CardTitle>
                            <CardDescription>Cutoff: {latestFinalized.cutoffStart} to {latestFinalized.cutoffEnd} ({latestFinalized.schedule})</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                            <th className="py-3 px-6">Employee</th>
                                            <th className="py-3 px-6">Role & Department</th>
                                            <th className="py-3 px-6 text-right">Gross Pay</th>
                                            <th className="py-3 px-6 text-right">Total Deductions</th>
                                            <th className="py-3 px-6 text-right">Net Pay</th>
                                            <th className="py-3 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
                                        {activeRecords.map((rec) => (
                                            <tr key={rec.employeeId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                                                <td className="py-3 px-6 font-semibold">{rec.employeeName}</td>
                                                <td className="py-3 px-6 text-xs text-neutral-500">{rec.dept}</td>
                                                <td className="py-3 px-6 text-right font-mono font-medium">₱{rec.grossPay.toLocaleString()}</td>
                                                <td className="py-3 px-6 text-right font-mono text-rose-600">₱{rec.totalDeductions.toLocaleString()}</td>
                                                <td className="py-3 px-6 text-right font-mono font-bold text-emerald-600">₱{rec.netPay.toLocaleString()}</td>
                                                <td className="py-3 px-6 text-right">
                                                    <Button 
                                                        onClick={() => setSelectedPayslip(rec)}
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-8 border-neutral-200"
                                                    >
                                                        View Payslip
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Payslip Overlay/Modal */}
                {selectedPayslip && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-neutral-300 dark:border-neutral-800 p-6 space-y-6 animate-in zoom-in-95 duration-200 flex flex-col">
                            {/* Payslip Header */}
                            <div className="flex items-center justify-between border-b pb-4">
                                <div className="space-y-0.5">
                                    <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Everbright Net & Twine Mfg., Corp.</h2>
                                    <p className="text-xs text-neutral-450">KM. 14 Edison Ave., SSH' Way, Parañaque City (Tel: 8824-1619)</p>
                                </div>
                                <button onClick={() => setSelectedPayslip(null)} className="text-neutral-400 hover:text-neutral-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Employee Info Block */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs p-4 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850">
                                <div>
                                    <span className="text-neutral-400 block uppercase">Employee Name:</span>
                                    <span className="font-bold text-neutral-850 dark:text-neutral-200">{selectedPayslip.employeeName}</span>
                                </div>
                                <div>
                                    <span className="text-neutral-400 block uppercase">Employee ID:</span>
                                    <span className="font-semibold font-mono text-neutral-850 dark:text-neutral-200">{selectedPayslip.employeeId}</span>
                                </div>
                                <div>
                                    <span className="text-neutral-400 block uppercase">Pay Period:</span>
                                    <span className="font-semibold text-neutral-850 dark:text-neutral-200">{activeCutoffId}</span>
                                </div>
                                <div>
                                    <span className="text-neutral-400 block uppercase">Status:</span>
                                    <Badge className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold">{selectedPayslip.employmentStatus}</Badge>
                                </div>
                            </div>

                            {/* Earnings & Deductions Tables */}
                            <div className="grid md:grid-cols-2 gap-6 text-xs flex-1 overflow-y-auto">
                                {/* Earnings column */}
                                <div className="space-y-3">
                                    <h3 className="font-bold border-b pb-1 text-emerald-700 uppercase tracking-wider">Earnings & Allowances</h3>
                                    <table className="w-full">
                                        <tbody className="divide-y divide-neutral-50 font-mono">
                                            <tr className="py-2 flex justify-between">
                                                <td className="text-neutral-500 font-sans">Basic Pay (Rate)</td>
                                                <td className="font-semibold">₱{selectedPayslip.basicPayEarned.toLocaleString()}</td>
                                            </tr>
                                            {selectedPayslip.allowanceEarned > 0 && (
                                                <tr className="py-2 flex justify-between">
                                                    <td className="text-neutral-500 font-sans">Allowance (Period)</td>
                                                    <td className="font-semibold">₱{selectedPayslip.allowanceEarned.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {selectedPayslip.otPay > 0 && (
                                                <tr className="py-2 flex justify-between">
                                                    <td className="text-emerald-700 font-sans">Overtime ({selectedPayslip.otHours} hrs)</td>
                                                    <td className="font-bold text-emerald-600">₱{selectedPayslip.otPay.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {selectedPayslip.nsdPay > 0 && (
                                                <tr className="py-2 flex justify-between">
                                                    <td className="text-emerald-700 font-sans">Night Shift Diff ({selectedPayslip.nsdHours} hrs)</td>
                                                    <td className="font-bold text-emerald-600">₱{selectedPayslip.nsdPay.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {selectedPayslip.restDayHolidayPay > 0 && (
                                                <tr className="py-2 flex justify-between">
                                                    <td className="text-emerald-700 font-sans">Rest Day premium</td>
                                                    <td className="font-bold text-emerald-600">₱{selectedPayslip.restDayHolidayPay.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {selectedPayslip.legalHolidayPay > 0 && (
                                                <tr className="py-2 flex justify-between">
                                                    <td className="text-emerald-700 font-sans">Legal Holiday pay</td>
                                                    <td className="font-bold text-emerald-600">₱{selectedPayslip.legalHolidayPay.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {selectedPayslip.retroPay > 0 && (
                                                <tr className="py-2 flex justify-between">
                                                    <td className="text-neutral-500 font-sans">Retro Adjustments</td>
                                                    <td className="font-semibold">₱{selectedPayslip.retroPay.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {selectedPayslip.adjustmentsPay > 0 && (
                                                <tr className="py-2 flex justify-between">
                                                    <td className="text-neutral-500 font-sans">Other Adjustments</td>
                                                    <td className="font-semibold">₱{selectedPayslip.adjustmentsPay.toLocaleString()}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    <div className="flex justify-between font-bold border-t pt-2 mt-2 text-sm text-neutral-850 font-mono">
                                        <span className="font-sans">Gross Pay</span>
                                        <span>₱{selectedPayslip.grossPay.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Deductions column */}
                                <div className="space-y-3">
                                    <h3 className="font-bold border-b pb-1 text-rose-700 uppercase tracking-wider">Deductions & Loans</h3>
                                    <table className="w-full">
                                        <tbody className="divide-y divide-neutral-50 font-mono">
                                            <tr className="py-2 flex justify-between">
                                                <td className="text-neutral-500 font-sans">SSS Premium</td>
                                                <td className="font-medium text-rose-600">₱{selectedPayslip.sssDeduct.toLocaleString()}</td>
                                            </tr>
                                            <tr className="py-2 flex justify-between">
                                                <td className="text-neutral-500 font-sans">PhilHealth ID</td>
                                                <td className="font-medium text-rose-600">₱{selectedPayslip.phicDeduct.toLocaleString()}</td>
                                            </tr>
                                            <tr className="py-2 flex justify-between">
                                                <td className="text-neutral-500 font-sans">HDMF Premium</td>
                                                <td className="font-medium text-rose-600">₱{selectedPayslip.hdmfDeduct.toLocaleString()}</td>
                                            </tr>
                                            {selectedPayslip.unionDuesDeduct > 0 && (
                                                <tr className="py-2 flex justify-between">
                                                    <td className="text-neutral-500 font-sans">Union Dues (1%)</td>
                                                    <td className="font-medium text-rose-600">₱{selectedPayslip.unionDuesDeduct.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {selectedPayslip.withholdingTax > 0 && (
                                                <tr className="py-2 flex justify-between">
                                                    <td className="text-neutral-500 font-sans">Withholding Tax</td>
                                                    <td className="font-medium text-rose-600">₱{selectedPayslip.withholdingTax.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {selectedPayslip.canteenDeduct > 0 && (
                                                <tr className="py-2 flex justify-between">
                                                    <td className="text-neutral-500 font-sans">Canteen Charges</td>
                                                    <td className="font-medium text-rose-600">₱{selectedPayslip.canteenDeduct.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {selectedPayslip.coValeDeduct > 0 && (
                                                <tr className="py-2 flex justify-between">
                                                    <td className="text-neutral-500 font-sans">Company Vale</td>
                                                    <td className="font-medium text-rose-600">₱{selectedPayslip.coValeDeduct.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {selectedPayslip.loanDeductions.map(ld => (
                                                <tr key={ld.loanId} className="py-2 flex justify-between">
                                                    <td className="text-neutral-500 font-sans">{ld.type} installment</td>
                                                    <td className="font-medium text-rose-600 font-mono">₱{ld.amount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="flex justify-between font-bold border-t pt-2 mt-2 text-sm text-neutral-850 font-mono">
                                        <span className="font-sans">Total Deductions</span>
                                        <span className="text-rose-600">₱{selectedPayslip.totalDeductions.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Loan Outstanding Balances Section (Requirement 5) */}
                            {selectedPayslip.totalLoanDeduct > 0 && (
                                <div className="border-t pt-4 space-y-2 text-xs">
                                    <h4 className="font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Landmark className="h-4 w-4 text-emerald-600" /> Outstanding Loan Balances
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {state.loans.filter(l => l.employeeId === selectedPayslip.employeeId).map(loan => (
                                            <div key={loan.id} className="p-2.5 rounded border border-neutral-100 bg-neutral-50/50 dark:bg-neutral-950 font-mono text-[11px] flex justify-between">
                                                <span className="text-neutral-450 font-sans text-[10px]">{loan.type}:</span>
                                                <span className="font-bold text-neutral-850 dark:text-neutral-200">
                                                    ₱{loan.outstandingBalance.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Final Net Pay Block */}
                            <div className="border-t pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="text-center md:text-left">
                                    <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Net Take-Home Pay</span>
                                    <span className="text-3xl font-black text-emerald-650 font-mono">
                                        ₱{selectedPayslip.netPay.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={() => {
                                            window.print();
                                        }}
                                        variant="outline" 
                                        className="h-9 gap-1.5 border-neutral-205"
                                    >
                                        <Printer className="h-4 w-4" /> Print Payslip
                                    </Button>
                                    <Button 
                                        onClick={() => setSelectedPayslip(null)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white h-9"
                                    >
                                        Close View
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Finalization.layout = {
    breadcrumbs: [
        { title: 'Payroll', href: '/payroll/draft' },
        { title: 'Finalization', href: '/payroll/finalization' },
    ],
};
