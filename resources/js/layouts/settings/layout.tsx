import type { PropsWithChildren } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    return (
        <div className="px-6 py-6 max-w-7xl mx-auto flex h-full flex-1 flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Settings</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                    Manage your profile and account settings.
                </p>
            </div>

            <div className="mt-2 flex flex-col space-y-6">
                <div className="flex-1">
                    <section className="max-w-4xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
