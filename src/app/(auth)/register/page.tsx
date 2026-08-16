"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { GoogleButton } from "@/components/google-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  authErrorMessage,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/auth-client"
import { trpc } from "@/trpc/client"

export default function RegisterPage() {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)

  async function run(action: () => Promise<void>) {
    setPending(true)
    try {
      await action()
      await utils.invalidate()
      router.push("/listings")
      router.refresh()
      toast.success("Account ready")
    } catch (error) {
      toast.error(authErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <h1 className="font-display text-4xl">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Free, and no email confirmation to wait for.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          run(() => signUpWithEmail(name, email, password))
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            required
            minLength={2}
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="bg-card"
          />
        </div>

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
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="bg-card"
          />
          <p className="text-xs text-muted-foreground">
            At least 6 characters.
          </p>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
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
        Already registered?{" "}
        <Link
          href="/login"
          className="text-primary underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
