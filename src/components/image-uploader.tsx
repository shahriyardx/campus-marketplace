"use client"

import { ImagePlus, Loader2, X } from "lucide-react"
import Image from "next/image"
import { useId, useState } from "react"
import { toast } from "sonner"
import { MAX_LISTING_IMAGES } from "@/lib/constants"
import type { ListingImageInput } from "@/lib/schemas"
import { uploadImage } from "@/lib/upload"
import { cn } from "@/lib/utils"

export function ImageUploader({
  value,
  onChange,
}: {
  value: ListingImageInput[]
  onChange: (images: ListingImageInput[]) => void
}) {
  const inputId = useId()
  const [uploading, setUploading] = useState(false)

  const remaining = MAX_LISTING_IMAGES - value.length

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return

    const selected = Array.from(files).slice(0, remaining)
    if (files.length > remaining) {
      toast.warning(`Only ${MAX_LISTING_IMAGES} photos per listing.`)
    }

    setUploading(true)
    try {
      // Sequential rather than parallel: imgbb rate-limits bursts from one key.
      const uploaded: ListingImageInput[] = []
      for (const file of selected) {
        uploaded.push(await uploadImage(file))
      }
      onChange([...value, ...uploaded])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((image, index) => (
          <div
            key={image.url}
            className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
          >
            <Image
              src={image.thumbUrl ?? image.url}
              alt=""
              fill
              sizes="120px"
              className="object-cover"
            />
            {index === 0 ? (
              <span className="label-caps absolute bottom-1 left-1 rounded-sm bg-background/90 px-1.5 py-1">
                Cover
              </span>
            ) : null}
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() =>
                onChange(value.filter((item) => item.url !== image.url))
              }
              className="absolute top-1 right-1 grid size-6 place-items-center rounded-sm bg-background/90 text-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {remaining > 0 ? (
          <label
            htmlFor={inputId}
            className={cn(
              "grid aspect-square cursor-pointer place-items-center gap-1 rounded-md border border-dashed border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            {uploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="size-5" />
                <span className="label-caps">Add</span>
              </>
            )}
            <input
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              onChange={(event) => {
                handleFiles(event.target.files)
                // Reset so picking the same file twice still fires onChange.
                event.target.value = ""
              }}
            />
          </label>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Up to {MAX_LISTING_IMAGES} photos, 5 MB each. The first one is the
        cover.
      </p>
    </div>
  )
}
