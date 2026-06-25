import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col justify-between p-10 text-white lg:flex border-r border-neutral-200 dark:border-neutral-800 overflow-hidden">
                {/* Background image covering the whole left split screen */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/everbright-location.jpg" 
                        alt="Everbright Location Background" 
                        className="w-full h-full object-cover"
                    />
                    {/* Dark overlay for rich aesthetics and readability */}
                    <div className="absolute inset-0 bg-neutral-950/60 dark:bg-neutral-950/80 backdrop-blur-[2px]" />
                </div>

                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-semibold text-white drop-shadow-md hover:text-neutral-200 transition-colors"
                >
                    <AppLogoIcon className="mr-3 size-12 object-contain" />
                    <span className="text-xl font-bold tracking-tight">{name}</span>
                </Link>

                {/* Minimalist Google Map card positioned in the lower right part */}
                <div className="absolute bottom-10 right-10 z-10 w-[300px] backdrop-blur-md bg-white/80 dark:bg-neutral-950/80 p-2 rounded-2xl border border-white/10 dark:border-neutral-800 shadow-2xl space-y-2">
                    <div className="overflow-hidden rounded-xl">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1624.099560527181!2d121.03130227341273!3d14.497228739069978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397cee04a937ea3%3A0x37286a704b26c0f0!2sEverbright!5e0!3m2!1sen!2sph!4v1782399361650!5m2!1sen!2sph" 
                            width="100%" 
                            height="180" 
                            style={{ border: 0 }} 
                            allowFullScreen 
                            loading="lazy" 
                            referrerPolicy="strict-origin-when-cross-origin"
                            className="w-full dark:invert-[0.9] dark:hue-rotate-[180deg]"
                        />
                    </div>
                    <div className="px-2 py-1 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-neutral-850 dark:text-neutral-200">
                            Everbright Location
                        </span>
                        <a 
                            href="https://maps.google.com/?q=Everbright" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[10px] text-green-600 hover:text-green-700 dark:text-green-450 dark:hover:text-green-300 font-semibold transition-colors"
                        >
                            Get Directions
                        </a>
                    </div>
                </div>

                <div className="absolute bottom-10 left-10 z-20 text-xs text-neutral-300 dark:text-neutral-400 drop-shadow-md">
                    &copy; {new Date().getFullYear()} {name}. All rights reserved.
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <Link
                        href={home()}
                        className="flex flex-col items-center justify-center gap-4 font-semibold"
                    >
                        <div className="flex h-16 w-16 items-center justify-center rounded-md">
                            <AppLogoIcon className="size-16" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 text-center">
                            {name}
                        </span>
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
