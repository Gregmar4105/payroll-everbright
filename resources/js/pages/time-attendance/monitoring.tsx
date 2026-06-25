import { Head } from '@inertiajs/react';
import { 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    Info, 
    Search, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    SlidersHorizontal, 
    Users,
    Save,
    Undo2
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, AttendanceRecord, Employee } from '@/lib/payrollStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

const shiftTypes = [
    { code: '1st', name: '1st Shift (6AM - 2PM)', color: 'bg-emerald-500 text-white' },
    { code: '2nd', name: '2nd Shift (2PM - 10PM)', color: 'bg-teal-500 text-white' },
    { code: '3rd', name: '3rd Shift (10PM - 6AM - NSD)', color: 'bg-indigo-500 text-white' },
    { code: '4th', name: '4th Shift (7AM - 4PM)', color: 'bg-sky-500 text-white' },
    { code: 'Office', name: 'Office Shift (8AM - 5PM)', color: 'bg-blue-500 text-white' },
    { code: 'Office Prod', name: 'Office Prod (9AM - 6PM)', color: 'bg-cyan-500 text-white' },
    { code: 'Rest', name: 'Rest Day / Sunday Off', color: 'bg-neutral-300 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200' },
];

export default function Monitoring() {
    const { state, saveAttendance } = usePayroll();
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    
    // Generate dates within the current active cutoff
    const dateList = useMemo(() => {
        const start = new Date(state.currentCutoff.start);
        const end = new Date(state.currentCutoff.end);
        const list: string[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            list.push(d.toISOString().split('T')[0]);
        }
        return list;
    }, [state.currentCutoff]);

    // Active date state defaulting to the first date of the cutoff
    const [selectedDate, setSelectedDate] = useState(dateList[0] || '2026-06-01');

    // Make sure selectedDate matches dateList if currentCutoff changes
    useEffect(() => {
        if (dateList.length > 0 && !dateList.includes(selectedDate)) {
            setSelectedDate(dateList[0]);
        }
    }, [dateList]);

    const canModify = state.userRole === 'System Admin' || state.userRole === 'HR Manager' || state.userRole === 'Payroll Officer';

    // Helper: get shift details
    const getShiftForEmp = (empId: string, date: string) => {
        const roster = state.rosters.find(r => r.employeeId === empId && r.date === date);
        const shiftCode = roster?.shiftCode || 'Rest';
        return shiftTypes.find(s => s.code === shiftCode) || shiftTypes[6];
    };

    // Filter employees rostered for today (shift code is NOT Rest)
    const rosteredEmployees = useMemo(() => {
        return state.employees.filter(emp => {
            const shift = getShiftForEmp(emp.id, selectedDate);
            return shift.code !== 'Rest';
        });
    }, [state.employees, state.rosters, selectedDate]);

    // Calculate metrics
    const metrics = useMemo(() => {
        const totalRostered = rosteredEmployees.length;
        let present = 0;
        let absent = 0;
        let unrecorded = 0;

        rosteredEmployees.forEach(emp => {
            const att = state.attendance.find(a => a.employeeId === emp.id && a.date === selectedDate);
            if (!att) {
                unrecorded++;
            } else if (att.present) {
                present++;
            } else {
                absent++;
            }
        });

        const rate = totalRostered > 0 ? Math.round((present / totalRostered) * 100) : 0;

        return { totalRostered, present, absent, unrecorded, rate };
    }, [rosteredEmployees, state.attendance, selectedDate]);

    // Filter the rostered employees list by search term & department
    const filteredEmployees = useMemo(() => {
        return rosteredEmployees.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  emp.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = deptFilter === 'All' || emp.dept === deptFilter;
            return matchesSearch && matchesDept;
        });
    }, [rosteredEmployees, searchTerm, deptFilter]);

    // Department list for dropdown
    const departments = useMemo(() => {
        const depts = state.employees.map(emp => emp.dept);
        return ['All', ...Array.from(new Set(depts))];
    }, [state.employees]);

    // Format selected date nicely
    const formattedDate = useMemo(() => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(selectedDate).toLocaleDateString('en-US', options);
    }, [selectedDate]);

    const activeIndex = dateList.indexOf(selectedDate);
    const hasPrev = activeIndex > 0;
    const hasNext = activeIndex < dateList.length - 1;

    const handlePrevDay = () => {
        if (hasPrev) setSelectedDate(dateList[activeIndex - 1]);
    };

    const handleNextDay = () => {
        if (hasNext) setSelectedDate(dateList[activeIndex + 1]);
    };

    // Quick save status toggle
    const handleStatusToggle = (emp: Employee, newPresent: boolean) => {
        if (!canModify) return;

        const currentAtt = state.attendance.find(a => a.employeeId === emp.id && a.date === selectedDate);
        const shift = getShiftForEmp(emp.id, selectedDate);
        
        const isSunday = new Date(selectedDate).getDay() === 0;
        const isHoliday = selectedDate === '2026-06-12';

        const record: AttendanceRecord = {
            date: selectedDate,
            employeeId: emp.id,
            present: newPresent,
            regularHours: newPresent ? 8 : 0,
            otHours: currentAtt?.otHours || 0,
            nsdHours: newPresent ? (shift.code === '3rd' ? 8 : 0) : 0,
            undertimeHours: newPresent ? (currentAtt?.undertimeHours || 0) : 0,
            wasRestDay: currentAtt?.wasRestDay ?? isSunday,
            wasHoliday: currentAtt?.wasHoliday ?? isHoliday,
            holidayType: currentAtt?.holidayType ?? (isHoliday ? 'Legal' : undefined),
            workedPrecedingDay: currentAtt?.workedPrecedingDay ?? true
        };

        saveAttendance([record]);
        toast.success(`Marked ${emp.name} as ${newPresent ? 'Present' : 'Absent'}`);
    };

    // Row expansion for fine-grained hours editing
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    // Temp form states for expanded row
    const [tempReg, setTempReg] = useState(8);
    const [tempOt, setTempOt] = useState(0);
    const [tempNsd, setTempNsd] = useState(0);
    const [tempUt, setTempUt] = useState(0);
    const [tempRestDay, setTempRestDay] = useState(false);
    const [tempHoliday, setTempHoliday] = useState(false);
    const [tempHolidayType, setTempHolidayType] = useState<'Legal' | 'Special'>('Legal');

    const handleExpandRow = (emp: Employee) => {
        if (expandedRow === emp.id) {
            setExpandedRow(null);
            return;
        }

        const att = state.attendance.find(a => a.employeeId === emp.id && a.date === selectedDate);
        setTempReg(att?.regularHours ?? 8);
        setTempOt(att?.otHours ?? 0);
        setTempNsd(att?.nsdHours ?? 0);
        setTempUt(att?.undertimeHours ?? 0);
        setTempRestDay(att?.wasRestDay ?? false);
        setTempHoliday(att?.wasHoliday ?? (selectedDate === '2026-06-12'));
        setTempHolidayType(att?.holidayType ?? 'Legal');
        setExpandedRow(emp.id);
    };

    const handleSaveAdjustments = (emp: Employee) => {
        if (!canModify) return;

        const currentAtt = state.attendance.find(a => a.employeeId === emp.id && a.date === selectedDate);

        const record: AttendanceRecord = {
            date: selectedDate,
            employeeId: emp.id,
            present: currentAtt?.present ?? true, // Keep present status
            regularHours: tempReg,
            otHours: tempOt,
            nsdHours: tempNsd,
            undertimeHours: tempUt,
            wasRestDay: tempRestDay,
            wasHoliday: tempHoliday,
            holidayType: tempHoliday ? tempHolidayType : undefined,
            workedPrecedingDay: currentAtt?.workedPrecedingDay ?? true
        };

        saveAttendance([record]);
        toast.success(`Updated attendance hours for ${emp.name}`);
        setExpandedRow(null);
    };

    return (
        <>
            <Head title="Attendance Monitoring" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Attendance Monitoring</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Monitor and record daily attendance logs for employees rostered to work.
                        </p>
                    </div>

                    {/* Date Navigation */}
                    <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1 shadow-sm w-fit self-start sm:self-center">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-neutral-500 dark:text-neutral-400"
                            onClick={handlePrevDay} 
                            disabled={!hasPrev}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <div className="relative inline-block px-2 text-xs font-semibold text-neutral-850 dark:text-neutral-250 select-none">
                            <select 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="appearance-none bg-transparent pr-5 py-1 focus:outline-none font-bold text-sm cursor-pointer dark:text-white text-neutral-900"
                            >
                                {dateList.map((d) => {
                                    const opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
                                    const dateLabel = new Date(d).toLocaleDateString('en-US', opts);
                                    return (
                                        <option key={d} value={d} className="text-neutral-900 dark:text-neutral-100">
                                            {dateLabel} {d === '2026-06-12' ? '(Holiday)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            <Calendar className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                        </div>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-neutral-500 dark:text-neutral-400"
                            onClick={handleNextDay} 
                            disabled={!hasNext}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                    <Card className="border-neutral-200/60 dark:border-neutral-800 shadow-xs">
                        <CardHeader className="p-4 pb-2">
                            <CardDescription className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Rostered Today</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold">{metrics.totalRostered}</div>
                            <p className="text-[10px] text-neutral-400 mt-1">Employees assigned to shift</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200/60 dark:border-neutral-800 shadow-xs">
                        <CardHeader className="p-4 pb-2">
                            <CardDescription className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Present</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-450">{metrics.present}</div>
                            <p className="text-[10px] text-neutral-400 mt-1">Confirmed working hours</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200/60 dark:border-neutral-800 shadow-xs">
                        <CardHeader className="p-4 pb-2">
                            <CardDescription className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Absent</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold text-red-650 dark:text-red-400">{metrics.absent}</div>
                            <p className="text-[10px] text-neutral-400 mt-1">Marked absent or unavailable</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200/60 dark:border-neutral-800 shadow-xs">
                        <CardHeader className="p-4 pb-2">
                            <CardDescription className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Pending / Unrecorded</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold text-neutral-500 dark:text-neutral-450">{metrics.unrecorded}</div>
                            <p className="text-[10px] text-neutral-400 mt-1">Awaiting validation/sync</p>
                        </CardContent>
                    </Card>

                    <Card className="col-span-2 lg:col-span-1 border-neutral-200/60 dark:border-neutral-800 shadow-xs bg-emerald-50/5 dark:bg-emerald-950/5">
                        <CardHeader className="p-4 pb-2">
                            <CardDescription className="text-xs font-semibold text-emerald-700 dark:text-emerald-450 uppercase tracking-wider">Attendance Rate</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{metrics.rate}%</div>
                            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${metrics.rate}%` }} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Control Panel */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input 
                                type="text"
                                placeholder="Search employee name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-9 pl-9 pr-4 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-xs dark:bg-neutral-900 dark:border-neutral-800 dark:text-white"
                            />
                        </div>

                        {/* Dept Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-450 whitespace-nowrap">Dept:</span>
                            <select 
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                className="h-9 px-3 py-1 bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white text-xs rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium cursor-pointer"
                            >
                                {departments.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Role Warning / Indicator */}
                    {!canModify && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs border border-amber-200/40">
                            <Info className="h-4 w-4 shrink-0" />
                            <span>View-Only: Switching role to System Admin/HR Manager allows editing.</span>
                        </div>
                    )}
                </div>

                {/* Employee List Table */}
                <Card className="border-neutral-200/60 dark:border-neutral-800 shadow-xs overflow-hidden">
                    <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Users className="h-5 w-5 text-neutral-400" />
                            Rostered Personnel List
                        </CardTitle>
                        <CardDescription>
                            Scheduled workforce list for {formattedDate}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredEmployees.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <AlertCircle className="h-10 w-10 text-neutral-300 mb-3" />
                                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">No personnel found</h3>
                                <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                                    No scheduled employees match your filter queries, or there are no roster allocations for this date.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[750px]">
                                    <thead>
                                        <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-bold text-neutral-405 dark:text-neutral-450 uppercase tracking-wider">
                                            <th className="py-3 px-6 w-[28%]">Employee</th>
                                            <th className="py-3 px-4 w-[20%]">Scheduled Shift</th>
                                            <th className="py-3 px-4 w-[22%]">Attendance Status</th>
                                            <th className="py-3 px-4 w-[20%] text-center">Hours Worked Summary</th>
                                            <th className="py-3 px-6 w-[10%] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                        {filteredEmployees.map(emp => {
                                            const shift = getShiftForEmp(emp.id, selectedDate);
                                            const att = state.attendance.find(a => a.employeeId === emp.id && a.date === selectedDate);
                                            
                                            // Determine badge color
                                            let statusBadge = (
                                                <Badge variant="outline" className="bg-neutral-100 text-neutral-500 border-neutral-200/50">
                                                    Not Recorded
                                                </Badge>
                                            );
                                            if (att) {
                                                if (att.present) {
                                                    statusBadge = (
                                                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200/50 font-bold flex items-center gap-1.5 w-fit">
                                                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                            Present
                                                        </Badge>
                                                    );
                                                } else {
                                                    statusBadge = (
                                                        <Badge className="bg-red-50 text-red-800 border-red-200/50 font-bold flex items-center gap-1.5 w-fit">
                                                            <XCircle className="h-3 w-3 text-red-600" />
                                                            Absent
                                                        </Badge>
                                                    );
                                                }
                                            }

                                            return (
                                                <>
                                                    <tr key={emp.id} className={`hover:bg-neutral-50/40 dark:hover:bg-neutral-900/40 transition-colors ${expandedRow === emp.id && 'bg-neutral-50/50 dark:bg-neutral-900/30'}`}>
                                                        {/* Employee profile */}
                                                        <td className="py-3.5 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-9 w-9 border border-neutral-100 dark:border-neutral-800">
                                                                    <AvatarFallback className="bg-emerald-50 text-emerald-800 font-bold text-xs">
                                                                        {emp.initials}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="font-semibold text-neutral-850 dark:text-white leading-tight">{emp.name}</div>
                                                                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{emp.dept} | {emp.id}</div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Scheduled shift */}
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex flex-col gap-1">
                                                                <Badge className={`${shift.color.split(' ')[0]} w-fit text-[10px] font-bold py-0.5`}>
                                                                    {shift.code}
                                                                </Badge>
                                                                <span className="text-xs text-neutral-500 font-medium">{shift.name}</span>
                                                            </div>
                                                        </td>

                                                        {/* Record buttons / Status */}
                                                        <td className="py-3.5 px-4">
                                                            {canModify ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant={att?.present ? 'default' : 'outline'}
                                                                        className={`h-7 px-2.5 rounded-full text-xs font-semibold ${
                                                                            att?.present 
                                                                                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm border-transparent' 
                                                                                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                                                        }`}
                                                                        onClick={() => handleStatusToggle(emp, true)}
                                                                    >
                                                                        Present
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant={att && !att.present ? 'destructive' : 'outline'}
                                                                        className={`h-7 px-2.5 rounded-full text-xs font-semibold ${
                                                                            att && !att.present 
                                                                                ? 'bg-red-600 text-white hover:bg-red-500 shadow-sm border-transparent'
                                                                                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                                                        }`}
                                                                        onClick={() => handleStatusToggle(emp, false)}
                                                                    >
                                                                        Absent
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                statusBadge
                                                            )}
                                                        </td>

                                                        {/* Hours overview */}
                                                        <td className="py-3.5 px-4 text-center">
                                                            {att?.present ? (
                                                                <div className="inline-flex flex-wrap justify-center gap-1.5 text-[11px] font-mono font-medium text-neutral-600 dark:text-neutral-400">
                                                                    <span className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">{att.regularHours}h Reg</span>
                                                                    {att.otHours > 0 && <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">{att.otHours}h OT</span>}
                                                                    {att.nsdHours > 0 && <span className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-350 px-1.5 py-0.5 rounded">{att.nsdHours}h NSD</span>}
                                                                    {att.undertimeHours > 0 && <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-350 px-1.5 py-0.5 rounded">{att.undertimeHours}h UT</span>}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-neutral-400 font-medium">—</span>
                                                            )}
                                                        </td>

                                                        {/* Expand action */}
                                                        <td className="py-3.5 px-6 text-right">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className={`h-8 w-8 p-0 rounded-full ${expandedRow === emp.id && 'bg-neutral-100 dark:bg-neutral-800 text-emerald-600'}`}
                                                                disabled={!att?.present}
                                                                onClick={() => handleExpandRow(emp)}
                                                            >
                                                                <Clock className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded details editor */}
                                                    {expandedRow === emp.id && att?.present && (
                                                        <tr key={`expand-${emp.id}`} className="bg-neutral-100/50 dark:bg-neutral-900/40 border-l-2 border-emerald-500 animate-fadeIn">
                                                            <td colSpan={5} className="py-4 px-6">
                                                                <div className="grid gap-4 md:grid-cols-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 p-4 rounded-xl shadow-xs">
                                                                    <div className="md:col-span-4 flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-850">
                                                                        <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                                                                            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-600" />
                                                                            Edit Clock Hours & Adjustments: {emp.name}
                                                                        </h4>
                                                                        <span className="text-[10px] text-neutral-400 font-mono">Date: {selectedDate}</span>
                                                                    </div>

                                                                    {/* Inputs */}
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase">Regular Hours</label>
                                                                        <input 
                                                                            type="number" 
                                                                            value={tempReg} 
                                                                            min={0} max={24} step={0.5}
                                                                            disabled={!canModify}
                                                                            onChange={(e) => setTempReg(parseFloat(e.target.value) || 0)}
                                                                            className="w-full h-8 px-2 rounded-md border text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:bg-neutral-900 dark:border-neutral-800 dark:text-white"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase">Overtime Hours</label>
                                                                        <input 
                                                                            type="number" 
                                                                            value={tempOt} 
                                                                            min={0} max={24} step={0.5}
                                                                            disabled={!canModify}
                                                                            onChange={(e) => setTempOt(parseFloat(e.target.value) || 0)}
                                                                            className="w-full h-8 px-2 rounded-md border text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:bg-neutral-900 dark:border-neutral-800 dark:text-white"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase">Night Shift Diff</label>
                                                                        <input 
                                                                            type="number" 
                                                                            value={tempNsd} 
                                                                            min={0} max={24} step={0.5}
                                                                            disabled={!canModify}
                                                                            onChange={(e) => setTempNsd(parseFloat(e.target.value) || 0)}
                                                                            className="w-full h-8 px-2 rounded-md border text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:bg-neutral-900 dark:border-neutral-800 dark:text-white"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase">Undertime Hours</label>
                                                                        <input 
                                                                            type="number" 
                                                                            value={tempUt} 
                                                                            min={0} max={24} step={0.5}
                                                                            disabled={!canModify}
                                                                            onChange={(e) => setTempUt(parseFloat(e.target.value) || 0)}
                                                                            className="w-full h-8 px-2 rounded-md border text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:bg-neutral-900 dark:border-neutral-800 dark:text-white"
                                                                        />
                                                                    </div>

                                                                    {/* Override checkboxes */}
                                                                    <div className="md:col-span-2 flex flex-wrap gap-4 items-center pt-2">
                                                                        <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300">
                                                                            <input 
                                                                                type="checkbox"
                                                                                checked={tempRestDay}
                                                                                disabled={!canModify}
                                                                                onChange={(e) => setTempRestDay(e.target.checked)}
                                                                                className="rounded border-neutral-300 dark:bg-neutral-900 dark:border-neutral-800 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                                                            />
                                                                            <span>Worked on Rest Day</span>
                                                                        </label>

                                                                        <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300">
                                                                            <input 
                                                                                type="checkbox"
                                                                                checked={tempHoliday}
                                                                                disabled={!canModify}
                                                                                onChange={(e) => setTempHoliday(e.target.checked)}
                                                                                className="rounded border-neutral-300 dark:bg-neutral-900 dark:border-neutral-800 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                                                            />
                                                                            <span>Worked on Holiday</span>
                                                                        </label>
                                                                    </div>

                                                                    {tempHoliday && (
                                                                        <div className="md:col-span-2 flex items-center gap-2 pt-2">
                                                                            <span className="text-xs text-neutral-450">Holiday Type:</span>
                                                                            <select
                                                                                value={tempHolidayType}
                                                                                disabled={!canModify}
                                                                                onChange={(e) => setTempHolidayType(e.target.value as any)}
                                                                                className="h-8 px-2 bg-white dark:bg-neutral-900 border dark:border-neutral-850 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                                                                            >
                                                                                <option value="Legal">Legal Holiday (200% Pay)</option>
                                                                                <option value="Special">Special Non-Working Holiday (130% Pay)</option>
                                                                            </select>
                                                                        </div>
                                                                    )}

                                                                    {/* Action buttons */}
                                                                    <div className="md:col-span-4 flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-850">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-8 text-xs font-semibold gap-1.5"
                                                                            onClick={() => setExpandedRow(null)}
                                                                        >
                                                                            <Undo2 className="h-3.5 w-3.5" />
                                                                            Cancel
                                                                        </Button>
                                                                        {canModify && (
                                                                            <Button
                                                                                size="sm"
                                                                                className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5 border-transparent shadow-xs"
                                                                                onClick={() => handleSaveAdjustments(emp)}
                                                                            >
                                                                                <Save className="h-3.5 w-3.5" />
                                                                                Save Adjustments
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Monitoring.layout = {
    breadcrumbs: [
        { title: 'Time & Attendance', href: '/time-attendance/roster' },
        { title: 'Attendance monitoring', href: '/time-attendance/monitoring' },
    ],
};
