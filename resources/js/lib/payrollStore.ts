import { useState, useEffect } from 'react';

// Types
export interface Employee {
    id: string;
    name: string;
    role: string;
    dept: 'Maintenance' | 'Production' | 'Warehouse' | 'Office' | 'Admin & HR' | 'Logistics' | 'Manufacturing';
    email: string;
    phone: string;
    avatar: string;
    initials: string;
    status: 'Active' | 'On Leave' | 'Suspended';
    employmentStatus: 'Regular' | 'Probationary';
    dateHired: string;
    cbaTagged: boolean;
    basicSalary: number; // Monthly base or standard base
    allowance: number; // Monthly allowance
    paySchedule: 'Weekly' | 'Bi-Monthly' | 'Semi-Monthly' | 'Monthly';
    sssNo: string;
    phicNo: string;
    hdmfNo: string;
    bankName: string;
    bankAccount: string;
    unionJoined: boolean;
}

export interface RosterEntry {
    date: string; // YYYY-MM-DD
    employeeId: string;
    shiftCode: '1st' | '2nd' | '3rd' | '4th' | 'Office' | 'Office Prod' | 'Rest';
}

export interface AttendanceRecord {
    date: string;
    employeeId: string;
    present: boolean;
    regularHours: number;
    otHours: number;
    nsdHours: number; // Night shift differential hours worked (10PM - 6AM)
    undertimeHours: number;
    wasRestDay: boolean;
    wasHoliday: boolean;
    holidayType?: 'Legal' | 'Special';
    workedPrecedingDay?: boolean; // Entitlement check
}

export interface Loan {
    id: string;
    employeeId: string;
    type: 'SSS Salary Loan' | 'SSS Calamity Loan' | 'HDMF Loan' | 'HDMF Calamity Loan' | 'Company Loan' | 'Car Loan' | 'Other Loan 1' | 'Other Loan 2' | 'Other Loan 3';
    totalAmount: number;
    amortPerCutoff: number;
    outstandingBalance: number;
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    type: 'VL' | 'SL' | 'Union' | 'Paternity' | 'Maternity' | 'Bereavement' | 'Emergency' | 'Solo Parent';
    startDate: string;
    endDate: string;
    days: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    monetized: boolean;
}

export interface OverrideEntry {
    employeeId: string;
    retroHours: number;
    adjustments: number; // Other income adjustments
    canteenDeduct: number;
    coValeDeduct: number;
    otherDeduct: number;
    taxRefund: number;
    taxBalance: number;
}

export interface CalculatedPayrollRecord {
    employeeId: string;
    employeeName: string;
    dept: string;
    schedule: string;
    employmentStatus: string;
    cbaTagged: boolean;
    
    // Inputs
    basicSalary: number; // Period basic salary
    allowance: number; // Period allowance
    
    // Attendance totals
    daysPresent: number;
    regularHours: number;
    otHours: number;
    nsdHours: number;
    undertimeHours: number;
    restDayHours: number;
    specialHolidayHours: number;
    legalHolidayHours: number;
    
    // Computed Earnings
    basicPayEarned: number;
    undertimeDeduct: number;
    otPay: number;
    nsdPay: number;
    restDayHolidayPay: number;
    legalHolidayPay: number;
    allowanceEarned: number;
    retroPay: number;
    adjustmentsPay: number;
    taxRefundPay: number;
    
    grossPay: number;
    
    // Deductions
    sssDeduct: number;
    phicDeduct: number;
    hdmfDeduct: number;
    unionDuesDeduct: number;
    canteenDeduct: number;
    coValeDeduct: number;
    taxBalanceDeduct: number;
    otherDeductions: number;
    
    loanDeductions: { loanId: string; type: string; amount: number }[];
    totalLoanDeduct: number;
    
    // Tax Calculation
    taxableIncome: number;
    withholdingTax: number;
    
    totalDeductions: number;
    netPay: number;
}

export interface PayrollCycle {
    id: string;
    cutoffStart: string;
    cutoffEnd: string;
    schedule: 'Weekly' | 'Bi-Monthly' | 'Semi-Monthly' | 'Monthly';
    calculatedAt: string;
    finalized: boolean;
    records: CalculatedPayrollRecord[];
}

export interface PayrollState {
    employees: Employee[];
    rosters: RosterEntry[];
    attendance: AttendanceRecord[];
    loans: Loan[];
    leaves: LeaveRequest[];
    overrides: OverrideEntry[];
    payrollCycles: PayrollCycle[];
    currentCutoff: {
        id: string;
        start: string;
        end: string;
        schedule: 'Weekly' | 'Bi-Monthly' | 'Semi-Monthly' | 'Monthly';
    };
    userRole: 'System Admin' | 'HR Manager' | 'Payroll Officer' | 'Finance Approver' | 'Employee';
}

