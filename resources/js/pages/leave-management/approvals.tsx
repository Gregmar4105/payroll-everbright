import { Head } from '@inertiajs/react';
import { Check, X, Calendar, FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, LeaveRequest } from '@/lib/payrollStore';

export default function Approvals() {
    const { state, updateLeaveStatus, fileLeave } = usePayroll();
    const [isAddOpen, setIsAddOpen] = useState(false);
    
    // Form state for creating request
    const [empId, setEmpId] = useState(state.employees[0]?.id || '');
    const [leaveType, setLeaveType] = useState<LeaveRequest['type']>('VL');
    const [start, setStart] = useState('2026-06-08');
    const [end, setEnd] = useState('2026-06-08');
    const [days, setDays] = useState(1);
    const [reason, setReason] = useState('');

    const canModify = state.userRole === 'System Admin' || state.userRole === 'HR Manager';

    const handleApprove = (id: string, approve: boolean) => {
        if (!canModify) return;
        updateLeaveStatus(id, approve ? 'Approved' : 'Rejected');
    };

    const handleFileLeaveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fileLeave({
            employeeId: empId,
            type: leaveType,
            startDate: start,
            endDate: end,
            days: Number(days),
            status: 'Pending',
            monetized: false
        });
        setIsAddOpen(false);
        setReason('');
    };

    const displayLeaves = state.leaves.map(l => {
        const emp = state.employees.find(e => e.id === l.employeeId);
        return {
            ...l,
            empName: emp ? emp.name : 'Unknown Employee',
            empRole: emp ? emp.role : 'Staff'
        };
    });

    return (
        <>
            <Head title="Leave Approvals" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Leave Approvals & Routing</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Approve or reject employee leave requests and track department calendars.
                        </p>
                    </div>
                    {state.userRole !== 'Finance Approver' && (
                        <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 size-sm">
                            <Plus className="h-4 w-4" /> File Leave Request
                        </Button>
                    )}
                </div>

                {/* Add Request Form Drawer Overlay */}
                {isAddOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                        <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-md w-full border border-neutral-250 p-6 space-y-4">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="text-base font-bold">Submit Leave Request</h3>
                                <button onClick={() => setIsAddOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleFileLeaveSubmit} className="space-y-4 text-sm">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">Employee</label>
                                    <select 
                                        value={empId}
                                        onChange={(e) => setEmpId(e.target.value)}
                                        className="w-full text-sm p-2 border border-neutral-200 bg-white rounded dark:bg-neutral-950 dark:border-neutral-800"
                                    >
                                        {state.employees.map(e => (
                                            <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase">Leave Type</label>
                                        <select 
                                            value={leaveType}
                                            onChange={(e) => setLeaveType(e.target.value as any)}
                                            className="w-full text-sm p-2 border border-neutral-200 bg-white rounded dark:bg-neutral-950 dark:border-neutral-800"
                                        >
                                            <option value="VL">Vacation Leave (VL)</option>
                                            <option value="SL">Sick Leave (SL)</option>
                                            <option value="Union">Union Leave</option>
                                            <option value="Paternity">Paternity Leave</option>
                                            <option value="Maternity">Maternity Leave</option>
                                            <option value="Bereavement">Bereavement Leave</option>
                                            <option value="Emergency">Emergency Leave</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase">Duration (Days)</label>
                                        <input 
                                            type="number"
                                            required
                                            value={days}
                                            onChange={(e) => setDays(Number(e.target.value))}
                                            className="w-full text-sm p-2 border border-neutral-200 bg-white rounded dark:bg-neutral-950 dark:border-neutral-800 font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase">Start Date</label>
                                        <input 
                                            type="date"
                                            value={start}
                                            onChange={(e) => setStart(e.target.value)}
                                            className="w-full text-sm p-2 border border-neutral-200 bg-white rounded dark:bg-neutral-950 dark:border-neutral-800 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase">End Date</label>
                                        <input 
                                            type="date"
                                            value={end}
                                            onChange={(e) => setEnd(e.target.value)}
                                            className="w-full text-sm p-2 border border-neutral-200 bg-white rounded dark:bg-neutral-950 dark:border-neutral-800 font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">Justification Note</label>
                                    <textarea 
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Family emergency/Medical checkup details..."
                                        className="w-full text-sm p-2 border border-neutral-200 bg-white rounded dark:bg-neutral-950 dark:border-neutral-800 h-20"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2 border-t">
                                    <Button type="button" onClick={() => setIsAddOpen(false)} variant="outline">Cancel</Button>
                                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white">File Leave</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Requests Table */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Leave Routing & Approvals Queue</CardTitle>
                        <CardDescription>Verify and authorize leave requests before calculations are run.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                        <th className="py-3 px-6">Employee</th>
                                        <th className="py-3 px-6">Leave Type</th>
                                        <th className="py-3 px-6">Leave Dates</th>
                                        <th className="py-3 px-6 text-center">Duration</th>
                                        <th className="py-3 px-6">Approval Status</th>
                                        <th className="py-3 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                    {displayLeaves.map((row) => (
                                        <tr key={row.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                            <td className="py-3.5 px-6">
                                                <div className="font-semibold text-neutral-900 dark:text-white">{row.empName}</div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">{row.empRole}</div>
                                            </td>
                                            <td className="py-3.5 px-6">
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-medium">
                                                    {row.type}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-6 text-neutral-700 dark:text-neutral-300">
                                                <div className="flex items-center gap-1.5 font-medium font-mono text-xs">
                                                    <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> {row.startDate} - {row.endDate}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-6 text-center font-bold text-neutral-800 dark:text-neutral-200 font-mono">{row.days.toFixed(1)} Days</td>
                                            <td className="py-3.5 px-6">
                                                <Badge className={`
                                                    font-medium
                                                    ${row.status === 'Approved' && 'bg-emerald-50 text-emerald-700 border-emerald-200/50'}
                                                    ${row.status === 'Rejected' && 'bg-red-50 text-red-700 border-red-200/50'}
                                                    ${row.status === 'Pending' && 'bg-amber-50 text-amber-700 border-amber-200/50'}
                                                `}>
                                                    {row.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-6 text-right">
                                                {row.status === 'Pending' && (
                                                    canModify ? (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button 
                                                                onClick={() => handleApprove(row.id, false)}
                                                                variant="outline" 
                                                                size="icon" 
                                                                className="h-8 w-8 text-red-500 hover:bg-red-50 border-neutral-200"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                            <Button 
                                                                onClick={() => handleApprove(row.id, true)}
                                                                className="h-8 w-8 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center rounded"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-neutral-450 italic">Awaiting Approval</span>
                                                    )
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

Approvals.layout = {
    breadcrumbs: [
        { title: 'Leave Management', href: '/leave-management/accruals' },
        { title: 'Routing/Approvals', href: '/leave-management/approvals' },
    ],
};
