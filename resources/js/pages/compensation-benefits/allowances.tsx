import { Head } from '@inertiajs/react';
import { Gift, Sparkles, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, Employee } from '@/lib/payrollStore';

const allowancesPolicies = [
    { name: 'Rice Subsidy (De Minimis)', amount: '₱2,000.00 / Month', taxation: 'Tax-Exempt (De Minimis)', freq: 'Monthly payroll', description: 'Standard grain assistance benefit for all plant staff.' },
    { name: 'Clothing Allowance', amount: '₱500.00 / Month', taxation: 'Tax-Exempt (De Minimis)', freq: 'Monthly payroll', description: 'Assistance for safety boots and factory floor clothing.' },
];

export default function Allowances() {
    const { state, updateEmployee } = usePayroll();
    const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
    const [editAllowance, setEditAllowance] = useState(0);

    const canModify = state.userRole === 'System Admin' || state.userRole === 'Payroll Officer';

    const handleSaveAllowance = (id: string) => {
        if (!canModify) return;
        updateEmployee(id, {
            allowance: editAllowance
        });
        setEditingEmpId(null);
    };

    const handleEditStart = (emp: Employee) => {
        setEditingEmpId(emp.id);
        setEditAllowance(emp.allowance);
    };

    return (
        <>
            <Head title="Employee Allowances" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Allowances & De Minimis Benefits</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Configure standard allowances, recurring cash benefits, and tax-exempt de minimis thresholds.
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <Card className="border-emerald-250 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/10">
                    <CardHeader className="py-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-emerald-605 dark:text-emerald-400" />
                            <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">BIR Tax Rules Compliant</CardTitle>
                        </div>
                        <CardDescription className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                            De Minimis benefits are fully tax-exempt up to the annual limit of ₱90,000 as defined by Republic Act No. 10963. Excess amounts are automatically mapped to regular taxable compensation.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Allowances List */}
                    <div className="space-y-6 lg:col-span-2">
                        {allowancesPolicies.map((allow) => (
                            <Card key={allow.name} className="border-neutral-200/60 dark:border-neutral-800 hover:shadow-xs transition-shadow">
                                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                                    <div className="space-y-1">
                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-medium">
                                            {allow.taxation}
                                        </Badge>
                                        <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white pt-1">{allow.name}</CardTitle>
                                        <CardDescription className="text-xs">{allow.description}</CardDescription>
                                    </div>
                                    <Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-405 shrink-0" />
                                </CardHeader>
                                <CardContent className="space-y-4 border-t border-neutral-50 dark:border-neutral-800/80 pt-4 mt-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-neutral-500">Value Rate:</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{allow.amount}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-neutral-500">Frequency:</span>
                                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{allow.freq}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Employee Allowances Registry */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Employee Allowance Mapping</CardTitle>
                            <CardDescription>Configure individual monthly allowance caps.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {state.employees.map(emp => (
                                <div key={emp.id} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2.5 text-xs">
                                    <div className="flex justify-between items-center pb-1.5 border-b border-neutral-50 dark:border-neutral-800">
                                        <div>
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200 block">{emp.name}</span>
                                            <span className="text-[10px] text-neutral-450">{emp.role}</span>
                                        </div>
                                        {canModify && editingEmpId !== emp.id && (
                                            <button onClick={() => handleEditStart(emp)} className="text-emerald-600 hover:text-emerald-500">
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {editingEmpId === emp.id ? (
                                        <div className="space-y-3 pt-1">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-neutral-450 uppercase font-bold">Allowance Amount (₱)</label>
                                                <input 
                                                    type="number"
                                                    value={editAllowance}
                                                    onChange={(e) => setEditAllowance(Number(e.target.value))}
                                                    className="w-full p-1 border rounded text-xs font-mono"
                                                />
                                            </div>
                                            <div className="flex gap-2 justify-end pt-1">
                                                <Button size="sm" variant="outline" onClick={() => setEditingEmpId(null)} className="h-7 text-[10px]">
                                                    Cancel
                                                </Button>
                                                <Button size="sm" onClick={() => handleSaveAllowance(emp.id)} className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white">
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center font-mono text-[11px]">
                                            <span className="text-neutral-400 font-sans">Active Allowance</span>
                                            <span className="font-bold text-neutral-850 dark:text-neutral-200">₱{emp.allowance.toLocaleString()} / Mo</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Allowances.layout = {
    breadcrumbs: [
        { title: 'Compensation & Benefits', href: '/compensation-benefits/base-pay' },
        { title: 'Allowances', href: '/compensation-benefits/allowances' },
    ],
};
