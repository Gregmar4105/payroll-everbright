import { Head } from '@inertiajs/react';
import { Search, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll } from '@/lib/payrollStore';

export default function File201() {
    const { state } = usePayroll();
    const [searchTerm, setSearchTerm] = useState('');

    // Filter employees
    const filteredEmployees = state.employees.filter((emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.dept.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mock document checklist mapping based on employee ID
    const getDocsForEmployee = (id: string) => {
        if (id === 'EB-RC-0392' || id === 'EB-MS-0140') {
            return { nbi: 'Submitted', contract: 'Submitted', id: 'Submitted', diploma: 'Submitted', medical: 'Submitted' };
        } else if (id === 'EB-JR-0592') {
            return { nbi: 'Submitted', contract: 'Submitted', id: 'Submitted', diploma: 'Missing', medical: 'Submitted' };
        } else if (id === 'EB-CD-1140') {
            return { nbi: 'Submitted', contract: 'Submitted', id: 'Submitted', diploma: 'Submitted', medical: 'Missing' };
        } else {
            return { nbi: 'Submitted', contract: 'Pending Review', id: 'Submitted', diploma: 'Missing', medical: 'Missing' };
        }
    };

    return (
        <>
            <Head title="Employee 201 Files" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Employee 201 Files</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Manage official records, employment contracts, and statutory registration codes for compliance audits.
                        </p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="border-neutral-200/60 dark:border-neutral-800 lg:col-span-2">
                        <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg">201 Compliance Checklist</CardTitle>
                                <CardDescription>Onboarding documentation status audit.</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search employees..."
                                    className="pl-9 pr-4 py-1.5 w-full rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:ring-emerald-400 text-neutral-850 dark:text-neutral-200"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                            <th className="py-3.5 px-6">Employee</th>
                                            <th className="py-3.5 px-6 text-center">NBI</th>
                                            <th className="py-3.5 px-6 text-center">Contract</th>
                                            <th className="py-3.5 px-6 text-center">Gov IDs</th>
                                            <th className="py-3.5 px-6 text-center">Diploma</th>
                                            <th className="py-3.5 px-6 text-center">Medical</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                        {filteredEmployees.map((emp) => {
                                            const docs = getDocsForEmployee(emp.id);
                                            return (
                                                <tr key={emp.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                                    <td className="py-3 px-6">
                                                        <div className="font-semibold text-neutral-900 dark:text-white">{emp.name}</div>
                                                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{emp.dept}</div>
                                                    </td>
                                                    {[docs.nbi, docs.contract, docs.id, docs.diploma, docs.medical].map((status, index) => (
                                                        <td key={index} className="py-3 px-6 text-center">
                                                            <span className="inline-flex justify-center">
                                                                {status === 'Submitted' && (
                                                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/40 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 font-medium">
                                                                        <CheckCircle2 className="h-3 w-3 mr-0.5 text-emerald-600 dark:text-emerald-400" /> Yes
                                                                    </Badge>
                                                                )}
                                                                {status === 'Pending Review' && (
                                                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200/40 hover:bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50 font-medium">
                                                                        <AlertCircle className="h-3 w-3 mr-0.5" /> Review
                                                                    </Badge>
                                                                )}
                                                                {status === 'Missing' && (
                                                                    <Badge className="bg-rose-50 text-rose-700 border-rose-200/40 hover:bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50 font-medium">
                                                                        <AlertCircle className="h-3 w-3 mr-0.5" /> Missing
                                                                    </Badge>
                                                                )}
                                                            </span>
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200/60 dark:border-neutral-800">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <CardTitle className="text-lg">Statutory IDs Registry</CardTitle>
                            </div>
                            <CardDescription>Government agency registry codes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {filteredEmployees.map(emp => (
                                <div key={emp.id} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 text-xs">
                                    <div className="flex justify-between items-center border-b border-neutral-50 dark:border-neutral-800 pb-1.5">
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">{emp.name}</span>
                                        <span className="text-[10px] text-neutral-400 font-mono">ID: {emp.id}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
                                        <div>
                                            <span className="text-neutral-400 block text-[9px] uppercase font-sans">SSS Number</span>
                                            <span className="text-neutral-700 dark:text-neutral-300">{emp.sssNo || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400 block text-[9px] uppercase font-sans">PhilHealth ID</span>
                                            <span className="text-neutral-700 dark:text-neutral-300">{emp.phicNo || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400 block text-[9px] uppercase font-sans">Pag-IBIG No</span>
                                            <span className="text-neutral-700 dark:text-neutral-300">{emp.hdmfNo || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

File201.layout = {
    breadcrumbs: [
        { title: 'Employees', href: '/employees/profiles' },
        { title: '201 Files', href: '/employees/201-files' },
    ],
};
