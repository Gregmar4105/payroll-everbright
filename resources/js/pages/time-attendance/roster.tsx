import { Head } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, RosterEntry } from '@/lib/payrollStore';

const shiftTypes = [
    { code: '1st', name: '1st Shift (6AM - 2PM)', color: 'bg-emerald-500 text-white' },
    { code: '2nd', name: '2nd Shift (2PM - 10PM)', color: 'bg-teal-500 text-white' },
    { code: '3rd', name: '3rd Shift (10PM - 6AM - NSD)', color: 'bg-indigo-500 text-white' },
    { code: '4th', name: '4th Shift (7AM - 4PM)', color: 'bg-sky-500 text-white' },
    { code: 'Office', name: 'Office Shift (8AM - 5PM)', color: 'bg-blue-500 text-white' },
    { code: 'Office Prod', name: 'Office Prod (9AM - 6PM)', color: 'bg-cyan-500 text-white' },
    { code: 'Rest', name: 'Rest Day / Sunday Off', color: 'bg-neutral-300 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-250' },
];

export default function Roster() {
    const { state, saveRoster } = usePayroll();
    const [weekSelection, setWeekSelection] = useState<'week1' | 'week2'>('week1');

    const canModify = state.userRole === 'System Admin' || state.userRole === 'HR Manager';

    // Dates matching cutoff (June 1 - June 15, 2026)
    const week1Dates = [
        { date: '2026-06-01', label: 'Mon 01' },
        { date: '2026-06-02', label: 'Tue 02' },
        { date: '2026-06-03', label: 'Wed 03' },
        { date: '2026-06-04', label: 'Thu 04' },
        { date: '2026-06-05', label: 'Fri 05' },
        { date: '2026-06-06', label: 'Sat 06' },
        { date: '2026-06-07', label: 'Sun 07' },
    ];

    const week2Dates = [
        { date: '2026-06-08', label: 'Mon 08' },
        { date: '2026-06-09', label: 'Tue 09' },
        { date: '2026-06-10', label: 'Wed 10' },
        { date: '2026-06-11', label: 'Thu 11' },
        { date: '2026-06-12', label: 'Fri 12 (Holiday)' },
        { date: '2026-06-13', label: 'Sat 13' },
        { date: '2026-06-14', label: 'Sun 14' },
        { date: '2026-06-15', label: 'Mon 15' },
    ];

    const activeDates = weekSelection === 'week1' ? week1Dates : week2Dates;

    const handleShiftChange = (empId: string, date: string, shiftCode: RosterEntry['shiftCode']) => {
        if (!canModify) return;
        saveRoster([{ employeeId: empId, date, shiftCode }]);
    };

    return (
        <>
            <Head title="Roster Scheduling" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Roster Scheduling</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Assign shifts, plan work rosters, and track plant schedules for Valenzuela manufacturing teams.
                        </p>
                    </div>
                </div>

                {/* Shifts Legend */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {shiftTypes.slice(0, 4).map((shift) => (
                        <Card key={shift.code} className="border-neutral-200/60 dark:border-neutral-800">
                            <CardHeader className="p-4 flex flex-row items-center gap-3">
                                <div className={`h-3.5 w-3.5 rounded-full ${shift.color.split(' ')[0]}`} />
                                <div className="space-y-0.5">
                                    <CardTitle className="text-sm font-bold">{shift.name}</CardTitle>
                                    <CardDescription className="text-[10px] font-mono">Code: {shift.code}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* Calendar Grid View */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
                        <div>
                            <CardTitle className="text-lg">Weekly Schedule</CardTitle>
                            <CardDescription>Shift allocations for active cutoff (June 1 - June 15, 2026).</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                onClick={() => setWeekSelection('week1')} 
                                variant={weekSelection === 'week1' ? 'default' : 'outline'} 
                                size="sm"
                                className="text-xs"
                            >
                                Week 1 (Jun 1-7)
                            </Button>
                            <Button 
                                onClick={() => setWeekSelection('week2')} 
                                variant={weekSelection === 'week2' ? 'default' : 'outline'} 
                                size="sm"
                                className="text-xs"
                            >
                                Week 2 (Jun 8-15)
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">Employee</th>
                                        {activeDates.map((d) => (
                                            <th key={d.date} className="py-3.5 px-3 text-center text-[11px] font-bold">
                                                {d.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                    {state.employees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                            <td className="py-3 px-6">
                                                <div className="font-semibold text-neutral-900 dark:text-white">{emp.name}</div>
                                                <div className="text-[10px] text-neutral-400 font-medium font-mono">{emp.dept} | {emp.id}</div>
                                            </td>
                                            {activeDates.map((d) => {
                                                const rosterEntry = state.rosters.find(
                                                    (r) => r.employeeId === emp.id && r.date === d.date
                                                );
                                                const currentShift = rosterEntry?.shiftCode || 'Rest';
                                                const matched = shiftTypes.find((s) => s.code === currentShift);
                                                
                                                const isSunday = new Date(d.date).getDay() === 0;

                                                return (
                                                    <td key={d.date} className="py-3 px-3 text-center">
                                                        {canModify ? (
                                                            <select
                                                                value={currentShift}
                                                                onChange={(e) => handleShiftChange(emp.id, d.date, e.target.value as any)}
                                                                className={`px-2 py-1 rounded text-xs font-semibold focus:outline-none border-0 ring-1 ring-neutral-200 dark:ring-neutral-800 focus:ring-emerald-500 dark:bg-neutral-900 dark:text-white cursor-pointer ${
                                                                    isSunday && currentShift === 'Rest' ? 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800/50' : 'bg-white'
                                                                }`}
                                                            >
                                                                {shiftTypes.map(st => (
                                                                    <option key={st.code} value={st.code}>{st.code}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-semibold ${
                                                                currentShift === 'Rest' ? 'bg-neutral-150 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400' : matched?.color
                                                            }`}>
                                                                {currentShift}
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}
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

Roster.layout = {
    breadcrumbs: [
        { title: 'Time & Attendance', href: '/time-attendance/roster' },
        { title: 'Roster scheduling', href: '/time-attendance/roster' },
    ],
};
