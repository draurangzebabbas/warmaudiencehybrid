"use client";

import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Suspense } from 'react'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setLoading(true)
        const { error } = await supabase.auth.updateUser({
            password: password,
        })

        if (error) {
            toast.error(error.message || "Something went wrong")
        } else {
            toast.success("Password reset successfully")
            router.push("/login")
        }
        setLoading(false)
    }

    // The token is handled automatically by the Supabase client or PKCE callback

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
            <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
                <div className="text-center">
                    <Link
                        href="/"
                        aria-label="go home"
                        className="mx-auto block w-fit">
                        <LogoIcon />
                    </Link>
                    <h1 className="mb-1 mt-4 text-xl font-semibold">Reset Password</h1>
                    <p className="text-sm">Enter your new password below</p>
                </div>

                <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                required
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10"
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                            >
                                {showPassword ? (
                                    <IconEyeOff className="size-4" />
                                ) : (
                                    <IconEye className="size-4" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pr-10"
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                            >
                                {showConfirmPassword ? (
                                    <IconEyeOff className="size-4" />
                                ) : (
                                    <IconEye className="size-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button className="w-full" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                </div>
            </div>

            <div className="p-3 text-center">
                <Button asChild variant="link" size="sm">
                    <Link href="/login">Back to login</Link>
                </Button>
            </div>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <Suspense fallback={<div className="m-auto text-sm">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </section>
    )
}
