import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    BookOpen,
    FileText,
    Folder,
    HelpCircle,
    LayoutGrid,
    Menu,
    Palette,
    Shield,
    User,
    Users,
    Briefcase,
    Tag,
    Calendar,
    Fingerprint,
    Clock,
    Layers,
    CheckSquare,
    Scale,
    FilePlus,
    GitCompare,
    Sliders,
    Lock,
    Coins,
    Gift,
    Percent,
    ClipboardList,
    Building2,
    CreditCard,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { usePayroll } from '@/lib/payrollStore';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editProfile } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/dashboard/overview',
        isActive: (url: string) => url === '/dashboard/overview' || url === '/dashboard' || url === '/' || url.startsWith('/dashboard/'),
        subItems: [
            { title: 'Overview', href: '/dashboard/overview', icon: LayoutGrid },
            { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
            { title: 'Periodic payroll logs', href: '/dashboard/payroll-logs', icon: ClipboardList },
            { title: 'Statutory files', href: '/dashboard/statutory-files', icon: Building2 },
            { title: 'Bank advice files', href: '/dashboard/bank-advice', icon: CreditCard },
            { title: 'Reports', href: '/dashboard/reports', icon: FileText },
        ],
    },
    {
        title: 'Employees',
        href: '/employees/profiles',
        isActive: (url: string) => url.startsWith('/employees'),
        subItems: [
            { title: 'Profiles', href: '/employees/profiles', icon: Users },
            { title: '201 Files', href: '/employees/201-files', icon: Folder },
            { title: 'Employment Status', href: '/employees/status', icon: Briefcase },
            { title: 'CBA tagging', href: '/employees/cba', icon: Tag },
        ],
    },
    {
        title: 'Time & Attendance',
        href: '/time-attendance/roster',
        isActive: (url: string) => url.startsWith('/time-attendance'),
        subItems: [
            { title: 'Attendance monitoring', href: '/time-attendance/monitoring', icon: ClipboardList },
            { title: 'Roster scheduling', href: '/time-attendance/roster', icon: Calendar },
            { title: 'Biometric logs ingestion', href: '/time-attendance/biometrics', icon: Fingerprint },
            { title: 'Overtime/Undertime validation', href: '/time-attendance/validation', icon: Clock },
        ],
    },
    {
        title: 'Leave Management',
        href: '/leave-management/accruals',
        isActive: (url: string) => url.startsWith('/leave-management'),
        subItems: [
            { title: 'Accruals', href: '/leave-management/accruals', icon: Layers },
            { title: 'Routing/Approvals', href: '/leave-management/approvals', icon: CheckSquare },
            { title: 'Balance tracking', href: '/leave-management/balance', icon: Scale },
        ],
    },
    {
        title: 'Payroll',
        href: '/payroll/draft',
        isActive: (url: string) => url.startsWith('/payroll'),
        subItems: [
            { title: 'Draft generation', href: '/payroll/draft', icon: FilePlus },
            { title: 'Variance analysis', href: '/payroll/variance', icon: GitCompare },
            { title: 'Overriding', href: '/payroll/override', icon: Sliders },
            { title: 'Finalization', href: '/payroll/finalization', icon: Lock },
        ],
    },
    {
        title: 'Compensation and Benefits',
        href: '/compensation-benefits/base-pay',
        isActive: (url: string) => url.startsWith('/compensation-benefits'),
        subItems: [
            { title: 'Base pay', href: '/compensation-benefits/base-pay', icon: Coins },
            { title: 'Allowances', href: '/compensation-benefits/allowances', icon: Gift },
            { title: 'Loan tracking/amortization schedule', href: '/compensation-benefits/loans', icon: Percent },
        ],
    },
    {
        title: 'Settings',
        href: editProfile(),
        isActive: (url: string) => url.startsWith('/settings'),
        subItems: [
            { title: 'Profile', href: editProfile(), icon: User },
            { title: 'Security', href: editSecurity(), icon: Shield },
            { title: 'Appearance', href: editAppearance(), icon: Palette },
        ],
    },
];

