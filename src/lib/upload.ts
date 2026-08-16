export type UploadedImage = {
  url: string
  thumbUrl: string | null
  deleteUrl: string | null
}

export async function uploadImage(file: File): Promise<UploadedImage> {
  const body = new FormData()
  body.append("image", file)

  const response = await fetch("/api/upload", { method: "POST", body })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error ?? "Upload failed")
  }

  return payload as UploadedImage
}
