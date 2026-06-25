import { Head } from '@inertiajs/react';
import { Check, X, Clock, HelpCircle, User, AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll } from '@/lib/payrollStore';

export default function Validation() {
    const { state, saveAttendance } = usePayroll();
    const canModify = state.userRole === 'System Admin' || state.userRole === 'HR Manager' || state.userRole === 'Payroll Officer';

    // Overtime requests pending approval
    const [otApprovals, setOtApprovals] = useState([
        { employeeId: 'EB-RC-0392', name: 'Reynaldo Cruz', role: 'Production Supervisor', date: '2026-06-02', hours: 4.0, reason: 'Extended supervision of Plant A night shift wire wrapping.', status: 'Pending' },
        { employeeId: 'EB-CD-1140', name: 'Clarissa Dimagiba', role: 'Quality Control Lead', date: '2026-06-10', hours: 2.0, reason: 'Special inspection of Twine lot #B932.', status: 'Pending' },
    ]);

    const handleApproveOT = (empId: string, date: string, approve: boolean) => {
        if (!canModify) return;
        
        // Update approval list state
        setOtApprovals(prev => prev.map(item => {
            if (item.employeeId === empId && item.date === date) {
                return { ...item, status: approve ? 'Approved' : 'Rejected' };
            }
            return item;
        }));

        // If approved, update OT hours in attendance log
        if (approve) {
            const currentAttendance = state.attendance.find(a => a.employeeId === empId && a.date === date);
            if (currentAttendance) {
                const req = otApprovals.find(o => o.employeeId === empId && o.date === date);
                saveAttendance([{
                    ...currentAttendance,
                    otHours: req ? req.hours : 0
                }]);
            }
        }
    };

    // Audit Holiday Preceding Day Entitlement for June 12 Legal Holiday
    // Look at June 11 (day before)
    const auditHolidayEntitlement = () => {
        return state.employees.map(emp => {
            const precedingRecord = state.attendance.find(a => a.employeeId === emp.id && a.date === '2026-06-11');
            const holidayRecord = state.attendance.find(a => a.employeeId === emp.id && a.date === '2026-06-12');
            
            const workedPreceding = precedingRecord ? precedingRecord.present : false;
            const entitled = holidayRecord ? holidayRecord.workedPrecedingDay : true;

            return {
                id: emp.id,
                name: emp.name,
                role: emp.role,
                workedPreceding,
                entitled,
                holidayRecord
            };
        });
    };

    const handleToggleEntitlement = (empId: string) => {
        if (!canModify) return;
        const holidayRecord = state.attendance.find(a => a.employeeId === empId && a.date === '2026-06-12');
        if (holidayRecord) {
            saveAttendance([{
                ...holidayRecord,
                workedPrecedingDay: !holidayRecord.workedPrecedingDay
            }]);
        }
    };

    const holidayAudits = auditHolidayEntitlement();

    return (
        <>
            <Head title="Overtime & Time Validation" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Time Validation & Overtime Approvals</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Validate night differential, regular overtime, holiday premiums, and double-pay requests.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Overtime Queue */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Overtime Authorization Queue</CardTitle>
                            <CardDescription>Verify and approve hours before calculations are run.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                            <th className="py-3 px-6">Employee</th>
                                            <th className="py-3 px-6">Date</th>
                                            <th className="py-3 px-6 text-center">OT Hours</th>
                                            <th className="py-3 px-6">Reason / Justification</th>
                                            <th className="py-3 px-6 text-right">Status / Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                        {otApprovals.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                                <td className="py-3 px-6">
                                                    <div className="font-semibold text-neutral-900 dark:text-white">{row.name}</div>
                                                    <div className="text-xs text-neutral-400">{row.role}</div>
                                                </td>
                                                <td className="py-3 px-6 font-mono text-xs text-neutral-600 dark:text-neutral-400">{row.date}</td>
                                                <td className="py-3 px-6 text-center font-bold text-neutral-800 dark:text-neutral-200 font-mono">{row.hours.toFixed(1)} hrs</td>
                                                <td className="py-3 px-6 text-xs text-neutral-500 max-w-xs truncate" title={row.reason}>
                                                    {row.reason}
                                                </td>
                                                <td className="py-3 px-6 text-right">
                                                    {row.status === 'Pending' ? (
                                                        canModify ? (
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button 
                                                                    onClick={() => handleApproveOT(row.employeeId, row.date, false)}
                                                                    variant="outline" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 text-red-500 hover:bg-red-50 border-neutral-200"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    onClick={() => handleApproveOT(row.employeeId, row.date, true)}
                                                                    className="h-8 w-8 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center rounded"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Badge className="bg-neutral-100 text-neutral-400">Pending</Badge>
                                                        )
                                                    ) : (
                                                        <Badge className={row.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-red-50 text-red-700 border-red-250'}>
                                                            {row.status}
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Holiday Pay Audit Exception Column */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                <CardTitle className="text-lg">Holiday Pay Preceding Day Audit</CardTitle>
                            </div>
                            <CardDescription>
                                Legal Holiday: June 12 (Independence Day). Employees must work on June 11 to be paid.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {holidayAudits.map((audit) => (
                                <div key={audit.id} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2.5 text-xs">
                                    <div className="flex justify-between items-center pb-1.5 border-b border-neutral-50 dark:border-neutral-800">
                                        <div>
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200 block">{audit.name}</span>
                                            <span className="text-[10px] text-neutral-400 font-mono">{audit.role}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-neutral-400">June 11 Attendance:</span>
                                        <Badge className={`font-semibold py-0 px-1.5 ${audit.workedPreceding ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                            {audit.workedPreceding ? 'Present' : 'Absent'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-neutral-400">Holiday Pay Status:</span>
                                        <Badge className={`font-semibold py-0 px-1.5 ${audit.entitled ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                            {audit.entitled ? 'Entitled' : 'Not Entitled'}
                                        </Badge>
                                    </div>
                                    {canModify && (
                                        <Button
                                            onClick={() => handleToggleEntitlement(audit.id)}
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-[10px] h-7 border-neutral-200 mt-1"
                                        >
                                            Override Entitlement
                                        </Button>
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

Validation.layout = {
    breadcrumbs: [
        { title: 'Time & Attendance', href: '/time-attendance/roster' },
        { title: 'Validation', href: '/time-attendance/validation' },
    ],
};
