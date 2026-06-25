import { Head } from '@inertiajs/react';
import { Calendar, CheckCircle, RefreshCw, Star, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll } from '@/lib/payrollStore';

export default function EmploymentStatus() {
    const { state, updateEmployee } = usePayroll();
    const canModify = state.userRole === 'System Admin' || state.userRole === 'HR Manager';

    // Get all employees and calculate target review date (6 months after date hired)
    const getTargetReviewDate = (hiredStr: string) => {
        if (!hiredStr) return 'Pending';
        const d = new Date(hiredStr);
        d.setMonth(d.getMonth() + 6);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const handleRegularize = (id: string) => {
        if (!canModify) return;
        if (confirm('Regularize this employee? This will activate CBA overtime benefits (1.30x OT, 1.20x NSD) and enable union dues deductions.')) {
            updateEmployee(id, {
                employmentStatus: 'Regular',
                cbaTagged: true // CBA tags automatically set on regularization for plant workers
            });
        }
    };

    return (
        <>
            <Head title="Employment Status Tracking" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Employment Status & Regularizations</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Monitor new hires during their 6-month probationary periods and coordinate CBA conversions.
                        </p>
                    </div>
                </div>

                {/* Main Card */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Probationary & Regularization Tracker</CardTitle>
                        <CardDescription>Conversion pipeline for contract and probationary staff.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">Employee</th>
                                        <th className="py-3.5 px-6">Hire Date</th>
                                        <th className="py-3.5 px-6">6-Month Target Review</th>
                                        <th className="py-3.5 px-6">Current Status</th>
                                        <th className="py-3.5 px-6">CBA Tag</th>
                                        <th className="py-3.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                    {state.employees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                            <td className="py-3.5 px-6">
                                                <div className="font-semibold text-neutral-900 dark:text-white">{emp.name}</div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">{emp.role}</div>
                                            </td>
                                            <td className="py-3.5 px-6 text-neutral-700 dark:text-neutral-300 font-mono text-xs">
                                                {new Date(emp.dateHired).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="py-3.5 px-6 text-neutral-700 dark:text-neutral-300">
                                                <div className="flex items-center gap-1.5 font-medium text-neutral-900 dark:text-white">
                                                    <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> 
                                                    {getTargetReviewDate(emp.dateHired)}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-6">
                                                <Badge className={`
                                                    font-medium
                                                    ${emp.employmentStatus === 'Probationary' ? 'bg-amber-50 text-amber-700 border-amber-200/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200/40'}
                                                `}>
                                                    {emp.employmentStatus}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-6">
                                                <Badge variant="outline" className={`
                                                    font-medium text-[10px]
                                                    ${emp.cbaTagged ? 'border-emerald-200 text-emerald-700 bg-emerald-50/10' : 'border-neutral-250 text-neutral-400'}
                                                `}>
                                                    {emp.cbaTagged ? 'CBA Active' : 'No Tag'}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-6 text-right">
                                                {emp.employmentStatus === 'Probationary' ? (
                                                    <Button 
                                                        onClick={() => handleRegularize(emp.id)}
                                                        disabled={!canModify}
                                                        size="sm" 
                                                        className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs"
                                                    >
                                                        Regularize
                                                    </Button>
                                                ) : (
                                                    <div className="text-xs text-neutral-400 flex items-center justify-end gap-1 font-medium">
                                                        <CheckCircle className="h-4 w-4 text-emerald-500" /> Regularized
                                                    </div>
                                                )}
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

EmploymentStatus.layout = {
    breadcrumbs: [
        { title: 'Employees', href: '/employees/profiles' },
        { title: 'Employment Status', href: '/employees/status' },
    ],
};