// Initial Mock Seed Data
const initialEmployees: Employee[] = [
    {
        id: 'EB-RC-0392',
        name: 'Reynaldo Cruz',
        role: 'Production Supervisor',
        dept: 'Production',
        email: 'reynaldo.cruz@everbright.ph',
        phone: '0917-882-9931',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
        initials: 'RC',
        status: 'Active',
        employmentStatus: 'Regular',
        dateHired: '2021-03-12',
        cbaTagged: true,
        basicSalary: 28000,
        allowance: 2500,
        paySchedule: 'Semi-Monthly',
        sssNo: '34-2983109-2',
        phicNo: '12-984019283-1',
        hdmfNo: '1029-4819-2093',
        bankName: 'BDO Unibank',
        bankAccount: '001920394857',
        unionJoined: true
    },
    {
        id: 'EB-MS-0140',
        name: 'Maria Santos',
        role: 'HR Specialist',
        dept: 'Admin & HR',
        email: 'maria.santos@everbright.ph',
        phone: '0922-140-5921',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
        initials: 'MS',
        status: 'Active',
        employmentStatus: 'Regular',
        dateHired: '2023-05-18',
        cbaTagged: false,
        basicSalary: 32000,
        allowance: 3000,
        paySchedule: 'Semi-Monthly',
        sssNo: '03-9281392-1',
        phicNo: '19-029384918-2',
        hdmfNo: '1210-9384-9182',
        bankName: 'Security Bank',
        bankAccount: '000039482938',
        unionJoined: false
    },
    {
        id: 'EB-JR-0592',
        name: 'Jose Rizalino',
        role: 'Forklift Operator',
        dept: 'Warehouse',
        email: 'jose.rizalino@everbright.ph',
        phone: '0908-592-3841',
        avatar: '',
        initials: 'JR',
        status: 'Active',
        employmentStatus: 'Regular',
        dateHired: '2022-10-01',
        cbaTagged: true,
        basicSalary: 6500, // Weekly pay
        allowance: 500,
        paySchedule: 'Weekly',
        sssNo: '33-9182739-4',
        phicNo: '10-293849102-3',
        hdmfNo: '1092-3847-1928',
        bankName: 'BPI',
        bankAccount: '3029182736',
        unionJoined: true
    },
    {
        id: 'EB-CD-1140',
        name: 'Clarissa Dimagiba',
        role: 'Quality Control Lead',
        dept: 'Production',
        email: 'clarissa.d@everbright.ph',
        phone: '0933-722-1140',
        avatar: '',
        initials: 'CD',
        status: 'Active',
        employmentStatus: 'Regular',
        dateHired: '2020-07-22',
        cbaTagged: true,
        basicSalary: 14000, // Bi-Monthly pay
        allowance: 1200,
        paySchedule: 'Bi-Monthly',
        sssNo: '02-8392813-0',
        phicNo: '15-920394819-3',
        hdmfNo: '1102-3849-2819',
        bankName: 'Metrobank',
        bankAccount: '9082736452',
        unionJoined: true
    },
    {
        id: 'EB-AL-0812',
        name: 'Alfredo Lim',
        role: 'Delivery Driver',
        dept: 'Logistics',
        email: 'alfredo.lim@everbright.ph',
        phone: '0945-812-3211',
        avatar: '',
        initials: 'AL',
        status: 'Active',
        employmentStatus: 'Probationary',
        dateHired: '2026-03-01',
        cbaTagged: false,
        basicSalary: 5500, // Weekly pay
        allowance: 400,
        paySchedule: 'Weekly',
        sssNo: '04-9283749-2',
        phicNo: '11-029384910-4',
        hdmfNo: '1029-3849-2918',
        bankName: 'UnionBank',
        bankAccount: '1029384756',
        unionJoined: false
    }
];

