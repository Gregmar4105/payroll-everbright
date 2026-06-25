import { Head } from '@inertiajs/react';
import { Search, Filter, Plus, Mail, Phone, Building, User, Edit2, Trash2, X, Check, Landmark } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayroll, Employee } from '@/lib/payrollStore';

export default function Profiles() {
    const { state, addEmployee, updateEmployee, deleteEmployee } = usePayroll();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
    
    // Form states
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formRole, setFormRole] = useState('');
    const [formDept, setFormDept] = useState<'Maintenance' | 'Production' | 'Warehouse' | 'Office' | 'Admin & HR' | 'Logistics' | 'Manufacturing'>('Production');
    const [formStatus, setFormStatus] = useState<Employee['status']>('Active');
    const [formEmpStatus, setFormEmpStatus] = useState<Employee['employmentStatus']>('Regular');
    const [formCba, setFormCba] = useState(false);
    const [formSalary, setFormSalary] = useState(25000);
    const [formAllowance, setFormAllowance] = useState(2000);
    const [formSchedule, setFormSchedule] = useState<Employee['paySchedule']>('Semi-Monthly');
    const [formSss, setFormSss] = useState('');
    const [formPhic, setFormPhic] = useState('');
    const [formHdmf, setFormHdmf] = useState('');
    const [formBankName, setFormBankName] = useState('BDO Unibank');
    const [formBankAccount, setFormBankAccount] = useState('');
    const [formUnion, setFormUnion] = useState(false);

    const openAddModal = () => {
        setEditingEmp(null);
        setFormName('');
        setFormEmail('');
        setFormPhone('');
        setFormRole('');
        setFormDept('Production');
        setFormStatus('Active');
        setFormEmpStatus('Regular');
        setFormCba(false);
        setFormSalary(25000);
        setFormAllowance(2000);
        setFormSchedule('Semi-Monthly');
        setFormSss('34-' + Math.floor(1000000 + Math.random() * 9000000) + '-0');
        setFormPhic('12-' + Math.floor(100000000 + Math.random() * 900000000) + '-1');
        setFormHdmf('1029-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000));
        setFormBankName('BDO Unibank');
        setFormBankAccount(Math.floor(100000000000 + Math.random() * 900000000000).toString());
        setFormUnion(false);
        setIsModalOpen(true);
    };

    const openEditModal = (emp: Employee) => {
        setEditingEmp(emp);
        setFormName(emp.name);
        setFormEmail(emp.email);
        setFormPhone(emp.phone);
        setFormRole(emp.role);
        setFormDept(emp.dept);
        setFormStatus(emp.status);
        setFormEmpStatus(emp.employmentStatus);
        setFormCba(emp.cbaTagged);
        setFormSalary(emp.basicSalary);
        setFormAllowance(emp.allowance);
        setFormSchedule(emp.paySchedule);
        setFormSss(emp.sssNo);
        setFormPhic(emp.phicNo);
        setFormHdmf(emp.hdmfNo);
        setFormBankName(emp.bankName);
        setFormBankAccount(emp.bankAccount);
        setFormUnion(emp.unionJoined);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const empData = {
            name: formName,
            email: formEmail,
            phone: formPhone,
            role: formRole,
            dept: formDept,
            status: formStatus,
            employmentStatus: formEmpStatus,
            cbaTagged: formCba,
            basicSalary: Number(formSalary),
            allowance: Number(formAllowance),
            paySchedule: formSchedule,
            sssNo: formSss,
            phicNo: formPhic,
            hdmfNo: formHdmf,
            bankName: formBankName,
            bankAccount: formBankAccount,
            unionJoined: formUnion,
            dateHired: editingEmp?.dateHired || new Date().toISOString().split('T')[0]
        };

        if (editingEmp) {
            updateEmployee(editingEmp.id, empData);
        } else {
            addEmployee(empData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this employee? This will remove all their roster and payroll records.')) {
            deleteEmployee(id);
            setIsModalOpen(false);
        }
    };

    // Filter employees
    const filteredEmployees = state.employees.filter((emp) => {
        const matchesSearch = 
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesDept = selectedDept === 'All' || emp.dept === selectedDept;
        
        return matchesSearch && matchesDept;
    });

    const departments = ['All', 'Production', 'Maintenance', 'Warehouse', 'Logistics', 'Admin & HR', 'Office'];

    // Visual indicators for authorization roles
    const canModify = state.userRole === 'System Admin' || state.userRole === 'HR Manager';

    return (
        <>
            <Head title="Employee Profiles" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-neutral-50/50 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Employee Directory</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Manage Everbright Net & Twine's active directory, payroll mappings, and profile definitions.
                        </p>
                    </div>
                    {canModify ? (
                        <Button onClick={openAddModal} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 size-sm">
                            <Plus className="h-4 w-4" /> Add Employee
                        </Button>
                    ) : (
                        <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:bg-amber-950/20 px-3 py-1 text-xs">
                            View-Only Mode ({state.userRole})
                        </Badge>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, role, department, or email..."
                            className="pl-9 pr-4 py-2 w-full rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:ring-emerald-400 text-neutral-800 dark:text-neutral-200"
                        />
                    </div>
                    <div className="flex gap-2">
                        {departments.map((dept) => (
                            <button
                                key={dept}
                                onClick={() => setSelectedDept(dept)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    selectedDept === dept
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400'
                                }`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Profiles Table */}
                <Card className="border-neutral-200/60 dark:border-neutral-800">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">Employee</th>
                                        <th className="py-3.5 px-6">Department & Role</th>
                                        <th className="py-3.5 px-6">Pay Details</th>
                                        <th className="py-3.5 px-6">CBA & Union</th>
                                        <th className="py-3.5 px-6">Status</th>
                                        <th className="py-3.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-sm">
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                            <td className="py-3 px-6">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 ring-1 ring-neutral-200 dark:ring-neutral-800">
                                                        <AvatarImage src={emp.avatar} alt={emp.name} />
                                                        <AvatarFallback className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-xs">
                                                            {emp.initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-semibold text-neutral-900 dark:text-white">{emp.name}</div>
                                                        <div className="text-xs text-neutral-400 font-mono">ID: {emp.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="text-neutral-800 dark:text-neutral-200 font-medium">{emp.role}</div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                                                    <Building className="h-3 w-3 text-neutral-400" /> {emp.dept}
                                                </div>
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="text-neutral-800 dark:text-neutral-200 font-semibold font-mono">
                                                    ₱{emp.basicSalary.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">/ {emp.paySchedule === 'Weekly' ? 'Wk' : 'Mo'}</span>
                                                </div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                                                    Allowance: ₱{emp.allowance.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 space-y-1">
                                                <div className="flex gap-1.5">
                                                    <Badge className={`text-[10px] font-semibold py-0 px-1.5 ${
                                                        emp.cbaTagged 
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                            : 'bg-neutral-50 text-neutral-500 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800'
                                                    }`}>
                                                        {emp.cbaTagged ? 'CBA Tagged' : 'Non-CBA'}
                                                    </Badge>
                                                    {emp.unionJoined && (
                                                        <Badge className="text-[10px] font-semibold py-0 px-1.5 bg-blue-50 text-blue-700 border border-blue-200">
                                                            Union Member
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="flex flex-col gap-1">
                                                    <Badge className={`
                                                        w-fit font-medium text-xs
                                                        ${emp.status === 'Active' && 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400'}
                                                        ${emp.status === 'On Leave' && 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400'}
                                                        ${emp.status === 'Suspended' && 'bg-red-50 text-red-700 border-red-200/50 dark:bg-red-950/20 dark:text-red-400'}
                                                    `}>
                                                        {emp.status}
                                                    </Badge>
                                                    <span className="text-[10px] text-neutral-400 font-medium">({emp.employmentStatus})</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                <Button 
                                                    onClick={() => openEditModal(emp)} 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-8 border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-50 hover:text-emerald-600"
                                                >
                                                    {canModify ? 'Manage' : 'View Details'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200 flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                                <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
                                    {editingEmp ? `Manage Profile: ${editingEmp.name}` : 'Register New Employee'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-500 uppercase">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            placeholder="Juan dela Cruz"
                                            disabled={!canModify}
                                            className="w-full text-sm p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-500 uppercase">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            value={formEmail}
                                            onChange={(e) => setFormEmail(e.target.value)}
                                            placeholder="juan.delacruz@everbright.ph"
                                            disabled={!canModify}
                                            className="w-full text-sm p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-500 uppercase">Phone Number</label>
                                        <input
                                            required
                                            type="text"
                                            value={formPhone}
                                            onChange={(e) => setFormPhone(e.target.value)}
                                            placeholder="0917-000-0000"
                                            disabled={!canModify}
                                            className="w-full text-sm p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-500 uppercase">Role / Job Title</label>
                                        <input
                                            required
                                            type="text"
                                            value={formRole}
                                            onChange={(e) => setFormRole(e.target.value)}
                                            placeholder="Thread Weaver"
                                            disabled={!canModify}
                                            className="w-full text-sm p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-500 uppercase">Department</label>
                                        <select
                                            value={formDept}
                                            onChange={(e) => setFormDept(e.target.value as any)}
                                            disabled={!canModify}
                                            className="w-full text-sm p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200"
                                        >
                                            <option value="Production">Production</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Warehouse">Warehouse</option>
                                            <option value="Logistics">Logistics</option>
                                            <option value="Admin & HR">Admin & HR</option>
                                            <option value="Office">Office</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-500 uppercase">Employment Status</label>
                                        <select
                                            value={formEmpStatus}
                                            onChange={(e) => setFormEmpStatus(e.target.value as any)}
                                            disabled={!canModify}
                                            className="w-full text-sm p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200"
                                        >
                                            <option value="Regular">Regular (CBA Entitled)</option>
                                            <option value="Probationary">Probationary (OT @ 25%, NSD @ 10%)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-500 uppercase">Pay Schedule</label>
                                        <select
                                            value={formSchedule}
                                            onChange={(e) => setFormSchedule(e.target.value as any)}
                                            disabled={!canModify}
                                            className="w-full text-sm p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200"
                                        >
                                            <option value="Weekly">Weekly (Cutoff: Mon-Sun)</option>
                                            <option value="Bi-Monthly">Bi-Monthly (Cutoff: 27-11 / 12-26)</option>
                                            <option value="Semi-Monthly">Semi-Monthly (Cutoff: 1-15 / 16-30)</option>
                                            <option value="Monthly">Monthly (Cutoff: 1-30)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-500 uppercase">Account Status</label>
                                        <select
                                            value={formStatus}
                                            onChange={(e) => setFormStatus(e.target.value as any)}
                                            disabled={!canModify}
                                            className="w-full text-sm p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="On Leave">On Leave</option>
                                            <option value="Suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 grid gap-4 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-500 uppercase">Base Salary Rate (₱)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formSalary}
                                            onChange={(e) => setFormSalary(Number(e.target.value))}
                                            placeholder="25000"
                                            disabled={!canModify}
                                            className="w-full text-sm p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 font-mono"
                                        />
                                        <span className="text-[10px] text-neutral-400">Monthly base salary (Weekly rate if Weekly schedule selected)</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-500 uppercase">Allowance Rate (₱)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formAllowance}
                                            onChange={(e) => setFormAllowance(Number(e.target.value))}
                                            placeholder="2000"
                                            disabled={!canModify}
                                            className="w-full text-sm p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-4">
                                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">CBA Rules & Union Membership</h4>
                                    <div className="flex flex-col gap-3">
                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formCba}
                                                onChange={(e) => setFormCba(e.target.checked)}
                                                disabled={!canModify}
                                                className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                            />
                                            <div className="text-sm">
                                                <span className="font-semibold text-neutral-800 dark:text-neutral-200">Bound by Collective Bargaining Agreement (CBA)</span>
                                                <p className="text-xs text-neutral-400">Entitles employee to CBA overtime multiplier (Basic + 30%) and NSD multiplier (Basic + 20%).</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formUnion}
                                                onChange={(e) => setFormUnion(e.target.checked)}
                                                disabled={!canModify}
                                                className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                            />
                                            <div className="text-sm">
                                                <span className="font-semibold text-neutral-800 dark:text-neutral-200">Union Dues Collection (1% basic deduction)</span>
                                                <p className="text-xs text-neutral-400">Collects exactly 1% of Basic/Regular pay per cutoff for union dues.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-4">
                                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Statutory (201 File) & Bank Registry</h4>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-semibold text-neutral-500 uppercase">SSS Number</label>
                                            <input
                                                type="text"
                                                value={formSss}
                                                onChange={(e) => setFormSss(e.target.value)}
                                                disabled={!canModify}
                                                className="w-full text-xs p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 font-mono text-neutral-800 dark:text-neutral-200"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-semibold text-neutral-500 uppercase">PhilHealth ID</label>
                                            <input
                                                type="text"
                                                value={formPhic}
                                                onChange={(e) => setFormPhic(e.target.value)}
                                                disabled={!canModify}
                                                className="w-full text-xs p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 font-mono text-neutral-800 dark:text-neutral-200"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-semibold text-neutral-500 uppercase">HDMF Number</label>
                                            <input
                                                type="text"
                                                value={formHdmf}
                                                onChange={(e) => setFormHdmf(e.target.value)}
                                                disabled={!canModify}
                                                className="w-full text-xs p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 font-mono text-neutral-800 dark:text-neutral-200"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-semibold text-neutral-500 uppercase">Bank Partner</label>
                                            <select
                                                value={formBankName}
                                                onChange={(e) => setFormBankName(e.target.value)}
                                                disabled={!canModify}
                                                className="w-full text-xs p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200"
                                            >
                                                <option value="BDO Unibank">BDO Unibank</option>
                                                <option value="BPI">BPI</option>
                                                <option value="Metrobank">Metrobank</option>
                                                <option value="Security Bank">Security Bank</option>
                                                <option value="UnionBank">UnionBank</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-semibold text-neutral-500 uppercase">Account Number</label>
                                            <input
                                                type="text"
                                                value={formBankAccount}
                                                onChange={(e) => setFormBankAccount(e.target.value)}
                                                disabled={!canModify}
                                                className="w-full text-xs p-2 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 font-mono text-neutral-800 dark:text-neutral-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 flex items-center justify-between">
                                    <div>
                                        {editingEmp && canModify && (
                                            <Button
                                                type="button"
                                                onClick={() => handleDelete(editingEmp.id)}
                                                variant="destructive"
                                                className="h-9 gap-1 text-xs"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Delete Employee
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            variant="outline"
                                            className="h-9 text-xs border-neutral-200"
                                        >
                                            Cancel
                                        </Button>
                                        {canModify && (
                                            <Button
                                                type="submit"
                                                className="h-9 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                                {editingEmp ? 'Save Changes' : 'Register Account'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Profiles.layout = {
    breadcrumbs: [
        { title: 'Employees', href: '/employees/profiles' },
        { title: 'Profiles', href: '/employees/profiles' },
    ],
};