export function AppHeader() {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { currentUrl, isCurrentUrl } = useCurrentUrl();
    const { state, setRole } = usePayroll();

    const defaultActiveItem = mainNavItems.find((item) => item.isActive(currentUrl)) || mainNavItems[0];
    const [selectedTab, setSelectedTab] = useState<string>(defaultActiveItem.title);

    useEffect(() => {
        const matchingItem = mainNavItems.find((item) => item.isActive(currentUrl));

        if (matchingItem) {
            setSelectedTab(matchingItem.title);
        }
    }, [currentUrl]);

    const activeMainItem =
        mainNavItems.find((item) => item.title === selectedTab) || mainNavItems[0];

    return (
        <>
            <div className="bg-white dark:bg-neutral-900/50 backdrop-blur-sm pb-4">
                <div className="mx-auto flex h-16 items-center justify-between px-6 max-w-7xl">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu */}
                        <div className="lg:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="mr-2 h-[34px] w-[34px]"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                                >
                                    <SheetTitle className="sr-only">
                                        Navigation menu
                                    </SheetTitle>
                                    <SheetHeader className="flex justify-start text-left border-b border-neutral-200 pb-4 dark:border-neutral-800">
                                        <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                    </SheetHeader>
                                    <div className="flex h-full flex-1 flex-col space-y-6 py-4 overflow-y-auto">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                <div key={item.title} className="flex flex-col space-y-2">
                                                    <div className="text-xs font-semibold text-neutral-400 tracking-wider uppercase px-3">
                                                        {item.title}
                                                    </div>
                                                    <div className="flex flex-col space-y-1 pl-2">
                                                        {item.subItems.map((subItem) => {
                                                            const SubIcon = subItem.icon;
                                                            const isSubActive = isCurrentUrl(subItem.href);

                                                            return (
                                                                <Link
                                                                    key={subItem.title}
                                                                    href={subItem.href}
                                                                    className={cn(
                                                                        "flex items-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                                                                        isSubActive
                                                                            ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                                                                            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/50"
                                                                    )}
                                                                >
                                                                    <SubIcon className="h-4 w-4" />
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                                            <div className="text-xs font-semibold text-neutral-400 tracking-wider uppercase mb-2 px-3">
                                                Resources
                                            </div>
                                            <div className="flex flex-col space-y-1 pl-2">
                                                <a
                                                    href="https://github.com/laravel/react-starter-kit"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 py-2 px-3 rounded-md text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/50"
                                                >
                                                    <Folder className="h-4 w-4" />
                                                    <span>Repository</span>
                                                </a>
                                                <a
                                                    href="https://laravel.com/docs/starter-kits#react"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 py-2 px-3 rounded-md text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/50"
                                                >
                                                    <BookOpen className="h-4 w-4" />
                                                    <span>Documentation</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        <Link
                            href={dashboard()}
                            prefetch
                            className="flex items-center space-x-2"
                        >
                            <AppLogo />
                        </Link>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-3">

                        {/* Role Switcher */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 border-neutral-200/80 bg-neutral-50/50 dark:border-neutral-800 text-xs font-semibold px-2.5 rounded-full hover:bg-neutral-100 dark:bg-neutral-900/40"
                                >
                                    <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-neutral-700 dark:text-neutral-300">{state.userRole}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48" align="end">
                                <div className="px-2 py-1.5 text-xs font-semibold text-neutral-400 tracking-wider uppercase">
                                    Switch User Role
                                </div>
                                {(['System Admin', 'HR Manager', 'Payroll Officer', 'Finance Approver', 'Employee'] as const).map((r) => (
                                    <DropdownMenuItem
                                        key={r}
                                        onClick={() => setRole(r)}
                                        className={cn(
                                            "cursor-pointer text-xs",
                                            state.userRole === r && "bg-emerald-50 text-emerald-950 font-semibold dark:bg-emerald-950/30 dark:text-emerald-300"
                                        )}
                                    >
                                        {r}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <a
                            href="https://laravel.com/docs/starter-kits#react"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden items-center space-x-1.5 rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/50 lg:flex transition-colors"
                        >
                            <HelpCircle className="h-3.5 w-3.5" />
                            <span>Help</span>
                        </a>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                        >
                            <Bell className="h-5 w-5" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-9 w-9 rounded-full p-0 flex items-center justify-center focus-visible:ring-0"
                                >
                                    <Avatar className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-neutral-200 dark:ring-neutral-800">
                                        <AvatarImage
                                            src={auth.user?.avatar}
                                            alt={auth.user?.name}
                                        />
                                        <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Row 2: Main Header Navigation */}
            <div className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="mx-auto flex h-12 items-center px-6 max-w-7xl">
                    <nav className="flex space-x-8">
                        {mainNavItems.map((item) => {
                            const active = item.title === selectedTab;

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    onClick={(e) => {
                                        if (item.href === '#') {
                                            e.preventDefault();
                                        }

                                        setSelectedTab(item.title);
                                    }}
                                    className={cn(
                                        "text-base font-medium transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 py-3.5 relative",
                                        active
                                            ? "text-neutral-900 font-semibold dark:text-neutral-100"
                                            : "text-neutral-500 dark:text-neutral-400"
                                    )}
                                >
                                    {item.title}
                                    {active && (
                                        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-neutral-900 dark:bg-neutral-100" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Row 3: Sub Navigation for Active Header Item */}
            <div className="border-b border-neutral-200 bg-neutral-50/50 dark:border-neutral-800/80 dark:bg-neutral-950/20">
                <div className="mx-auto flex h-12 items-center px-6 max-w-7xl">
                    <div className="flex space-x-6">
                        {activeMainItem.subItems.map((subItem) => {
                            const isSubActive = isCurrentUrl(subItem.href);
                            const SubIcon = subItem.icon;

                            return (
                                <Link
                                    key={subItem.title}
                                    href={subItem.href}
                                    className={cn(
                                        "flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                        isSubActive
                                            ? "bg-white text-neutral-900 border border-neutral-200/80 shadow-sm dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700/80"
                                            : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800/30"
                                    )}
                                >
                                    <SubIcon className="h-3.5 w-3.5 opacity-80" />
                                    <span>{subItem.title}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
