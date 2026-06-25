import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex items-center justify-center">
                <AppLogoIcon className="h-12 w-auto object-contain" />
            </div>
            <div className="ml-4 grid flex-1 text-left text-base">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Everbright Net & Twine Mfg., Corporation
                </span>
            </div>
        </>
    );
}
