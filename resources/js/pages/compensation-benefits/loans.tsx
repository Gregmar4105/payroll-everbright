import { Head } from '@inertiajs/react';
import { Percent, Plus, Landmark, X, Check } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, Loan } from '@/lib/payrollStore';

export default function Loans() {
    const { state, addLoan } = usePayroll();
    const [isAddOpen, setIsAddOpen] = useState(false);
    
    // Add loan form state
    const [empId, setEmpId] = useState(state.employees[0]?.id || '');
    const [loanType, setLoanType] = useState<Loan['type']>('SSS Salary Loan');
    const [totalAmt, setTotalAmt] = useState(15000);
    const [amortRate, setAmortRate] = useState(750);

    const canModify = state.userRole === 'System Admin' || state.userRole === 'Payroll Officer';

    const handleAddLoanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addLoan({
            employeeId: empId,
            type: loanType,
            totalAmount: Number(totalAmt),
            amortPerCutoff: Number(amortRate),
            outstandingBalance: Number(totalAmt)
        });
        setIsAddOpen(false);
    };

    const displayLoans = state.loans.map(l => {
        const emp = state.employees.find(e => e.id === l.employeeId);
        return {
            ...l,
            empName: emp ? emp.name : 'Unknown Employee',
            empRole: emp ? emp.role : 'Staff'
        };
    });

    return (
        <>
            <Head title="Employee Loans & Deductions" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Loan Tracking & Amortizations</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Monitor outstanding balances, monthly SSS/Pag-IBIG loan schedules, and salary advances.
                        </p>
                    </div>
                    {canModify && (
                        <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 size-sm">
                            <Plus className="h-4 w-4" /> Register New Loan
                        </Button>
                    )}
                </div>

                {/* Add Loan Modal */}
                {isAddOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-205">
                        <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-md w-full border border-neutral-250 p-6 space-y-4 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="text-base font-bold">Register New Employee Loan</h3>
                                <button onClick={() => setIsAddOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleAddLoanSubmit} className="space-y-4 text-sm">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">Employee</label>
                                    <select 
                                        value={empId}
                                        onChange={(e) => setEmpId(e.target.value)}
                                        className="w-full text-sm p-2 border border-neutral-200 bg-white rounded dark:bg-neutral-950 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200"
                                    >
                                        {state.employees.map(e => (
                                            <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">Loan Classification</label>
                                    <select 
                                        value={loanType}
                                        onChange={(e) => setLoanType(e.target.value as any)}
                                        className="w-full text-sm p-2 border border-neutral-200 bg-white rounded dark:bg-neutral-950 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200"
                                    >
                                        <option value="SSS Salary Loan">SSS Salary Loan</option>
                                        <option value="SSS Calamity Loan">SSS Calamity Loan</option>
                                        <option value="HDMF Loan">HDMF Loan (Pag-IBIG)</option>
                                        <option value="HDMF Calamity Loan">HDMF Calamity Loan</option>
                                        <option value="Company Loan">Company Salary Loan</option>
                                        <option value="Car Loan">Car Loan</option>
                                        <option value="Other Loan 1">External Loan 1</option>
                                        <option value="Other Loan 2">External Loan 2</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase">Principal Amount (₱)</label>
                                        <input 
                                            type="number"
                                            required
                                            value={totalAmt}
                                            onChange={(e) => setTotalAmt(Number(e.target.value))}
                                            className="w-full text-sm p-2 border border-neutral-200 bg-white rounded dark:bg-neutral-955 dark:border-neutral-800 font-mono text-neutral-800 dark:text-neutral-200"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase">Cutoff Amortization (₱)</label>
                                        <input 
                                            type="number"
                                            required
                                            value={amortRate}
                                            onChange={(e) => setAmortRate(Number(e.target.value))}
                                            className="w-full text-sm p-2 border border-neutral-200 bg-white rounded dark:bg-neutral-955 dark:border-neutral-800 font-mono text-neutral-800 dark:text-neutral-200"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2 border-t">
                                    <Button type="button" onClick={() => setIsAddOpen(false)} variant="outline">Cancel</Button>
                                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1">
                                        <Check className="h-3.5 w-3.5" /> Register Loan
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Loans Table */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Loan Amortization Log</CardTitle>
                        <CardDescription>Installment details directly deducted from payroll cutoff calculations.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">Employee</th>
                                        <th className="py-3.5 px-6">Loan Classification</th>
                                        <th className="py-3.5 px-6">Principal Loan</th>
                                        <th className="py-3.5 px-6">Outstanding Balance</th>
                                        <th className="py-3.5 px-6">Scheduled Cutoff Amortization</th>
                                        <th className="py-3.5 px-6 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                    {displayLoans.map((row) => (
                                        <tr key={row.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                            <td className="py-3.5 px-6 font-semibold text-neutral-900 dark:text-white">
                                                <div>{row.empName}</div>
                                                <div className="text-[10px] text-neutral-400 font-normal font-mono">{row.empRole} | {row.employeeId}</div>
                                            </td>
                                            <td className="py-3.5 px-6">
                                                <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 font-medium">
                                                    <Landmark className="h-4 w-4 text-emerald-600 dark:text-emerald-450" /> {row.type}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-6 text-neutral-600 dark:text-neutral-400 font-mono">₱{row.totalAmount.toLocaleString()}</td>
                                            <td className="py-3.5 px-6 font-bold text-neutral-900 dark:text-white font-mono">₱{row.outstandingBalance.toLocaleString()}</td>
                                            <td className="py-3.5 px-6 font-semibold text-rose-600 dark:text-rose-400 font-mono">-₱{row.amortPerCutoff.toLocaleString()}</td>
                                            <td className="py-3.5 px-6 text-right">
                                                <Badge className={`
                                                    font-medium text-xs
                                                    ${row.outstandingBalance > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-neutral-100 text-neutral-450 border-neutral-200'}
                                                `}>
                                                    {row.outstandingBalance > 0 ? 'Deducting' : 'Fully Paid'}
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

Loans.layout = {
    breadcrumbs: [
        { title: 'Compensation & Benefits', href: '/compensation-benefits/base-pay' },
        { title: 'Loans', href: '/compensation-benefits/loans' },
    ],
};