// Seed initial rosters for the cutoff June 1 to June 15, 2026
const seedRostersAndAttendance = (employees: Employee[]) => {
    const rosters: RosterEntry[] = [];
    const attendance: AttendanceRecord[] = [];
    const dates = [];
    
    // Generate dates from June 1 to June 15, 2026
    for (let d = 1; d <= 15; d++) {
        const dayStr = d < 10 ? `0${d}` : `${d}`;
        dates.push(`2026-06-${dayStr}`);
    }

    dates.forEach(date => {
        const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
        const isSunday = dayOfWeek === 0;

        employees.forEach(emp => {
            let shift: RosterEntry['shiftCode'] = 'Office';
            if (emp.dept === 'Production' || emp.dept === 'Manufacturing') {
                // Production workers work in shifts
                if (emp.name === 'Reynaldo Cruz') shift = '1st'; // 6AM-2PM
                else if (emp.name === 'Clarissa Dimagiba') shift = '2nd'; // 2PM-10PM
                else shift = '3rd'; // 10PM-6AM
            } else if (emp.dept === 'Warehouse' || emp.dept === 'Logistics') {
                shift = '4th'; // 7AM-4PM
            } else if (emp.dept === 'Admin & HR') {
                shift = 'Office'; // 8AM-5PM
            }

            if (isSunday) {
                shift = 'Rest';
            }

            rosters.push({ date, employeeId: emp.id, shiftCode: shift });

            // Determine attendance details
            let present = true;
            let regHours = 8;
            let otHours = 0;
            let nsdHours = 0;
            let undertimeHours = 0;
            let wasRestDay = isSunday;
            let wasHoliday = date === '2026-06-12'; // Independence Day (Legal Holiday)
            let holidayType: 'Legal' | 'Special' | undefined = wasHoliday ? 'Legal' : undefined;
            
            // Worked preceding day calculation (June 11)
            let workedPrecedingDay = true; 

            // Simulate some variations
            if (isSunday) {
                present = false;
                regHours = 0;
                // Add some Sunday OT work for Reynaldo Cruz
                if (emp.name === 'Reynaldo Cruz' && date === '2026-06-07') {
                    present = true;
                    regHours = 8;
                    otHours = 2; // worked 10 hours on a Sunday rest day
                }
            } else {
                // Simulate some absences/late punches
                if (emp.name === 'Jose Rizalino' && date === '2026-06-08') {
                    // Absent
                    present = false;
                    regHours = 0;
                }
                
                if (emp.name === 'Alfredo Lim' && date === '2026-06-04') {
                    // Late
                    undertimeHours = 1.5;
                }

                // Simulate OT
                if (emp.name === 'Reynaldo Cruz' && (date === '2026-06-02' || date === '2026-06-09')) {
                    otHours = 3;
                }
                if (emp.name === 'Clarissa Dimagiba' && date === '2026-06-10') {
                    otHours = 2;
                }

                // Night shift differential (3rd shift 10PM-6AM works full 8 hours in NSD)
                if (shift === '3rd') {
                    nsdHours = 8;
                }
            }

            // For holiday pay check: June 12 is Independence Day. Check if present on June 11.
            if (date === '2026-06-12') {
                if (emp.name === 'Jose Rizalino') {
                    workedPrecedingDay = false;
                }
            }

            attendance.push({
                date,
                employeeId: emp.id,
                present,
                regularHours: present ? regHours : 0,
                otHours,
                nsdHours,
                undertimeHours,
                wasRestDay,
                wasHoliday,
                holidayType,
                workedPrecedingDay
            });
        });
    });

    return { rosters, attendance };
};

const defaultRosterAndAttendance = seedRostersAndAttendance(initialEmployees);

const initialLoans: Loan[] = [
    { id: 'LN-SSS-001', employeeId: 'EB-RC-0392', type: 'SSS Salary Loan', totalAmount: 15000, amortPerCutoff: 750, outstandingBalance: 8250 },
    { id: 'LN-HDMF-001', employeeId: 'EB-RC-0392', type: 'HDMF Loan', totalAmount: 10000, amortPerCutoff: 500, outstandingBalance: 6000 },
    { id: 'LN-SSS-002', employeeId: 'EB-MS-0140', type: 'SSS Calamity Loan', totalAmount: 20000, amortPerCutoff: 1000, outstandingBalance: 15000 },
    { id: 'LN-CO-001', employeeId: 'EB-JR-0592', type: 'Company Loan', totalAmount: 5000, amortPerCutoff: 250, outstandingBalance: 1250 }
];

const initialLeaves: LeaveRequest[] = [
    { id: 'LV-001', employeeId: 'EB-JR-0592', type: 'SL', startDate: '2026-06-08', endDate: '2026-06-08', days: 1, status: 'Approved', monetized: false },
    { id: 'LV-002', employeeId: 'EB-MS-0140', type: 'VL', startDate: '2026-06-15', endDate: '2026-06-16', days: 2, status: 'Pending', monetized: false }
];

const initialOverrides: OverrideEntry[] = [
    { employeeId: 'EB-RC-0392', retroHours: 4, adjustments: 1500, canteenDeduct: 220, coValeDeduct: 500, otherDeduct: 0, taxRefund: 0, taxBalance: 0 },
    { employeeId: 'EB-MS-0140', retroHours: 0, adjustments: 0, canteenDeduct: 150, coValeDeduct: 0, otherDeduct: 0, taxRefund: 850, taxBalance: 0 },
    { employeeId: 'EB-JR-0592', retroHours: 0, adjustments: 0, canteenDeduct: 0, coValeDeduct: 0, otherDeduct: 0, taxRefund: 0, taxBalance: 0 },
    { employeeId: 'EB-CD-1140', retroHours: 0, adjustments: 0, canteenDeduct: 0, coValeDeduct: 0, otherDeduct: 0, taxRefund: 0, taxBalance: 0 },
    { employeeId: 'EB-AL-0812', retroHours: 0, adjustments: 0, canteenDeduct: 0, coValeDeduct: 0, otherDeduct: 0, taxRefund: 0, taxBalance: 0 }
];

