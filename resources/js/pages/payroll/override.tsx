import { Head } from '@inertiajs/react';
import { Save, AlertCircle, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, OverrideEntry } from '@/lib/payrollStore';

export default function Override() {
    const { state, saveOverrides } = usePayroll();
    const [editingEmpId, setEditingEmpId] = useState<string | null>(null);

    // Form editing states
    const [retroHours, setRetroHours] = useState(0);
    const [adjustments, setAdjustments] = useState(0);
    const [canteenDeduct, setCanteenDeduct] = useState(0);
    const [coValeDeduct, setCoValeDeduct] = useState(0);
    const [otherDeduct, setOtherDeduct] = useState(0);
    const [taxRefund, setTaxRefund] = useState(0);
    const [taxBalance, setTaxBalance] = useState(0);

    const canModify = state.userRole === 'System Admin' || state.userRole === 'Payroll Officer';

    const handleEditStart = (empId: string, currentOvr?: OverrideEntry) => {
        setEditingEmpId(empId);
        setRetroHours(currentOvr?.retroHours || 0);
        setAdjustments(currentOvr?.adjustments || 0);
        setCanteenDeduct(currentOvr?.canteenDeduct || 0);
        setCoValeDeduct(currentOvr?.coValeDeduct || 0);
        setOtherDeduct(currentOvr?.otherDeduct || 0);
        setTaxRefund(currentOvr?.taxRefund || 0);
        setTaxBalance(currentOvr?.taxBalance || 0);
    };

    const handleSaveOverride = (empId: string) => {
        if (!canModify) return;
        saveOverrides([{
            employeeId: empId,
            retroHours: Number(retroHours),
            adjustments: Number(adjustments),
            canteenDeduct: Number(canteenDeduct),
            coValeDeduct: Number(coValeDeduct),
            otherDeduct: Number(otherDeduct),
            taxRefund: Number(taxRefund),
            taxBalance: Number(taxBalance)
        }]);
        setEditingEmpId(null);
    };

    return (
        <>
            <Head title="Payroll Input Overrides" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Payroll Input Overrides</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Apply manual adjustments, retro-pay, canteen collections, company vale, and tax adjustments for the current cutoff.
                        </p>
                    </div>
                </div>

                {/* Overrides Table */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Cutoff Adjustment Console</CardTitle>
                        <CardDescription>
                            Manually override variables affecting current calculations. Values are reset when the cutoff is finalized.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                        <th className="py-3 px-6">Employee</th>
                                        <th className="py-3 px-3 text-center">Retro Hours</th>
                                        <th className="py-3 px-3 text-center">Adjustments (+)</th>
                                        <th className="py-3 px-3 text-center">Canteen (-)</th>
                                        <th className="py-3 px-3 text-center">Co. Vale (-)</th>
                                        <th className="py-3 px-3 text-center">Other Deduct (-)</th>
                                        <th className="py-3 px-3 text-center">Tax Refund (+)</th>
                                        <th className="py-3 px-3 text-center">Tax Bal (-)</th>
                                        <th className="py-3 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                    {state.employees.filter(e => e.paySchedule === state.currentCutoff.schedule && e.status === 'Active').map((emp) => {
                                        const ovr = state.overrides.find(o => o.employeeId === emp.id);
                                        const isEditing = editingEmpId === emp.id;

                                        return (
                                            <tr key={emp.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                                <td className="py-3.5 px-6">
                                                    <div className="font-semibold text-neutral-900 dark:text-white">{emp.name}</div>
                                                    <div className="text-xs text-neutral-400 font-mono">ID: {emp.id}</div>
                                                </td>
                                                
                                                {isEditing ? (
                                                    <>
                                                        <td className="py-3 px-2 text-center">
                                                            <input 
                                                                type="number" 
                                                                value={retroHours} 
                                                                onChange={(e) => setRetroHours(Number(e.target.value))}
                                                                className="w-16 p-1 border rounded text-xs text-center font-mono"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-2 text-center">
                                                            <input 
                                                                type="number" 
                                                                value={adjustments} 
                                                                onChange={(e) => setAdjustments(Number(e.target.value))}
                                                                className="w-20 p-1 border rounded text-xs text-center font-mono"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-2 text-center">
                                                            <input 
                                                                type="number" 
                                                                value={canteenDeduct} 
                                                                onChange={(e) => setCanteenDeduct(Number(e.target.value))}
                                                                className="w-16 p-1 border rounded text-xs text-center font-mono"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-2 text-center">
                                                            <input 
                                                                type="number" 
                                                                value={coValeDeduct} 
                                                                onChange={(e) => setCoValeDeduct(Number(e.target.value))}
                                                                className="w-16 p-1 border rounded text-xs text-center font-mono"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-2 text-center">
                                                            <input 
                                                                type="number" 
                                                                value={otherDeduct} 
                                                                onChange={(e) => setOtherDeduct(Number(e.target.value))}
                                                                className="w-16 p-1 border rounded text-xs text-center font-mono"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-2 text-center">
                                                            <input 
                                                                type="number" 
                                                                value={taxRefund} 
                                                                onChange={(e) => setTaxRefund(Number(e.target.value))}
                                                                className="w-16 p-1 border rounded text-xs text-center font-mono"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-2 text-center">
                                                            <input 
                                                                type="number" 
                                                                value={taxBalance} 
                                                                onChange={(e) => setTaxBalance(Number(e.target.value))}
                                                                className="w-16 p-1 border rounded text-xs text-center font-mono"
                                                            />
                                                        </td>
                                                        <td className="py-3.5 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Button 
                                                                    onClick={() => setEditingEmpId(null)}
                                                                    variant="outline" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 text-neutral-400 hover:text-neutral-600"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    onClick={() => handleSaveOverride(emp.id)}
                                                                    className="h-8 w-8 bg-emerald-600 text-white hover:bg-emerald-500 rounded flex items-center justify-center"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="py-3.5 px-3 text-center font-mono font-medium text-neutral-600 dark:text-neutral-350">{ovr?.retroHours || 0} hrs</td>
                                                        <td className="py-3.5 px-3 text-center font-mono text-emerald-600 font-semibold">₱{(ovr?.adjustments || 0).toLocaleString()}</td>
                                                        <td className="py-3.5 px-3 text-center font-mono text-rose-600">₱{(ovr?.canteenDeduct || 0).toLocaleString()}</td>
                                                        <td className="py-3.5 px-3 text-center font-mono text-rose-600">₱{(ovr?.coValeDeduct || 0).toLocaleString()}</td>
                                                        <td className="py-3.5 px-3 text-center font-mono text-rose-600">₱{(ovr?.otherDeduct || 0).toLocaleString()}</td>
                                                        <td className="py-3.5 px-3 text-center font-mono text-emerald-600 font-semibold">₱{(ovr?.taxRefund || 0).toLocaleString()}</td>
                                                        <td className="py-3.5 px-3 text-center font-mono text-rose-600">₱{(ovr?.taxBalance || 0).toLocaleString()}</td>
                                                        <td className="py-3.5 px-6 text-right">
                                                            {canModify ? (
                                                                <Button 
                                                                    onClick={() => handleEditStart(emp.id, ovr)}
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    className="h-8 border-neutral-200/80 hover:text-emerald-600"
                                                                >
                                                                    Edit
                                                                </Button>
                                                            ) : (
                                                                <span className="text-xs text-neutral-450 italic">Read-only</span>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Override.layout = {
    breadcrumbs: [
        { title: 'Payroll', href: '/payroll/draft' },
        { title: 'Overriding', href: '/payroll/override' },
    ],
};
