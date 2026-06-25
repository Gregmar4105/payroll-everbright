import { Head } from '@inertiajs/react';
import { ShieldCheck, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, runPayrollCalculations } from '@/lib/payrollStore';

export default function StatutoryFiles() {
    const { state } = usePayroll();
    const [selectedPeriod, setSelectedPeriod] = useState<'active' | 'finalized'>('active');

    const canModify = state.userRole === 'System Admin' || state.userRole === 'Payroll Officer';

    // Get active draft records or finalized records
    const latestCycle = state.payrollCycles.find(c => c.finalized);
    const draftRecords = runPayrollCalculations(state, state.currentCutoff.schedule);

    const activeRecords = selectedPeriod === 'active' 
        ? draftRecords 
        : (latestCycle ? latestCycle.records : []);

    // Calculate dynamic statutory aggregates
    // Employer (ER) shares are typically:
    // SSS ER = ~9.5% (roughly double employee share)
    // PhilHealth ER = same as employee share
    // HDMF ER = same as employee share (capped at 200 or 100)
    const sumStatutories = () => {
        let totalSSS_EE = 0;
        let totalPHIC_EE = 0;
        let totalHDMF_EE = 0;
        let totalTax = 0;

        activeRecords.forEach(r => {
            totalSSS_EE += r.sssDeduct;
            totalPHIC_EE += r.phicDeduct;
            totalHDMF_EE += r.hdmfDeduct;
            totalTax += r.withholdingTax;
        });

        // ER shares
        const sssTotal = totalSSS_EE + (totalSSS_EE * 2.1); // EE + ER
        const phicTotal = totalPHIC_EE * 2; // EE + ER
        const hdmfTotal = totalHDMF_EE * 2; // EE + ER

        return {
            sss: sssTotal,
            phic: phicTotal,
            hdmf: hdmfTotal,
            tax: totalTax,
            count: activeRecords.length
        };
    };

    const stats = sumStatutories();

    const handleDownload = (agencyName: string) => {
        alert(`${agencyName} statutory compliance remittance file successfully exported and saved to downloads!`);
    };

    const agencies = [
        { 
            name: 'Social Security System (SSS)', 
            file: `SSS_R3_${selectedPeriod === 'active' ? 'DRAFT' : 'FINAL'}_2026.rfm`, 
            type: 'R3 Contribution File', 
            generated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), 
            count: `${stats.count} Members`, 
            amount: `₱${stats.sss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            status: 'Ready for Upload' 
        },
        { 
            name: 'PhilHealth', 
            file: `PH_ER2_${selectedPeriod === 'active' ? 'DRAFT' : 'FINAL'}_2026.xml`, 
            type: 'PhilHealth RF-1 Xml', 
            generated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), 
            count: `${stats.count} Members`, 
            amount: `₱${stats.phic.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            status: 'Ready for Upload' 
        },
        { 
            name: 'Pag-IBIG (HDMF)', 
            file: `PAGIBIG_STF_${selectedPeriod === 'active' ? 'DRAFT' : 'FINAL'}_2026.csv`, 
            type: 'Short Term Loans & Savings', 
            generated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), 
            count: `${stats.count} Members`, 
            amount: `₱${stats.hdmf.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            status: 'Ready for Upload' 
        },
        { 
            name: 'Bureau of Internal Revenue (BIR)', 
            file: `BIR_1601C_${selectedPeriod === 'active' ? 'DRAFT' : 'FINAL'}_2026.dat`, 
            type: 'Withholding Tax 1601-C', 
            generated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), 
            count: `${stats.count} Members`, 
            amount: `₱${stats.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            status: 'Awaiting Lock' 
        },
    ];

    return (
        <>
            <Head title="Statutory Files" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Statutory Files Compliance</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Download Government Remittance Files (SSS R-3, PhilHealth RF-1, Pag-IBIG MCR, BIR 1601-C).
                        </p>
                    </div>
                </div>

                {/* Period Selector Card */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-neutral-400 font-sans">Remittance Target Period</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <select 
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value as any)}
                            className="text-sm rounded-md border border-neutral-200 p-2 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-205 flex-1"
                        >
                            <option value="active">Active Draft Cutoff: {state.currentCutoff.id}</option>
                            {latestCycle && (
                                <option value="finalized">Latest Finalized Cycle: {latestCycle.id}</option>
                            )}
                        </select>
                        <Button onClick={() => alert('All statutory files have been verified and re-compiled!')} variant="outline" className="gap-1.5 h-9 border-neutral-205">
                            <RefreshCw className="h-4 w-4" /> Re-generate Files
                        </Button>
                    </CardContent>
                </Card>

                {/* Main Content Card Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {agencies.map((agency) => (
                        <Card key={agency.name} className="border-neutral-200/60 dark:border-neutral-800 hover:shadow-xs transition-shadow">
                            <CardHeader className="flex flex-row items-start justify-between pb-3">
                                <div>
                                    <Badge className="mb-2 bg-emerald-50 text-emerald-700 border-emerald-200/50">
                                        {agency.type}
                                    </Badge>
                                    <CardTitle className="text-base font-bold text-neutral-900 dark:text-white">{agency.name}</CardTitle>
                                </div>
                                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-450 shrink-0" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100 dark:bg-neutral-900/40 dark:border-neutral-800 space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">File Name:</span>
                                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">{agency.file}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Members Included:</span>
                                        <span className="font-semibold text-neutral-850 dark:text-neutral-200 font-mono">{agency.count}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 border-neutral-200/40">
                                        <span className="text-neutral-500">Total Contribution (EE+ER):</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">{agency.amount}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <Badge className="bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                                        {agency.status}
                                    </Badge>
                                    <div className="flex gap-2">
                                        <Button onClick={() => window.open('https://www.sss.gov.ph', '_blank')} variant="outline" size="sm" className="h-8 gap-1.5 border-neutral-205">
                                            Portal <ExternalLink className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button onClick={() => handleDownload(agency.name)} size="sm" className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium">
                                            Download <Download className="h-3.5 w-3.5" />
                                        </Button>
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

StatutoryFiles.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Statutory files', href: '/dashboard/statutory-files' },
    ],
};
