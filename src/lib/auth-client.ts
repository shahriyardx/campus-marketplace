"use client"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth"
import { firebaseAuth, googleProvider } from "./firebase/client"

/**
 * Trades the Firebase ID token for our httpOnly session cookie. Every sign-in
 * path ends here - the cookie, not the Firebase client state, is what the
 * server trusts.
 */
async function createServerSession(idToken: string, name?: string) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, name }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? "Could not start a session")
  }
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
) {
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  )
  await updateProfile(credential.user, { displayName: name })
  // No verification email is sent and emailVerified is never checked, by design.
  await createServerSession(await credential.user.getIdToken(true), name)
}

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  )
  await createServerSession(await credential.user.getIdToken())
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(firebaseAuth, googleProvider)
  await createServerSession(
    await credential.user.getIdToken(),
    credential.user.displayName ?? undefined,
  )
}

export async function signOutUser() {
  await fetch("/api/auth/session", { method: "DELETE" })
  await signOut(firebaseAuth)
}

/** Turns Firebase's error codes into something a student can act on. */
export function authErrorMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: unknown }).code)
      : ""

  switch (code) {
    case "auth/email-already-in-use":
      return "That email already has an account. Try signing in."
    case "auth/invalid-email":
      return "That email address does not look right."
    case "auth/weak-password":
      return "Password must be at least 6 characters."
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Wrong email or password."
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in window was closed."
    case "auth/too-many-requests":
      return "Too many attempts. Wait a minute and try again."
    default:
      return error instanceof Error ? error.message : "Something went wrong."
  }
}