const defaultCutoff = {
    id: 'PR-2026-11',
    start: '2026-06-01',
    end: '2026-06-15',
    schedule: 'Semi-Monthly' as const
};

// Initial State Object
const initialAppState: PayrollState = {
    employees: initialEmployees,
    rosters: defaultRosterAndAttendance.rosters,
    attendance: defaultRosterAndAttendance.attendance,
    loans: initialLoans,
    leaves: initialLeaves,
    overrides: initialOverrides,
    payrollCycles: [
        {
            id: 'PR-2026-10',
            cutoffStart: '2026-05-16',
            cutoffEnd: '2026-05-31',
            schedule: 'Semi-Monthly',
            calculatedAt: '2026-05-31 17:30',
            finalized: true,
            records: [
                {
                    employeeId: 'EB-RC-0392',
                    employeeName: 'Reynaldo Cruz',
                    dept: 'Production',
                    schedule: 'Semi-Monthly',
                    employmentStatus: 'Regular',
                    cbaTagged: true,
                    basicSalary: 14000,
                    allowance: 1250,
                    daysPresent: 11,
                    regularHours: 88,
                    otHours: 4,
                    nsdHours: 0,
                    undertimeHours: 0,
                    restDayHours: 0,
                    specialHolidayHours: 0,
                    legalHolidayHours: 0,
                    basicPayEarned: 14000,
                    undertimeDeduct: 0,
                    otPay: 350.20,
                    nsdPay: 0,
                    restDayHolidayPay: 0,
                    legalHolidayPay: 0,
                    allowanceEarned: 1250,
                    retroPay: 0,
                    adjustmentsPay: 0,
                    taxRefundPay: 0,
                    grossPay: 15600.20,
                    sssDeduct: 600,
                    phicDeduct: 350,
                    hdmfDeduct: 100,
                    unionDuesDeduct: 140,
                    canteenDeduct: 100,
                    coValeDeduct: 0,
                    taxBalanceDeduct: 0,
                    otherDeductions: 0,
                    loanDeductions: [],
                    totalLoanDeduct: 0,
                    taxableIncome: 14060,
                    withholdingTax: 1245.50,
                    totalDeductions: 2435.50,
                    netPay: 13164.70
                }
            ]
        }
    ],
    currentCutoff: defaultCutoff,
    userRole: 'System Admin'
};

// Load state from local storage or use initial seed
const loadInitialState = (): PayrollState => {
    if (typeof window === 'undefined') return initialAppState;
    const stored = window.localStorage.getItem('everbright_payroll_state');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Ensure overrides exist for all seeded employees in case they were added later
            initialEmployees.forEach(emp => {
                if (!parsed.overrides.find((o: any) => o.employeeId === emp.id)) {
                    parsed.overrides.push({
                        employeeId: emp.id, retroHours: 0, adjustments: 0, canteenDeduct: 0, coValeDeduct: 0, otherDeduct: 0, taxRefund: 0, taxBalance: 0
                    });
                }
            });
            return parsed;
        } catch (e) {
            console.error('Error parsing stored state, resetting.', e);
        }
    }
    return initialAppState;
};

// Global Store State and Listeners
let appState = loadInitialState();
const listeners: Function[] = [];

const saveState = (newState: PayrollState) => {
    appState = newState;
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('everbright_payroll_state', JSON.stringify(newState));
    }
    listeners.forEach(listener => listener(appState));
};

// Progressive Withholding Tax Calculator
// Scale monthly brackets down to cutoff schedule
export const calculateWithholdingTax = (taxableIncome: number, schedule: 'Weekly' | 'Bi-Monthly' | 'Semi-Monthly' | 'Monthly'): number => {
    let brackets = [0, 20833, 33333, 66667];
    let baseTax = [0, 0, 1875, 8541.67];
    let rates = [0, 0.15, 0.20, 0.25];

    let factor = 1;
    if (schedule === 'Weekly') factor = 52 / 12; // ~4.33
    else if (schedule === 'Semi-Monthly') factor = 2;
    else if (schedule === 'Bi-Monthly') factor = 2; // Treat bi-monthly cutoff details similarly or adapt

    // Scale brackets and baseTax
    const scaledBrackets = brackets.map(b => b / factor);
    const scaledBaseTax = baseTax.map(t => t / factor);

    let tax = 0;
    if (taxableIncome <= scaledBrackets[1]) {
        tax = 0;
    } else if (taxableIncome <= scaledBrackets[2]) {
        tax = scaledBaseTax[1] + (taxableIncome - scaledBrackets[1]) * rates[1];
    } else if (taxableIncome <= scaledBrackets[3]) {
        tax = scaledBaseTax[2] + (taxableIncome - scaledBrackets[2]) * rates[2];
    } else {
        tax = scaledBaseTax[3] + (taxableIncome - scaledBrackets[3]) * rates[3];
    }

    return Math.max(0, parseFloat(tax.toFixed(2)));
};

