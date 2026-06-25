import { Head } from '@inertiajs/react';
import { Layers, Plus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll } from '@/lib/payrollStore';

const accrualPolicies = [
    { name: 'Vacation Leave Policy (VL)', accrualRate: '1.25 Days / Month', maxLimit: '15 Days / Year', type: 'Annual Rollover', members: 'Active Employees', status: 'Active' },
    { name: 'Sick Leave Policy (SL)', accrualRate: '1.25 Days / Month', maxLimit: '15 Days / Year', type: 'Annual Rollover (Cashable)', members: 'Active Employees', status: 'Active' },
    { name: 'Parental & Maternity Leave', accrualRate: 'As per statutory law', maxLimit: '105 Days / Event', type: 'No Rollover', members: 'Qualified Employees', status: 'Active' },
    { name: 'Emergency / Calamity Leave', accrualRate: 'Granted on event', maxLimit: '5 Days / Year', type: 'No Rollover', members: 'Active Employees', status: 'Active' },
];

export default function Accruals() {
    const { state } = usePayroll();
    const canModify = state.userRole === 'System Admin' || state.userRole === 'HR Manager';

    const handleRunAccrual = () => {
        if (!canModify) return;
        alert('Successfully processed monthly leave accruals (+1.25 days VL/SL) for all active accounts!');
    };

    return (
        <>
            <Head title="Leave Accrual Policies" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Leave Accrual Policies</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Configure leave entitlement parameters, accrual speeds, carry-over settings, and cash conversion options.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {canModify ? (
                            <>
                                <Button onClick={handleRunAccrual} variant="outline" size="sm" className="gap-1 bg-white dark:bg-neutral-800">
                                    <RefreshCw className="h-3.5 w-3.5" /> Run Monthly Accrual
                                </Button>
                                <Button onClick={() => alert('Creating a new leave policy is restricted in this prototype.')} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 size-sm">
                                    <Plus className="h-4 w-4" /> Add Policy
                                </Button>
                            </>
                        ) : (
                            <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-900 px-3 py-1">
                                View-Only Mode ({state.userRole})
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Policies Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {accrualPolicies.map((policy) => (
                        <Card key={policy.name} className="border-neutral-200/60 dark:border-neutral-800">
                            <CardHeader className="pb-3 flex flex-row items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">{policy.name}</CardTitle>
                                    <CardDescription>{policy.type}</CardDescription>
                                </div>
                                <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-450" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100 dark:bg-neutral-900/40 dark:border-neutral-800 text-xs">
                                    <div>
                                        <span className="text-neutral-500 block mb-0.5">Accrual Velocity:</span>
                                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{policy.accrualRate}</span>
                                    </div>
                                    <div>
                                        <span className="text-neutral-500 block mb-0.5">Accrual Limit:</span>
                                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{policy.maxLimit}</span>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-neutral-200/50 dark:border-neutral-800 flex justify-between">
                                        <span className="text-neutral-500">Applicable To:</span>
                                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{policy.members}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-medium">
                                        {policy.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

Accruals.layout = {
    breadcrumbs: [
        { title: 'Leave Management', href: '/leave-management/accruals' },
        { title: 'Accruals', href: '/leave-management/accruals' },
    ],
};
