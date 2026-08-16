"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { toast } from "sonner"
import { GoogleButton } from "@/components/google-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  authErrorMessage,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/auth-client"
import { trpc } from "@/trpc/client"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const utils = trpc.useUtils()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)

  const next = searchParams.get("next") ?? "/listings"

  async function afterSignIn() {
    await utils.invalidate()
    router.push(next)
    router.refresh()
  }

  async function run(action: () => Promise<void>) {
    setPending(true)
    try {
      await action()
      await afterSignIn()
      toast.success("Signed in")
    } catch (error) {
      toast.error(authErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <h1 className="font-display text-4xl">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to post items, save favourites and message sellers.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          run(() => signInWithEmail(email, password))
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="bg-card"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="bg-card"
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="label-caps text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton
        label="Continue with Google"
        disabled={pending}
        onClick={() => run(signInWithGoogle)}
      />

      <p className="mt-8 text-sm text-muted-foreground">
        No account yet?{" "}
        <Link
          href="/register"
          className="text-primary underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
