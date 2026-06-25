import { Head } from '@inertiajs/react';
import { Coins, Settings, Check, Edit2, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, Employee } from '@/lib/payrollStore';

const salaryGrades = [
    { grade: 'Grade 1 (Entry)', baseMonthly: '₱16,500.00', dailyRate: '₱634.62', type: 'Rank & File', positions: 'Helper, Packer, Janitor' },
    { grade: 'Grade 2', baseMonthly: '₱18,200.00', dailyRate: '₱700.00', type: 'Rank & File', positions: 'Technician, Forklift Driver' },
    { grade: 'Grade 3', baseMonthly: '₱24,000.00', dailyRate: '₱923.08', type: 'Rank & File / Skilled', positions: 'Quality Inspector, Machine Lead' },
    { grade: 'Grade 4 (Supervisory)', baseMonthly: '₱35,000.00', dailyRate: '₱1,346.15', type: 'Supervisory', positions: 'Shift Supervisor, Logistics Coord' },
    { grade: 'Grade 5 (Managerial)', baseMonthly: '₱65,000.00', dailyRate: '₱2,500.00', type: 'Managerial', positions: 'Plant Manager, HR Manager' },
];

export default function BasePay() {
    const { state, updateEmployee } = usePayroll();
    const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
    const [editSalary, setEditSalary] = useState(0);
    const [editSchedule, setEditSchedule] = useState<Employee['paySchedule']>('Semi-Monthly');

    const canModify = state.userRole === 'System Admin' || state.userRole === 'Payroll Officer';

    const handleSavePay = (id: string) => {
        if (!canModify) return;
        updateEmployee(id, {
            basicSalary: editSalary,
            paySchedule: editSchedule
        });
        setEditingEmpId(null);
    };

    const handleEditStart = (emp: Employee) => {
        setEditingEmpId(emp.id);
        setEditSalary(emp.basicSalary);
        setEditSchedule(emp.paySchedule);
    };

    return (
        <>
            <Head title="Base Pay Scales" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Base Pay Structures</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Establish salary grades, regular daily wage rates, and minimum wage compliance schedules.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Salary Scales Card */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Standard Grade Matrices</CardTitle>
                            <CardDescription>Salary grade classifications matching job roles and basic daily payouts.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                            <th className="py-3 px-6">Salary Grade</th>
                                            <th className="py-3 px-6">Monthly Equivalent</th>
                                            <th className="py-3 px-6">Daily Equivalent</th>
                                            <th className="py-3 px-6">Classification</th>
                                            <th className="py-3 px-6 text-right">Mapped Positions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                        {salaryGrades.map((row) => (
                                            <tr key={row.grade} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                                <td className="py-3.5 px-6 font-semibold text-neutral-900 dark:text-white">{row.grade}</td>
                                                <td className="py-3.5 px-6 text-neutral-700 dark:text-neutral-300 font-medium font-mono">{row.baseMonthly}</td>
                                                <td className="py-3.5 px-6 font-mono text-neutral-600 dark:text-neutral-450">{row.dailyRate}</td>
                                                <td className="py-3.5 px-6">
                                                    <Badge className={`
                                                        font-medium text-xs
                                                        ${row.type === 'Rank & File' && 'bg-emerald-50 text-emerald-700 border-emerald-100'}
                                                        ${row.type.includes('Skilled') && 'bg-teal-50 text-teal-700 border-teal-100'}
                                                        ${row.type === 'Supervisory' && 'bg-sky-50 text-sky-700 border-sky-100'}
                                                        ${row.type === 'Managerial' && 'bg-purple-50 text-purple-700 border-purple-100'}
                                                    `}>
                                                        {row.type}
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5 px-6 text-neutral-500 dark:text-neutral-405 text-xs text-right">{row.positions}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employee Pay Registry */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Employee Base Pay Settings</CardTitle>
                            <CardDescription>Adjust pay rates and cycles directly.</CardDescription>
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
                                                <label className="text-[10px] text-neutral-450 uppercase font-bold">Base Rate (₱)</label>
                                                <input 
                                                    type="number"
                                                    value={editSalary}
                                                    onChange={(e) => setEditSalary(Number(e.target.value))}
                                                    className="w-full p-1 border rounded text-xs font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-neutral-450 uppercase font-bold">Schedule</label>
                                                <select 
                                                    value={editSchedule}
                                                    onChange={(e) => setEditSchedule(e.target.value as any)}
                                                    className="w-full p-1 border rounded text-xs"
                                                >
                                                    <option value="Weekly">Weekly</option>
                                                    <option value="Bi-Monthly">Bi-Monthly</option>
                                                    <option value="Semi-Monthly">Semi-Monthly</option>
                                                    <option value="Monthly">Monthly</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2 justify-end pt-1">
                                                <Button size="sm" variant="outline" onClick={() => setEditingEmpId(null)} className="h-7 text-[10px]">
                                                    Cancel
                                                </Button>
                                                <Button size="sm" onClick={() => handleSavePay(emp.id)} className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white">
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                                            <div>
                                                <span className="text-neutral-400 block text-[9px] uppercase font-sans">Base Rate</span>
                                                <span className="font-bold text-neutral-800 dark:text-neutral-200">₱{emp.basicSalary.toLocaleString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-neutral-400 block text-[9px] uppercase font-sans">Schedule</span>
                                                <span className="font-bold text-neutral-800 dark:text-neutral-200">{emp.paySchedule}</span>
                                            </div>
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

BasePay.layout = {
    breadcrumbs: [
        { title: 'Compensation & Benefits', href: '/compensation-benefits/base-pay' },
        { title: 'Base pay', href: '/compensation-benefits/base-pay' },
    ],
};