// Standard Statutory Premiums Calculators
export const calculateSSSContribution = (monthlyBasic: number): number => {
    // Standard employee share is roughly 4.5% up to a limit
    const employeeShare = monthlyBasic * 0.045;
    return Math.min(1350, Math.max(100, parseFloat(employeeShare.toFixed(2))));
};

export const calculatePhilHealthContribution = (monthlyBasic: number): number => {
    // 5% rate shared equally (2.5% employee share)
    const rate = 0.05;
    const employeeShare = (monthlyBasic * rate) / 2;
    return Math.min(1000, Math.max(125, parseFloat(employeeShare.toFixed(2))));
};

export const calculateHDMFContribution = (monthlyBasic: number): number => {
    // 2% employee share, capped at 200
    const employeeShare = monthlyBasic * 0.02;
    return Math.min(200, Math.max(100, parseFloat(employeeShare.toFixed(2))));
};

// Core Calculations Engine
export const runPayrollCalculations = (
    state: PayrollState, 
    schedule: 'Weekly' | 'Bi-Monthly' | 'Semi-Monthly' | 'Monthly'
): CalculatedPayrollRecord[] => {
    const activeEmployees = state.employees.filter(emp => emp.paySchedule === schedule && emp.status === 'Active');
    
    return activeEmployees.map(emp => {
        // Find attendance records within active cutoff dates
        const cutoffStart = new Date(state.currentCutoff.start);
        const cutoffEnd = new Date(state.currentCutoff.end);
        
        const empAttendance = state.attendance.filter(record => {
            const d = new Date(record.date);
            return record.employeeId === emp.id && d >= cutoffStart && d <= cutoffEnd;
        });

        // Sum attendance hours
        let daysPresent = 0;
        let regularHours = 0;
        let otHours = 0;
        let nsdHours = 0;
        let undertimeHours = 0;
        let restDayHours = 0;
        let specialHolidayHours = 0;
        let legalHolidayHours = 0;

        empAttendance.forEach(att => {
            if (att.present) {
                daysPresent++;
                regularHours += att.regularHours;
                otHours += att.otHours;
                nsdHours += att.nsdHours;
                undertimeHours += att.undertimeHours;

                if (att.wasRestDay) {
                    restDayHours += att.regularHours + att.otHours;
                }
                
                if (att.wasHoliday) {
                    if (att.holidayType === 'Legal') {
                        legalHolidayHours += att.regularHours + att.otHours;
                    } else if (att.holidayType === 'Special') {
                        specialHolidayHours += att.regularHours + att.otHours;
                    }
                }
            } else if (att.wasHoliday && att.holidayType === 'Legal') {
                // Entitlement check: was present/worked on working day prior to holiday
                if (att.workedPrecedingDay) {
                    legalHolidayHours += 8; // Paid 8 hours for legal holiday despite absence
                }
            }
        });

        // Determine basic rate and divisor based on schedule
        let divisor = 1;
        let periodBasicSalary = emp.basicSalary;
        let periodAllowance = emp.allowance;

        if (schedule === 'Semi-Monthly') {
            divisor = 2;
            periodBasicSalary = emp.basicSalary / 2;
            periodAllowance = emp.allowance / 2;
        } else if (schedule === 'Bi-Monthly') {
            divisor = 2; 
            periodBasicSalary = emp.basicSalary / 2;
            periodAllowance = emp.allowance / 2;
        } else if (schedule === 'Weekly') {
            periodBasicSalary = emp.basicSalary;
            periodAllowance = emp.allowance;
        }

        const dailyRate = schedule === 'Weekly' ? (emp.basicSalary / 6) : (emp.basicSalary / 26);
        const hourlyRate = dailyRate / 8;

        const basicPayEarned = periodBasicSalary;
        const undertimeDeduct = parseFloat((undertimeHours * hourlyRate).toFixed(2));

        // Overtime multiplier
        const otMultiplier = (emp.employmentStatus === 'Regular' && emp.cbaTagged) ? 1.30 : 1.25;
        const otPay = parseFloat((otHours * hourlyRate * otMultiplier).toFixed(2));

        // Night Shift Differential multiplier
        const nsdMultiplier = (emp.employmentStatus === 'Regular' && emp.cbaTagged) ? 0.20 : 0.10;
        const nsdPay = parseFloat((nsdHours * hourlyRate * nsdMultiplier).toFixed(2));

        // Rest Day & Special Holiday Premium
        let rdHolidayPremiumPay = 0;
        empAttendance.forEach(att => {
            if (att.present && (att.wasRestDay || (att.wasHoliday && att.holidayType === 'Special'))) {
                const totalHoursOnThisDay = att.regularHours + att.otHours;
                let multiplier = 1.30;
                
                const isSunday = new Date(att.date).getDay() === 0;
                if (isSunday && att.wasHoliday && att.holidayType === 'Special') {
                    multiplier = 1.60;
                } else if (isSunday && att.wasRestDay) {
                    multiplier = 1.30;
                }
                
                const premiumRate = multiplier - 1.00;
                rdHolidayPremiumPay += totalHoursOnThisDay * hourlyRate * premiumRate;
            }
        });
        const restDayHolidayPay = parseFloat(rdHolidayPremiumPay.toFixed(2));

        // Legal Holiday Pay
        let legHolidayPaySum = 0;
        empAttendance.forEach(att => {
            if (att.wasHoliday && att.holidayType === 'Legal') {
                if (att.present) {
                    const totalHours = att.regularHours + att.otHours;
                    legHolidayPaySum += totalHours * hourlyRate * 1.00;
                } else {
                    if (att.workedPrecedingDay) {
                        legHolidayPaySum += 8 * hourlyRate;
                    }
                }
            }
        });
        const legalHolidayPay = parseFloat(legHolidayPaySum.toFixed(2));

        const allowanceEarned = periodAllowance;

        const ovr = state.overrides.find(o => o.employeeId === emp.id) || {
            retroHours: 0, adjustments: 0, canteenDeduct: 0, coValeDeduct: 0, otherDeduct: 0, taxRefund: 0, taxBalance: 0
        };

        const retroPay = parseFloat((ovr.retroHours * hourlyRate).toFixed(2));
        const adjustmentsPay = ovr.adjustments;
        const taxRefundPay = ovr.taxRefund;

        const grossPay = parseFloat(
            (basicPayEarned - undertimeDeduct + otPay + nsdPay + restDayHolidayPay + legalHolidayPay + allowanceEarned + retroPay + adjustmentsPay).toFixed(2)
        );

        const monthlyBasicEquivalent = schedule === 'Weekly' ? (emp.basicSalary * 52 / 12) : emp.basicSalary;
        
        const monthlySSS = calculateSSSContribution(monthlyBasicEquivalent);
        const monthlyPHIC = calculatePhilHealthContribution(monthlyBasicEquivalent);
        const monthlyHDMF = calculateHDMFContribution(monthlyBasicEquivalent);

        const sssDeduct = parseFloat((monthlySSS / divisor).toFixed(2));
        const phicDeduct = parseFloat((monthlyPHIC / divisor).toFixed(2));
        const hdmfDeduct = parseFloat((monthlyHDMF / divisor).toFixed(2));

        const unionDuesDeduct = (emp.cbaTagged && emp.unionJoined) 
            ? parseFloat((basicPayEarned * 0.01).toFixed(2)) 
            : 0;

        const canteenDeduct = ovr.canteenDeduct;
        const coValeDeduct = ovr.coValeDeduct;
        const taxBalanceDeduct = ovr.taxBalance;
        const otherDeductions = ovr.otherDeduct;

        const empLoans = state.loans.filter(l => l.employeeId === emp.id && l.outstandingBalance > 0);
        
        let remainingGrossForLoans = grossPay - (sssDeduct + phicDeduct + hdmfDeduct + unionDuesDeduct);
        const loanDeductions: CalculatedPayrollRecord['loanDeductions'] = [];
        let totalLoanDeduct = 0;

        empLoans.forEach(loan => {
            let deductAmount = Math.min(loan.amortPerCutoff, loan.outstandingBalance);
            
            if (deductAmount > remainingGrossForLoans) {
                deductAmount = Math.max(0, remainingGrossForLoans);
            }
            
            if (deductAmount > 0) {
                loanDeductions.push({
                    loanId: loan.id,
                    type: loan.type,
                    amount: parseFloat(deductAmount.toFixed(2))
                });
                totalLoanDeduct += deductAmount;
                remainingGrossForLoans -= deductAmount;
            }
        });

        const taxableIncome = Math.max(0, (basicPayEarned + allowanceEarned) - (sssDeduct + phicDeduct + hdmfDeduct + unionDuesDeduct));
        const withholdingTax = calculateWithholdingTax(taxableIncome, schedule);

        const totalDeductions = parseFloat(
            (sssDeduct + phicDeduct + hdmfDeduct + unionDuesDeduct + canteenDeduct + coValeDeduct + taxBalanceDeduct + otherDeductions + totalLoanDeduct + withholdingTax).toFixed(2)
        );

        const netPay = parseFloat((grossPay - totalDeductions + taxRefundPay).toFixed(2));

        return {
            employeeId: emp.id,
            employeeName: emp.name,
            dept: emp.dept,
            schedule,
            employmentStatus: emp.employmentStatus,
            cbaTagged: emp.cbaTagged,
            basicSalary: periodBasicSalary,
            allowance: periodAllowance,
            daysPresent,
            regularHours,
            otHours,
            nsdHours,
            undertimeHours,
            restDayHours,
            specialHolidayHours,
            legalHolidayHours,
            basicPayEarned,
            undertimeDeduct,
            otPay,
            nsdPay,
            restDayHolidayPay,
            legalHolidayPay,
            allowanceEarned,
            retroPay,
            adjustmentsPay,
            taxRefundPay,
            grossPay,
            sssDeduct,
            phicDeduct,
            hdmfDeduct,
            unionDuesDeduct,
            canteenDeduct,
            coValeDeduct,
            taxBalanceDeduct,
            otherDeductions,
            loanDeductions,
            totalLoanDeduct,
            taxableIncome,
            withholdingTax,
            totalDeductions,
            netPay
        };
    });
};

