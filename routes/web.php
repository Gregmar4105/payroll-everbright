<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::redirect('dashboard', 'dashboard/overview');
    Route::inertia('dashboard/overview', 'dashboard/overview')->name('dashboard');
    
    // Dashboard subpages
    Route::inertia('dashboard/analytics', 'dashboard/analytics')->name('dashboard.analytics');
    Route::inertia('dashboard/payroll-logs', 'dashboard/payroll-logs')->name('dashboard.payroll-logs');
    Route::inertia('dashboard/statutory-files', 'dashboard/statutory-files')->name('dashboard.statutory-files');
    Route::inertia('dashboard/bank-advice', 'dashboard/bank-advice')->name('dashboard.bank-advice');
    Route::inertia('dashboard/reports', 'dashboard/reports')->name('dashboard.reports');
    
    // Employees subpages
    Route::inertia('employees/profiles', 'employees/profiles')->name('employees.profiles');
    Route::inertia('employees/201-files', 'employees/201-files')->name('employees.files201');
    Route::inertia('employees/status', 'employees/status')->name('employees.status');
    Route::inertia('employees/cba', 'employees/cba')->name('employees.cba');
    
    // Time & Attendance
    Route::inertia('time-attendance/roster', 'time-attendance/roster')->name('time-attendance.roster');
    Route::inertia('time-attendance/monitoring', 'time-attendance/monitoring')->name('time-attendance.monitoring');
    Route::inertia('time-attendance/biometrics', 'time-attendance/biometrics')->name('time-attendance.biometrics');
    Route::inertia('time-attendance/validation', 'time-attendance/validation')->name('time-attendance.validation');
    
    // Leave Management
    Route::inertia('leave-management/accruals', 'leave-management/accruals')->name('leave-management.accruals');
    Route::inertia('leave-management/approvals', 'leave-management/approvals')->name('leave-management.approvals');
    Route::inertia('leave-management/balance', 'leave-management/balance')->name('leave-management.balance');
    
    // Payroll
    Route::inertia('payroll/draft', 'payroll/draft')->name('payroll.draft');
    Route::inertia('payroll/variance', 'payroll/variance')->name('payroll.variance');
    Route::inertia('payroll/override', 'payroll/override')->name('payroll.override');
    Route::inertia('payroll/finalization', 'payroll/finalization')->name('payroll.finalization');
    
    // Compensation & Benefits
    Route::inertia('compensation-benefits/base-pay', 'compensation-benefits/base-pay')->name('compensation-benefits.base-pay');
    Route::inertia('compensation-benefits/allowances', 'compensation-benefits/allowances')->name('compensation-benefits.allowances');
    Route::inertia('compensation-benefits/loans', 'compensation-benefits/loans')->name('compensation-benefits.loans');
});

require __DIR__.'/settings.php';
