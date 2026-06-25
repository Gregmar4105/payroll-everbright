import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Delete Account</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Permanently delete your account and all of its resources.
                </p>
            </div>
            <div className="md:col-span-2">
                <Card className="border-red-200 bg-red-50/30 dark:border-red-900/30 dark:bg-red-950/10">
                    <CardContent className="p-6 space-y-4">
                        <div className="relative space-y-0.5 text-red-650 dark:text-red-250">
                            <p className="font-semibold text-sm text-red-700 dark:text-red-200">Warning</p>
                            <p className="text-sm">
                                Please proceed with caution, this cannot be undone.
                            </p>
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    data-test="delete-user-button"
                                >
                                    Delete account
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle>
                                    Are you sure you want to delete your account?
                                </DialogTitle>
                                <DialogDescription>
                                    Once your account is deleted, all of its resources
                                    and data will also be permanently deleted. Please
                                    enter your password to confirm you would like to
                                    permanently delete your account.
                                </DialogDescription>

                                <Form
                                    {...ProfileController.destroy.form()}
                                    options={{
                                        preserveScroll: true,
                                    }}
                                    onError={() => passwordInput.current?.focus()}
                                    resetOnSuccess
                                    className="space-y-6"
                                >
                                    {({ resetAndClearErrors, processing, errors }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="password"
                                                    className="sr-only"
                                                >
                                                    Password
                                                </Label>

                                                <PasswordInput
                                                    id="password"
                                                    name="password"
                                                    ref={passwordInput}
                                                    placeholder="Password"
                                                    autoComplete="current-password"
                                                />

                                                <InputError message={errors.password} />
                                            </div>

                                            <DialogFooter className="gap-2">
                                                <DialogClose asChild>
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() =>
                                                            resetAndClearErrors()
                                                        }
                                                    >
                                                        Cancel
                                                    </Button>
                                                </DialogClose>

                                                <Button
                                                    variant="destructive"
                                                    disabled={processing}
                                                    asChild
                                                >
                                                    <button
                                                        type="submit"
                                                        data-test="confirm-delete-user-button"
                                                    >
                                                        Delete account
                                                    </button>
                                                </Button>
                                            </DialogFooter>
                                        </>
                                    )}
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
