import { FormEvent, ReactNode, useEffect, useState } from "react"
import { NextRouter } from "next/router"
import { createAuthClient } from "better-auth/react"

import { cn } from "@/lib/utils"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { AlertCircle, Loader2, LockIcon, MailIcon } from "lucide-react"

type AuthClient = ReturnType<typeof createAuthClient>

export const authViews = ["login", "signup", "forgot-password", "reset-password", "logout"] as const
export type AuthView = typeof authViews[number]

const DefaultLink = (
    { href, className, children }: { href: string, className?: string, children: ReactNode }
) => (
    <a href={href} className={className}>
        {children}
    </a>
)

const defaultNavigate = (href: string) => window.location.href = href

export const defaultLocalization = {
    login_title: "Login",
    signup_title: "Sign Up",
    forgot_password_title: "Forgot Password",
    reset_password_title: "Reset Password",
    login_description: "Enter your email below to login to your account",
    signup_description: "Enter your information to create an account",
    email_label: "Email Address",
    username_label: "Username",
    password_label: "Password",
    email_placeholder: "m@example.com",
    username_placeholder: "Username",
    password_placeholder: "Password",
    login_button: "Login",
    signup_button: "Sign Up",
    forgot_password_button: "Send Reset Password Link",
    reset_password_button: "Reset Password",
    provider_prefix: "Continue with",
    magic_link_provider: "Magic Link",
    password_provider: "Password",
    login_footer: "Don't have an account?",
    signup_footer: "Already have an account?",
    forgot_password: "Forgot your password?",
    login: "Login",
    signup: "Sign Up",
    email_confirmation_text: "Check your email for the confirmation link",
    email_reset_password_text: "Check your email for the password reset link",
    email_magic_link_text: "Check your email for the magic link",
    error: "Error",
    alert: "Alert"
}

type AuthToastOptions = {
    description: string
    variant: "default" | "destructive"
    action?: {
        label: string
        onClick: () => void
    }
}

export interface AuthCardProps {
    authClient: AuthClient,
    navigate?: (url: string) => void
    pathname?: string
    nextRouter?: NextRouter
    initialView?: AuthView
    emailPassword?: boolean
    magicLink?: boolean
    startWithMagicLink?: boolean
    localization?: Partial<typeof defaultLocalization>
    disableRouting?: boolean
    disableAnimation?: boolean
    toast?: (options: AuthToastOptions) => void
    LinkComponent?: React.ComponentType<{ href: string, className?: string, children: ReactNode }>
}

const hideElementClass = "opacity-0 scale-y-0 h-0 overflow-hidden"
const transitionClass = "transition-all"