// React Hook Store
export const usePayroll = () => {
    const [state, setState] = useState<PayrollState>(appState);

    useEffect(() => {
        const listener = (newState: PayrollState) => {
            setState(newState);
        };
        listeners.push(listener);
        return () => {
            const idx = listeners.indexOf(listener);
            if (idx > -1) listeners.splice(idx, 1);
        };
    }, []);

    const setRole = (role: PayrollState['userRole']) => {
        saveState({ ...state, userRole: role });
    };

    const addEmployee = (emp: Omit<Employee, 'id' | 'initials' | 'avatar'>) => {
        const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const id = `EB-${initials}-${Math.floor(1000 + Math.random() * 9000)}`;
        const avatar = '';
        
        const newEmp: Employee = { ...emp, id, initials, avatar };
        const employees = [...state.employees, newEmp];
        
        const overrides = [...state.overrides, {
            employeeId: id, retroHours: 0, adjustments: 0, canteenDeduct: 0, coValeDeduct: 0, otherDeduct: 0, taxRefund: 0, taxBalance: 0
        }];
        
        saveState({ ...state, employees, overrides });
    };

    const updateEmployee = (id: string, updatedFields: Partial<Employee>) => {
        const employees = state.employees.map(emp => {
            if (emp.id === id) {
                return { ...emp, ...updatedFields } as Employee;
            }
            return emp;
        });
        saveState({ ...state, employees });
    };

    const deleteEmployee = (id: string) => {
        const employees = state.employees.filter(emp => emp.id !== id);
        const overrides = state.overrides.filter(o => o.employeeId !== id);
        const loans = state.loans.filter(l => l.employeeId !== id);
        saveState({ ...state, employees, overrides, loans });
    };

    const saveRoster = (newRosters: RosterEntry[]) => {
        const employeeIds = Array.from(new Set(newRosters.map(r => r.employeeId)));
        const dates = Array.from(new Set(newRosters.map(r => r.date)));

        const rosters = state.rosters.filter(
            r => !(employeeIds.includes(r.employeeId) && dates.includes(r.date))
        );
        rosters.push(...newRosters);
        saveState({ ...state, rosters });
    };

    const saveAttendance = (newAttendance: AttendanceRecord[]) => {
        const employeeIds = Array.from(new Set(newAttendance.map(a => a.employeeId)));
        const dates = Array.from(new Set(newAttendance.map(a => a.date)));

        const attendance = state.attendance.filter(
            a => !(employeeIds.includes(a.employeeId) && dates.includes(a.date))
        );
        attendance.push(...newAttendance);
        saveState({ ...state, attendance });
    };

    const saveOverrides = (newOverrides: OverrideEntry[]) => {
        const employeeIds = newOverrides.map(o => o.employeeId);
        const overrides = state.overrides.filter(o => !employeeIds.includes(o.employeeId));
        overrides.push(...newOverrides);
        saveState({ ...state, overrides });
    };

    const addLoan = (loan: Omit<Loan, 'id'>) => {
        const id = `LN-${loan.type.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
        const newLoan: Loan = { ...loan, id };
        const loans = [...state.loans, newLoan];
        saveState({ ...state, loans });
    };

    const updateLoanBalance = (id: string, outstandingBalance: number) => {
        const loans = state.loans.map(l => {
            if (l.id === id) {
                return { ...l, outstandingBalance };
            }
            return l;
        });
        saveState({ ...state, loans });
    };

    const fileLeave = (leave: Omit<LeaveRequest, 'id'>) => {
        const id = `LV-${Math.floor(100 + Math.random() * 900)}`;
        const newLeave: LeaveRequest = { ...leave, id };
        const leaves = [...state.leaves, newLeave];
        saveState({ ...state, leaves });
    };

    const updateLeaveStatus = (id: string, status: LeaveRequest['status']) => {
        const leaves = state.leaves.map(l => {
            if (l.id === id) {
                return { ...l, status };
            }
            return l;
        });
        
        const leave = leaves.find(l => l.id === id);
        let attendance = [...state.attendance];
        
        if (leave && status === 'Approved') {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const existIdx = attendance.findIndex(a => a.employeeId === leave.employeeId && a.date === dateStr);
                
                const rec = {
                    date: dateStr,
                    employeeId: leave.employeeId,
                    present: true,
                    regularHours: 8,
                    otHours: 0,
                    nsdHours: 0,
                    undertimeHours: 0,
                    wasRestDay: d.getDay() === 0,
                    wasHoliday: false,
                    workedPrecedingDay: true
                };
                
                if (existIdx > -1) {
                    attendance[existIdx] = rec;
                } else {
                    attendance.push(rec);
                }
            }
        }

        saveState({ ...state, leaves, attendance });
    };

    const changeCutoff = (cutoff: PayrollState['currentCutoff']) => {
        saveState({ ...state, currentCutoff: cutoff });
    };

    const runCalculation = (): CalculatedPayrollRecord[] => {
        return runPayrollCalculations(state, state.currentCutoff.schedule);
    };

    const finalizePayrollCycle = (records: CalculatedPayrollRecord[]) => {
        const newCycle: PayrollCycle = {
            id: state.currentCutoff.id,
            cutoffStart: state.currentCutoff.start,
            cutoffEnd: state.currentCutoff.end,
            schedule: state.currentCutoff.schedule,
            calculatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            finalized: true,
            records
        };

        const loans = state.loans.map(loan => {
            const calculatedDeduct = records.reduce((sum, rec) => {
                const loanD = rec.loanDeductions.find(ld => ld.loanId === loan.id);
                return sum + (loanD ? loanD.amount : 0);
            }, 0);
            
            if (calculatedDeduct > 0) {
                return {
                    ...loan,
                    outstandingBalance: Math.max(0, parseFloat((loan.outstandingBalance - calculatedDeduct).toFixed(2)))
                };
            }
            return loan;
        });

        let nextCutoffId = 'PR-2026-12';
        let start = '2026-06-16';
        let end = '2026-06-30';
        
        if (state.currentCutoff.schedule === 'Weekly') {
            const currentWNo = parseInt(state.currentCutoff.id.split('-W')[1] || '23');
            nextCutoffId = `PR-2026-W${currentWNo + 1}`;
            const nextStart = new Date(state.currentCutoff.end);
            nextStart.setDate(nextStart.getDate() + 1);
            const nextEnd = new Date(nextStart);
            nextEnd.setDate(nextEnd.getDate() + 6);
            start = nextStart.toISOString().split('T')[0];
            end = nextEnd.toISOString().split('T')[0];
        } else if (state.currentCutoff.schedule === 'Semi-Monthly') {
            const isSecondCutoff = state.currentCutoff.start.endsWith('-16');
            if (isSecondCutoff) {
                const yr = state.currentCutoff.start.substring(0, 4);
                const nextMonth = parseInt(state.currentCutoff.start.substring(5, 7)) + 1;
                const moStr = nextMonth < 10 ? `0${nextMonth}` : `${nextMonth}`;
                nextCutoffId = `PR-${yr}-${nextMonth * 2 - 1}`;
                start = `${yr}-${moStr}-01`;
                end = `${yr}-${moStr}-15`;
            } else {
                const yr = state.currentCutoff.start.substring(0, 4);
                const moStr = state.currentCutoff.start.substring(5, 7);
                nextCutoffId = `PR-${yr}-${parseInt(moStr) * 2}`;
                start = `${yr}-${moStr}-16`;
                const lastDay = new Date(parseInt(yr), parseInt(moStr), 0).getDate();
                end = `${yr}-${moStr}-${lastDay}`;
            }
        }

        const payrollCycles = [...state.payrollCycles, newCycle];
        
        const overrides = state.overrides.map(o => ({
            ...o,
            retroHours: 0,
            adjustments: 0,
            canteenDeduct: 0,
            coValeDeduct: 0,
            otherDeduct: 0,
            taxRefund: 0,
            taxBalance: 0
        }));

        saveState({
            ...state,
            loans,
            payrollCycles,
            currentCutoff: {
                id: nextCutoffId,
                start,
                end,
                schedule: state.currentCutoff.schedule
            },
            overrides
        });
    };

    const resetToSeed = () => {
        saveState(initialAppState);
    };

    return {
        state,
        setRole,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        saveRoster,
        saveAttendance,
        saveOverrides,
        addLoan,
        updateLoanBalance,
        fileLeave,
        updateLeaveStatus,
        changeCutoff,
        runCalculation,
        finalizePayrollCycle,
        resetToSeed
    };
};
