import { Head } from '@inertiajs/react';
import { Tag, Link2, ShieldCheck, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll } from '@/lib/payrollStore';

export default function CBA() {
    const { state } = usePayroll();

    // Count members dynamically
    const countMembers = (code: string) => {
        if (code === 'CBA-VAL-A') {
            return state.employees.filter(e => e.cbaTagged && (e.dept === 'Production' || e.dept === 'Manufacturing')).length;
        } else if (code === 'CBA-LOG-B') {
            return state.employees.filter(e => e.cbaTagged && (e.dept === 'Logistics' || e.dept === 'Warehouse')).length;
        } else {
            return state.employees.filter(e => !e.cbaTagged).length;
        }
    };

    const unionBrackets = [
        { 
            code: 'CBA-VAL-A', 
            name: 'Valenzuela Plant Association', 
            union: 'Everbright Workers Union (EWU)', 
            members: countMembers('CBA-VAL-A'), 
            bonusRate: '₱12,000 / Year', 
            baseMultiplier: '1.15x',
            rules: 'OT rate: +30%, NSD rate: +20%, Union Dues: 1%'
        },
        { 
            code: 'CBA-LOG-B', 
            name: 'Logistics Union Bracket', 
            union: 'Transport Workers Coalition (TWC)', 
            members: countMembers('CBA-LOG-B'), 
            bonusRate: '₱9,500 / Year', 
            baseMultiplier: '1.08x',
            rules: 'OT rate: +30%, NSD rate: +20%, Union Dues: 1%'
        },
        { 
            code: 'CBA-HQ-ADMIN', 
            name: 'HQ Administrative Bracket', 
            union: 'Non-Unionized / Ind. Contracts', 
            members: countMembers('CBA-HQ-ADMIN'), 
            bonusRate: 'N/A', 
            baseMultiplier: '1.00x',
            rules: 'OT rate: +25%, NSD rate: +10%, Union Dues: Exempt'
        },
    ];

    return (
        <>
            <Head title="CBA Tagging" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">CBA Tagging & Union Brackets</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Manage Collective Bargaining Agreements, union memberships, base pay multipliers, and compliance tags.
                        </p>
                    </div>
                </div>

                {/* Info Alert */}
                <Card className="border-emerald-250 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/10">
                    <CardHeader className="py-4">
                        <div className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-emerald-600 dark:text-emerald-450" />
                            <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Active Union Agreements Notice</CardTitle>
                        </div>
                        <CardDescription className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                            Wage rates, night differentials, and holiday pay formulas for Manufacturing and Logistics employees are bound by the EWU and TWC collective bargaining agreements signed in October 2025. Union Dues are calculated at exactly 1% of Basic/Regular Pay.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Brackets Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    {unionBrackets.map((bracket) => (
                        <Card key={bracket.code} className="border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between">
                            <CardHeader className="pb-3">
                                <Badge className="mb-2 bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 w-fit">
                                    {bracket.code}
                                </Badge>
                                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">{bracket.name}</CardTitle>
                                <CardDescription className="text-xs">{bracket.union}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Active Members:</span>
                                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{bracket.members} Employees</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Annual Signing Bonus:</span>
                                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{bracket.bonusRate}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-neutral-100 dark:border-neutral-850 pb-2">
                                        <span className="text-neutral-500">Base Wage Multiplier:</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{bracket.baseMultiplier}</span>
                                    </div>
                                    <div className="pt-2 text-[11px] text-neutral-500 dark:text-neutral-400 space-y-1">
                                        <div className="flex items-center gap-1">
                                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                            <span>{bracket.rules}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

CBA.layout = {
    breadcrumbs: [
        { title: 'Employees', href: '/employees/profiles' },
        { title: 'CBA tagging', href: '/employees/cba' },
    ],
};
