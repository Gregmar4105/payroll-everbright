import { Head } from '@inertiajs/react';
import { Fingerprint, Upload, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, AttendanceRecord } from '@/lib/payrollStore';

export default function Biometrics() {
    const { state, saveAttendance } = usePayroll();
    const [syncing, setSyncing] = useState(false);
    const [history, setHistory] = useState([
        { id: 'ING-032', filename: 'biometrics_valenzuela_20260615.txt', device: 'Valenzuela Plant Gate 1', parsed: 185, mismatches: 0, timestamp: 'Jun 15, 2026 06:12 PM', status: 'Success' },
        { id: 'ING-031', filename: 'biometrics_valenzuela_20260615_gate2.txt', device: 'Valenzuela Plant Gate 2', parsed: 142, mismatches: 0, timestamp: 'Jun 15, 2026 06:15 PM', status: 'Success' },
    ]);

    const canModify = state.userRole === 'System Admin' || state.userRole === 'HR Manager' || state.userRole === 'Payroll Officer';

    const handleSync = () => {
        if (!canModify) return;
        setSyncing(true);
        setTimeout(() => {
            // Generate biometric logs based on active roster
            const newAttendance: AttendanceRecord[] = [];
            const dates = [];
            
            const start = new Date(state.currentCutoff.start);
            const end = new Date(state.currentCutoff.end);
            
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                dates.push(d.toISOString().split('T')[0]);
            }

            dates.forEach(date => {
                const isSunday = new Date(date).getDay() === 0;
                
                state.employees.forEach(emp => {
                    // Find roster
                    const roster = state.rosters.find(r => r.employeeId === emp.id && r.date === date);
                    const shift = roster?.shiftCode || 'Rest';
                    
                    let present = true;
                    let regHours = 8;
                    let otHours = 0;
                    let nsdHours = 0;
                    let undertimeHours = 0;
                    let wasRestDay = isSunday;
                    let wasHoliday = date === '2026-06-12'; // Legal Holiday
                    
                    if (shift === 'Rest' || isSunday) {
                        present = false;
                        regHours = 0;
                        // Add Rest Day OT for Supervisor
                        if (emp.name === 'Reynaldo Cruz' && date === '2026-06-07') {
                            present = true;
                            regHours = 8;
                            otHours = 2.5; // Sunday OT
                        }
                    } else {
                        // Apply normal punches
                        if (shift === '3rd') {
                            nsdHours = 8; // Graveyard gets 8 hours NSD
                        }

                        // Add some randomized variations
                        if (emp.name === 'Jose Rizalino' && date === '2026-06-08') {
                            present = false;
                            regHours = 0;
                        }
                        if (emp.name === 'Alfredo Lim' && date === '2026-06-04') {
                            undertimeHours = 1.0;
                        }
                        if (emp.name === 'Reynaldo Cruz' && date === '2026-06-02') {
                            otHours = 4.0;
                        }
                    }

                    // Entitlement precheck
                    let workedPrecedingDay = true;
                    if (date === '2026-06-12' && emp.name === 'Jose Rizalino') {
                        workedPrecedingDay = false; // absent June 11
                    }

                    newAttendance.push({
                        date,
                        employeeId: emp.id,
                        present,
                        regularHours: regHours,
                        otHours,
                        nsdHours,
                        undertimeHours,
                        wasRestDay,
                        wasHoliday,
                        holidayType: wasHoliday ? 'Legal' : undefined,
                        workedPrecedingDay
                    });
                });
            });

            saveAttendance(newAttendance);

            // Add history record
            const newId = `ING-0${33 + history.length}`;
            setHistory([
                {
                    id: newId,
                    filename: `biometrics_auto_sync_${state.currentCutoff.id}.csv`,
                    device: 'Cloud Server Biometrics API',
                    parsed: state.employees.length * dates.length,
                    mismatches: 0,
                    timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    status: 'Success'
                },
                ...history
            ]);
            setSyncing(false);
            alert('Successfully simulated ingestion of raw biometric timecards and synchronized with timesheets!');
        }, 1200);
    };

    return (
        <>
            <Head title="Biometrics Logs Ingestion" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Biometric Logs Ingestion</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Ingest, parse, and synchronize raw biometric timekeeper clockings with employee timesheets.
                        </p>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/10 dark:bg-neutral-900/30 flex flex-col items-center justify-center py-10 px-6 text-center">
                        <Fingerprint className="h-12 w-12 text-emerald-600 dark:text-emerald-450 mb-3" />
                        <h3 className="text-base font-bold mb-1">Raw Biometric Log Syncer</h3>
                        <p className="text-xs text-neutral-400 mb-4 max-w-sm">
                            Parse .txt (ZKTime format) or .csv logs. This will dynamically compute shifts, night differentials, and overtime based on roster schedules.
                        </p>
                        {canModify ? (
                            <Button 
                                onClick={handleSync} 
                                disabled={syncing}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 h-9 font-semibold"
                            >
                                <RefreshCw className={`h-4 w-4 ${syncing && 'animate-spin'}`} />
                                {syncing ? 'Processing & Synching...' : 'Simulate Ingestion & Sync'}
                            </Button>
                        ) : (
                            <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20 px-3 py-1">
                                Access Denied: Payroll Master role required
                            </Badge>
                        )}
                    </Card>

                    <Card className="border-neutral-200/60 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Device Gateways</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: 'Valenzuela Plant Gate 1', type: 'ZKTeco iClock900', status: 'Online', ip: '192.168.10.41' },
                                { name: 'Valenzuela Plant Gate 2', type: 'ZKTeco iClock900', status: 'Online', ip: '192.168.10.42' },
                                { name: 'Main HQ Entrance', type: 'ZKTeco SpeedFace', status: 'Online', ip: '10.0.2.15' },
                            ].map((device) => (
                                <div key={device.name} className="flex items-center justify-between text-xs pb-3 border-b last:border-b-0 border-neutral-100 dark:border-neutral-800">
                                    <div>
                                        <div className="font-semibold text-neutral-800 dark:text-neutral-200">{device.name}</div>
                                        <div className="text-[10px] text-neutral-400 font-mono">{device.type} ({device.ip})</div>
                                    </div>
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-medium">
                                        {device.status}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* History */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Ingestion & Sync Logs</CardTitle>
                        <CardDescription>Records of recently imported logs.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                        <th className="py-3 px-6">Ingest ID</th>
                                        <th className="py-3 px-6">Filename</th>
                                        <th className="py-3 px-6">Ingestion Device</th>
                                        <th className="py-3 px-6 text-center">Parsed Records</th>
                                        <th className="py-3 px-6 text-center">Mismatches</th>
                                        <th className="py-3 px-6">Timestamp</th>
                                        <th className="py-3 px-6 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                    {history.map((item) => (
                                        <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                            <td className="py-3.5 px-6 font-semibold text-emerald-600 dark:text-emerald-400">{item.id}</td>
                                            <td className="py-3.5 px-6 font-mono text-neutral-750 dark:text-neutral-300 text-xs">{item.filename}</td>
                                            <td className="py-3.5 px-6 text-neutral-600 dark:text-neutral-400">{item.device}</td>
                                            <td className="py-3.5 px-6 text-center font-semibold">{item.parsed}</td>
                                            <td className={`py-3.5 px-6 text-center font-semibold ${item.mismatches > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400'}`}>{item.mismatches}</td>
                                            <td className="py-3.5 px-6 text-neutral-500 dark:text-neutral-450 text-xs">{item.timestamp}</td>
                                            <td className="py-3.5 px-6 text-right">
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/40">
                                                    {item.status}
                                                </Badge>
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

Biometrics.layout = {
    breadcrumbs: [
        { title: 'Time & Attendance', href: '/time-attendance/roster' },
        { title: 'Biometrics Logs', href: '/time-attendance/biometrics' },
    ],
};
