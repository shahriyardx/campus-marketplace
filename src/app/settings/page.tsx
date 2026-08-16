"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { type ProfileInput, profileInputSchema } from "@/lib/schemas"
import { trpc } from "@/trpc/client"

export default function SettingsPage() {
  const utils = trpc.useUtils()
  const { data: me, isLoading } = trpc.user.me.useQuery()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileInputSchema),
    defaultValues: { name: "", phone: "", campus: "", bio: "", image: "" },
  })

  // The query resolves after first render, so seed the form once it arrives.
  useEffect(() => {
    if (!me) return
    reset({
      name: me.name,
      phone: me.phone ?? "",
      campus: me.campus ?? "",
      bio: me.bio ?? "",
      image: me.image ?? "",
    })
  }, [me, reset])

  const update = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.user.me.invalidate()
      toast.success("Profile saved")
    },
    onError: (error) => toast.error(error.message),
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-5 py-12">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const imageUrl = watch("image")

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <header className="border-b border-border pb-6">
        <h1 className="font-display text-4xl">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Buyers see your name, photo, campus and bio. Your phone number stays
          private — messages go through the site.
        </p>
      </header>

      <form
        className="space-y-6 pt-8"
        onSubmit={handleSubmit((values) => update.mutate(values))}
      >
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={imageUrl || undefined} alt="" />
            <AvatarFallback className="text-lg">
              {me?.name[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Label htmlFor="image">Photo URL</Label>
            <Input
              id="image"
              placeholder="https://…"
              className="bg-card"
              {...register("image")}
            />
            {errors.image ? (
              <p className="text-xs text-destructive">{errors.image.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" className="bg-card" {...register("name")} />
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="campus">Campus or department</Label>
          <Input
            id="campus"
            placeholder="Engineering, North Campus"
            className="bg-card"
            {...register("campus")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (private)</Label>
          <Input id="phone" className="bg-card" {...register("phone")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Short bio</Label>
          <Textarea
            id="bio"
            rows={4}
            placeholder="Third year CS. Mostly selling textbooks I have finished with."
            className="bg-card"
            {...register("bio")}
          />
        </div>

        <div className="border-t border-border pt-6">
          <Button
            type="submit"
            size="lg"
            disabled={update.isPending || !isDirty}
          >
            {update.isPending ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </div>
  )
}
