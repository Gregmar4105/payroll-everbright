import { router } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { destroy } from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyRegistrationController';
import PasskeyItem from '@/components/passkey-item';
import PasskeyRegistration from '@/components/passkey-register';
import type { Passkey } from '@/types/auth';
import { Card, CardContent } from '@/components/ui/card';

export type Props = {
    canManagePasskeys?: boolean;
    passkeys?: Passkey[];
};

const EmptyState = () => {
    return (
        <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <KeyRound className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium">No passkeys yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
                Add a passkey to sign in without a password
            </p>
        </div>
    );
};

export default function ManagePasskeys(props: Props) {
    const passkeys = props.passkeys ?? [];

    const handleDelete = (id: number, onError: () => void) => {
        router.delete(destroy.url(id), {
            preserveScroll: true,
            onError,
        });
    };

    const handleRegisterSuccess = () => {
        router.reload();
    };

    if (!(props.canManagePasskeys ?? false)) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Passkeys</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Manage your passkeys for passwordless sign-in.
                </p>
            </div>
            <div className="md:col-span-2">
                <Card className="border-neutral-200/60 dark:border-neutral-800 shadow-xs bg-white dark:bg-neutral-900/50">
                    <CardContent className="p-6 space-y-4">
                        <div className="overflow-hidden rounded-lg border border-border">
                            {passkeys.length > 0 ? (
                                passkeys.map((passkey) => (
                                    <PasskeyItem
                                        key={passkey.id}
                                        passkey={passkey}
                                        onDelete={handleDelete}
                                    />
                                ))
                            ) : (
                                <EmptyState />
                            )}
                        </div>

                        <PasskeyRegistration onSuccess={handleRegisterSuccess} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
