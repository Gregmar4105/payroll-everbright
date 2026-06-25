import { Head } from '@inertiajs/react';
import { Search, Edit, Plus, X, Check } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll } from '@/lib/payrollStore';

export default function Balance() {
    const { state, updateEmployee } = usePayroll();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    
    // Adjust credits form state
    const [selectedEmpId, setSelectedEmpId] = useState(state.employees[0]?.id || '');
    const [adjustType, setAdjustType] = useState<'vl' | 'sl'>('vl');
    const [adjustAmount, setAdjustAmount] = useState(1);

    const canModify = state.userRole === 'System Admin' || state.userRole === 'HR Manager';

    // Calculate leave balance for each employee
    // Start with a base of 15 VL and 15 SL, and deduct approved leaves
    const getLeaveBalances = () => {
        return state.employees.map(emp => {
            const approvedVL = state.leaves
                .filter(l => l.employeeId === emp.id && l.type === 'VL' && l.status === 'Approved')
                .reduce((sum, l) => sum + l.days, 0);

            const approvedSL = state.leaves
                .filter(l => l.employeeId === emp.id && l.type === 'SL' && l.status === 'Approved')
                .reduce((sum, l) => sum + l.days, 0);

            const approvedEmergency = state.leaves
                .filter(l => l.employeeId === emp.id && l.type === 'Emergency' && l.status === 'Approved')
                .reduce((sum, l) => sum + l.days, 0);

            // Starting allocations (we can keep custom starting credits or default)
            const initialVL = emp.name === 'Reynaldo Cruz' ? 15 : emp.name === 'Maria Santos' ? 10 : 6;
            const initialSL = emp.name === 'Reynaldo Cruz' ? 12 : emp.name === 'Maria Santos' ? 15 : 6;

            return {
                id: emp.id,
                name: emp.name,
                dept: emp.dept,
                vl: Math.max(0, initialVL - approvedVL),
                sl: Math.max(0, initialSL - approvedSL),
                emergency: Math.max(0, 5 - approvedEmergency),
                matPat: emp.employmentStatus === 'Regular' ? (emp.role.includes('Supervisor') || emp.role.includes('Lead') ? '105.0 Days' : '7.0 Days') : 'N/A'
            };
        });
    };

    const handleAdjustSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we are simulating, we can show a success message
        alert(`Successfully adjusted ${adjustType.toUpperCase()} credits by ${adjustAmount} days for employee ${selectedEmpId}!`);
        setIsAdjustOpen(false);
    };

    const balances = getLeaveBalances().filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.dept.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Head title="Leave Balance Tracking" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Leave Balance Tracking</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Track employee leave credits, ledger details, and record manually adjusted accruals.
                        </p>
                    </div>
                    {canModify && (
                        <Button onClick={() => setIsAdjustOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 size-sm">
                            <Plus className="h-4 w-4" /> Adjust Credits
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search employee leave credits..."
                            className="pl-9 pr-4 py-2 w-full rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-neutral-800 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
                        />
                    </div>
                </div>

                {/* Balances Card */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Leave Credits Directory</CardTitle>
                        <CardDescription>Available balances by leave classification.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">Employee</th>
                                        <th className="py-3.5 px-6 text-center">Vacation Leave (VL)</th>
                                        <th className="py-3.5 px-6 text-center">Sick Leave (SL)</th>
                                        <th className="py-3.5 px-6 text-center">Emergency Leave</th>
                                        <th className="py-3.5 px-6 text-center">Maternity/Paternity</th>
                                        <th className="py-3.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                    {balances.map((row) => (
                                        <tr key={row.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                            <td className="py-3.5 px-6">
                                                <div className="font-semibold text-neutral-900 dark:text-white">{row.name}</div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">{row.dept}</div>
                                            </td>
                                            <td className="py-3.5 px-6 text-center font-bold text-emerald-600 dark:text-emerald-450 font-mono">{row.vl.toFixed(1)} Days</td>
                                            <td className="py-3.5 px-6 text-center font-bold text-emerald-600 dark:text-emerald-450 font-mono">{row.sl.toFixed(1)} Days</td>
                                            <td className="py-3.5 px-6 text-center font-medium font-mono">{row.emergency.toFixed(1)} Days</td>
                                            <td className="py-3.5 px-6 text-center text-neutral-400 font-medium font-mono">{row.matPat}</td>
                                            <td className="py-3.5 px-6 text-right">
                                                <Button 
                                                    onClick={() => {
                                                        setSelectedEmpId(row.id);
                                                        setIsAdjustOpen(true);
                                                    }}
                                                    disabled={!canModify}
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-8 gap-1 hover:text-emerald-600"
                                                >
                                                    <Edit className="h-3 w-3" /> Adjust
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Adjust Credits Modal */}
                {isAdjustOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                        <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-sm w-full border border-neutral-250 p-6 space-y-4">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="text-base font-bold">Adjust Leave Credits</h3>
                                <button onClick={() => setIsAdjustOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-sm">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">Employee</label>
                                    <select 
                                        value={selectedEmpId}
                                        onChange={(e) => setSelectedEmpId(e.target.value)}
                                        className="w-full text-sm p-2 border border-neutral-200 bg-white rounded dark:bg-neutral-950 dark:border-neutral-800"
                                    >
                                        {state.employees.map(e => (
                                            <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase">Credit Type</label>
                                        <select 
                                            value={adjustType}
                                            onChange={(e) => setAdjustType(e.target.value as any)}
                                            className="w-full text-sm p-2 border border-neutral-200 bg-white rounded dark:bg-neutral-950 dark:border-neutral-800"
                                        >
                                            <option value="vl">Vacation Leave (VL)</option>
                                            <option value="sl">Sick Leave (SL)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase">Credit Change</label>
                                        <input 
                                            type="number"
                                            required
                                            value={adjustAmount}
                                            onChange={(e) => setAdjustAmount(Number(e.target.value))}
                                            placeholder="e.g. 2 or -2"
                                            className="w-full text-sm p-2 border border-neutral-200 bg-white rounded dark:bg-neutral-950 dark:border-neutral-800 font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2 border-t">
                                    <Button type="button" onClick={() => setIsAdjustOpen(false)} variant="outline">Cancel</Button>
                                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white">Save Changes</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Balance.layout = {
    breadcrumbs: [
        { title: 'Leave Management', href: '/leave-management/accruals' },
        { title: 'Balance tracking', href: '/leave-management/balance' },
    ],
};
