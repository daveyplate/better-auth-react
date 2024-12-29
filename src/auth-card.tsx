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
import { FormEvent, ReactNode, useEffect, useState } from "react"
import { AlertCircle, Loader2, LockIcon, MailIcon } from "lucide-react"
import {
    createAuthClient
} from "better-auth/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type AuthClient = ReturnType<typeof createAuthClient>

export type AuthView = "login" | "signup" | "forgot-password" | "reset-password" | "logout"

const DefaultLink = (
    { href, className, children }: { href: string, className?: string, children: ReactNode }
) => (
    <a href={href} className={className}>
        {children}
    </a>
)

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
}

export interface AuthCardProps {
    authClient: AuthClient,
    navigate?: (url: string) => void
    pathname?: string
    initialView?: AuthView
    emailPassword?: boolean
    magicLink?: boolean
    startWithMagicLink?: boolean
    localization?: Partial<typeof defaultLocalization>
    disableRouting?: boolean
    LinkComponent?: React.ComponentType<{ href: string, className?: string, children: ReactNode }>
}

export function AuthCard({
    authClient,
    navigate = (url) => window.location.href = url,
    pathname,
    initialView = "login",
    emailPassword = true,
    magicLink,
    startWithMagicLink,
    localization,
    disableRouting,
    LinkComponent = DefaultLink
}: AuthCardProps) {
    localization = { ...defaultLocalization, ...localization }
    const { data: sessionData, isPending } = authClient.useSession()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [view, setView] = useState(initialView)
    const [isMagicLink, setIsMagicLink] = useState(startWithMagicLink || !emailPassword)
    const [alertMessage, setAlertMessage] = useState<string | null | undefined>()
    const [errorMessage, setErrorMessage] = useState<string | null | undefined>()

    const onSubmit = async (e: FormEvent) => {
        e?.preventDefault()

        setErrorMessage(null)
        setLoading(true)
        const { error } = await authClient.signIn.email({ email, password })
        setLoading(false)

        if (error) {
            setErrorMessage(error.message)
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

        if (["login", "signup", "forgot-password", "reset-password", "logout"].includes(path as AuthView)) {
            setView(path as AuthView)
        }
    }, [pathname])

    useEffect(() => {
        if (view != "login") {
            setIsMagicLink(false)
        }
    }, [view])

    return (
        <Card
            className={cn(isPending ? "opacity-0" : null,
                "max-w-md w-full transition-all"
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
                        className={cn(isMagicLink ? "h-0 opacity-0 overflow-hidden" : "mb-4 h-[62px]",
                            "grid gap-2 transition-all"
                        )}
                    >
                        <div className="flex items-center relative">
                            <Label htmlFor="password">
                                {localization.password_label}
                            </Label>

                            <a
                                href="/forgot-password"
                                className={cn(view === "login" && !isMagicLink && !isPending ? "h-6" : "h-0 opacity-0 overflow-hidden",
                                    "absolute right-0 text-sm hover:underline transition-all z-10"
                                )}
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

                    <div
                        className={cn(!errorMessage ? "scale-y-0 h-0" : "mb-4",
                            "overflow-hidden transition-all"
                        )}
                    >
                        <Alert
                            variant="destructive"
                            className="bg-destructive/10"
                        >
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="absolute top-5 right-4 text-foreground"
                                disabled
                            >
                                Resend
                            </Button>

                            <AlertCircle className="h-4 w-4" />

                            <AlertTitle>
                                Error
                            </AlertTitle>

                            <AlertDescription>
                                {errorMessage}
                                asdf
                            </AlertDescription>
                        </Alert>
                    </div>

                    <div className="flex flex-col gap-4">
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

                        {magicLink && !isMagicLink && (
                            <Button
                                type="button"
                                variant="secondary"
                                className="gap-2 w-full"
                                onClick={() => setIsMagicLink(true)}
                            >
                                <MailIcon className="w-4 h-4" />
                                {localization.provider_prefix}
                                {" "}
                                {localization.magic_link_provider}
                            </Button>
                        )}

                        {emailPassword && isMagicLink && (
                            <Button
                                type="button"
                                variant="secondary"
                                className="gap-2 w-full"
                                onClick={() => setIsMagicLink(false)}
                            >
                                <LockIcon className="w-4 h-4" />
                                {localization.provider_prefix}
                                {" "}
                                {localization.password_provider}
                            </Button>
                        )}
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

                        {" "}

                        <LinkComponent
                            href={view == "signup" ?
                                "/auth/login"
                                : "/auth/signup"
                            }
                            className="underline"
                        >
                            <span className="dark:!text-warning text-foreground">
                                {view == "signup" ? localization.login : localization.signup}
                            </span>
                        </LinkComponent>
                    </p>
                </div>
            </CardFooter>
        </Card>
    )
}