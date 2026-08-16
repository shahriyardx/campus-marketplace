import { NextResponse } from "next/server"
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants"
import { env } from "@/lib/env"
import { getCurrentUser } from "@/lib/session"

type ImgbbResponse = {
  data?: {
    url?: string
    display_url?: string
    delete_url?: string
    thumb?: { url?: string }
  }
  error?: { message?: string }
}

/**
 * Proxies an image to imgbb. It has to be a route handler rather than a tRPC
 * procedure because tRPC would force base64-in-JSON, inflating the payload ~33%.
 */
export async function POST(request: Request) {
  // Without this guard the endpoint is a free open image host for the internet.
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!env.IMGBB_API_KEY) {
    return NextResponse.json(
      { error: "IMGBB_API_KEY is not set on the server" },
      { status: 500 },
    )
  }

  const formData = await request.formData().catch(() => null)
  const file = formData?.get("image")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 })
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WEBP or GIF image" },
      { status: 400 },
    )
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image must be 5 MB or smaller" },
      { status: 400 },
    )
  }

  const upstream = new FormData()
  upstream.append("image", file)

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${env.IMGBB_API_KEY}`,
    { method: "POST", body: upstream },
  )

  const payload = (await response
    .json()
    .catch(() => null)) as ImgbbResponse | null
  const url = payload?.data?.display_url ?? payload?.data?.url

  if (!response.ok || !url) {
    return NextResponse.json(
      { error: payload?.error?.message ?? "Upload failed" },
      { status: 502 },
    )
  }

  return NextResponse.json({
    url,
    thumbUrl: payload?.data?.thumb?.url ?? null,
    // imgbb's delete_url is an HTML page for a human, not a REST endpoint. We
    // keep it for reference but never call it.
    deleteUrl: payload?.data?.delete_url ?? null,
  })
}
