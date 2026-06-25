import type { HTMLAttributes } from 'react';

export default function AppLogoIcon({ className, ...props }: HTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logo.png"
            className={className}
            alt="Everbright Logo"
            {...props}
        />
    );
}
