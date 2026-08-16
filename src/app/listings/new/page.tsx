"use client"

import { ListingForm } from "@/components/listing-form"

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <header className="border-b border-border pb-6">
        <p className="label-caps text-primary">New listing</p>
        <h1 className="mt-3 font-display text-4xl">Post an item</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Buyers message you here. No payment goes through this site.
        </p>
      </header>

      <div className="pt-8">
        <ListingForm />
      </div>
    </div>
  )
}
