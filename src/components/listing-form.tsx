"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { ImageUploader } from "@/components/image-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CONDITION_LABELS, CURRENCY, LISTING_CONDITIONS } from "@/lib/constants"
import { type ListingInput, listingInputSchema } from "@/lib/schemas"
import { trpc } from "@/trpc/client"

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}

export function ListingForm({
  listingId,
  defaultValues,
}: {
  listingId?: string
  defaultValues?: Partial<ListingInput>
}) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const { data: categories } = trpc.category.list.useQuery()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ListingInput>({
    resolver: zodResolver(listingInputSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      condition: "GOOD",
      categoryId: "",
      location: "",
      images: [],
      ...defaultValues,
    },
  })

  async function afterSave(id: string) {
    await Promise.all([
      utils.listing.list.invalidate(),
      utils.listing.mine.invalidate(),
      utils.listing.byId.invalidate({ id }),
    ])
    router.push(`/listings/${id}`)
    router.refresh()
  }

  const create = trpc.listing.create.useMutation({
    onSuccess: async ({ id }) => {
      toast.success("Listing posted")
      await afterSave(id)
    },
    onError: (error) => toast.error(error.message),
  })

  const update = trpc.listing.update.useMutation({
    onSuccess: async ({ id }) => {
      toast.success("Listing updated")
      await afterSave(id)
    },
    onError: (error) => toast.error(error.message),
  })

  const pending = isSubmitting || create.isPending || update.isPending

  return (
    <form
      className="space-y-8"
      onSubmit={handleSubmit((values) => {
        if (listingId) update.mutate({ id: listingId, data: values })
        else create.mutate(values)
      })}
    >
      <section className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Fundamentals of Physics, 11th edition"
          className="bg-card"
          {...register("title")}
        />
        <FieldError message={errors.title?.message} />
      </section>

      <section className="space-y-2">
        <Label>Photos</Label>
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <ImageUploader
              value={field.value ?? []}
              onChange={field.onChange}
            />
          )}
        />
        <FieldError message={errors.images?.message} />
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="space-y-2">
          <Label htmlFor="price">Price ({CURRENCY})</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className="bg-card"
            {...register("price", { valueAsNumber: true })}
          />
          <FieldError message={errors.price?.message} />
        </section>

        <section className="space-y-2">
          <Label>Category</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full bg-card">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.categoryId?.message} />
        </section>

        <section className="space-y-2">
          <Label>Condition</Label>
          <Controller
            control={control}
            name="condition"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_CONDITIONS.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {CONDITION_LABELS[condition]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.condition?.message} />
        </section>

        <section className="space-y-2">
          <Label htmlFor="location">Pickup spot (optional)</Label>
          <Input
            id="location"
            placeholder="Library entrance, Block C"
            className="bg-card"
            {...register("location")}
          />
          <FieldError message={errors.location?.message} />
        </section>
      </div>

      <section className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={7}
          placeholder="Edition, condition, what is included, any highlighting or missing pages…"
          className="bg-card"
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </section>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : listingId ? "Save changes" : "Post listing"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
