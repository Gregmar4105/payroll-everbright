import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import { Card, CardContent } from '@/components/ui/card';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Theme Appearance</h3>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Update the appearance settings for your account, switching between light, dark, and system themes.
                    </p>
                </div>
                <div className="md:col-span-2">
                    <Card className="border-neutral-200/60 dark:border-neutral-800 shadow-xs bg-white dark:bg-neutral-900/50">
                        <CardContent className="p-6">
                            <AppearanceTabs />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