export function AuthCard({
    authClient,
    navigate,
    pathname,
    nextRouter,
    initialView = "login",
    emailPassword = true,
    magicLink,
    startWithMagicLink,
    localization,
    disableRouting,
    disableAnimation,
    toast,
    LinkComponent = DefaultLink
}: AuthCardProps) {
    localization = { ...defaultLocalization, ...localization }
    navigate = navigate || nextRouter?.push || defaultNavigate
    pathname = pathname || nextRouter?.asPath
    const { data: sessionData, isPending } = authClient.useSession()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [view, setView] = useState(initialView)
    const [isMagicLink, setIsMagicLink] = useState(startWithMagicLink || !emailPassword)
    const [authToast, setAuthToast] = useState<AuthToastOptions | null>(null)

    const onSubmit = async (e: FormEvent) => {
        e?.preventDefault()

        setAuthToast(null)
        setLoading(true)
        const { error } = await authClient.signIn.email({ email, password })
        setLoading(false)

        if (error?.message) {
            setAuthToast({
                description: error.message,
                variant: "destructive"
            })
        }
    }

    useEffect(() => {
        if (sessionData && !(sessionData.user as Record<string, unknown>)?.isAnonymous) {
            navigate("/")
        }
    }, [sessionData])

    useEffect(() => {
        if (!pathname) return
        const path = pathname.split("/").pop()

        if (authViews.includes(path as AuthView)) {
            setView(path as AuthView)
        }
    }, [pathname])

    useEffect(() => {
        if (view != "login") {
            setIsMagicLink(false)
        }
    }, [view])

    useEffect(() => {
        if (!authToast || !toast) return

        toast(authToast)
    }, [authToast])

    return (
        <Card
            className={cn(((nextRouter && !nextRouter.isReady) || isPending) && "opacity-0",
                !disableAnimation && transitionClass,
                "max-w-md w-full"
            )}
        >
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                    {localization[`${view.replace("-", "_")}_title` as keyof typeof localization]}
                </CardTitle>

                <CardDescription className="text-xs md:text-sm">
                    {localization[`${view.replace("-", "_")}_description` as keyof typeof localization]}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form className="grid" onSubmit={onSubmit}>
                    <div className="grid gap-2 mb-4">
                        <Label htmlFor="email">
                            {localization.email_label}
                        </Label>

                        <Input
                            id="email"
                            type="email"
                            placeholder={localization.email_placeholder}
                            required
                            onChange={(e) => {
                                setEmail(e.target.value)
                            }}
                            value={email}
                        />
                    </div>

                    <div
                        className={cn(isMagicLink ? hideElementClass : "mb-4 h-[62px]",
                            !disableAnimation && transitionClass,
                            "grid gap-2"
                        )}
                    >
                        <div className="flex items-center relative">
                            <Label htmlFor="password">
                                {localization.password_label}
                            </Label>

                            <a
                                href="/forgot-password"
                                className={cn(view === "login" && !isMagicLink && !isPending ? "h-6" : hideElementClass,
                                    !disableAnimation && transitionClass,
                                    "absolute right-0 text-sm hover:underline z-10"
                                )}
                                tabIndex={isMagicLink ? -1 : undefined}
                            >
                                {localization.forgot_password}
                            </a>
                        </div>

                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            autoComplete="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isMagicLink}
                        />
                    </div>

                    <div className="flex flex-col">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                localization[`${view.replace("-", "_")}_button` as keyof typeof localization]
                            )}
                        </Button>

                        {!toast && (
                            <div
                                className={cn(!authToast ? hideElementClass : "mt-4",
                                    !disableAnimation && transitionClass,
                                )}
                            >
                                <Alert
                                    variant={authToast?.variant}
                                    className={authToast?.variant == "destructive" ? "bg-destructive/10" : "bg-foreground/5"}
                                >
                                    {authToast?.action && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="absolute top-5 right-4 text-foreground"
                                            onClick={authToast?.action.onClick}
                                        >
                                            authToast?.action.label
                                        </Button>
                                    )}

                                    <AlertCircle className="h-4 w-4" />

                                    <AlertTitle>
                                        {authToast?.variant == "destructive" ? localization.error : localization.alert}
                                    </AlertTitle>

                                    <AlertDescription>
                                        {authToast?.description}
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                        <div
                            className={cn((view != "login" || !magicLink || isMagicLink) ? hideElementClass : "mt-4",
                                !disableAnimation && transitionClass,
                            )}
                        >
                            <Button
                                type="button"
                                variant="secondary"
                                className="gap-2 w-full"
                                onClick={() => setIsMagicLink(true)}
                                disabled={view != "login" || !magicLink || isMagicLink}
                            >
                                <MailIcon className="w-4 h-4" />
                                {localization.provider_prefix}
                                {" "}
                                {localization.magic_link_provider}
                            </Button>
                        </div>

                        <div
                            className={cn((view != "login" || !emailPassword || !isMagicLink) ? hideElementClass : "mt-4",
                                !disableAnimation && transitionClass,
                            )}
                        >
                            <Button
                                type="button"
                                variant="secondary"
                                className="gap-2 w-full"
                                onClick={() => setIsMagicLink(false)}
                                disabled={view != "login" || !emailPassword || !isMagicLink}
                            >
                                <LockIcon className="w-4 h-4" />
                                {localization.provider_prefix}
                                {" "}
                                {localization.password_provider}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>

            <CardFooter>
                <div className="flex justify-center w-full border-t pt-4">
                    <p className="text-center text-xs text-muted-foreground">
                        {view == "signup" ? (
                            localization.signup_footer
                        ) : (
                            localization.login_footer
                        )}

                        <Button
                            asChild={!disableRouting}
                            variant="link"
                            size="sm"
                            className="text-xs px-1 h-fit underline"
                            onClick={() => setView(view == "signup" ? "login" : "signup")}
                        >
                            {disableRouting ? (
                                view == "signup" ? localization.login : localization.signup
                            ) : (
                                <LinkComponent
                                    href={view == "signup" ?
                                        "/auth/login"
                                        : "/auth/signup"
                                    }
                                >
                                    {view == "signup" ? localization.login : localization.signup}
                                </LinkComponent>
                            )}
                        </Button>
                    </p>
                </div>
            </CardFooter>
        </Card>
    )
}