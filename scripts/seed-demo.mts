import mongoose from "mongoose"

/**
 * Fills the database with demo listings, favourites and message threads so the
 * app looks lived-in for screenshots and marking.
 *
 * Run:   bun run db:demo
 * Undo:  bun run db:demo:reset
 *
 * Every document this creates is traceable to a user whose `uid` starts with
 * DEMO_PREFIX, so a re-run wipes only its own output. Real accounts, their
 * listings and their favourites are never touched — except that demo buyers do
 * open message threads on real users' listings, which is the point: it gives
 * you an inbox to demo. The reset removes those threads too.
 *
 * Runs under node rather than bun (bun's node:v8 shim is incomplete and bson
 * fails to load), and writes to collections directly so it does not need the
 * app's `@/` path aliases.
 */

const DEMO_PREFIX = "demo:"

// Deterministic PRNG (mulberry32): re-running produces the same catalogue, so
// screenshots stay stable and diffs stay reviewable.
function makeRandom(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = makeRandom(20260817)

const pick = <T,>(items: readonly T[]): T =>
  items[Math.floor(rand() * items.length)]

const int = (min: number, max: number) =>
  min + Math.floor(rand() * (max - min + 1))

const chance = (probability: number) => rand() < probability

const PEOPLE = [
  { name: "Nusrat Jahan", campus: "Computer Science, North Campus" },
  { name: "Tanvir Ahmed", campus: "Electrical Engineering, Block C" },
  { name: "Sadia Rahman", campus: "Pharmacy, Health Sciences" },
  { name: "Rakibul Hasan", campus: "Civil Engineering, South Campus" },
  { name: "Mehjabin Chowdhury", campus: "Business Administration" },
  { name: "Arif Mahmud", campus: "Mechanical Engineering, Block A" },
  { name: "Farhana Islam", campus: "Biochemistry, Health Sciences" },
  { name: "Shakib Al Amin", campus: "Computer Science, North Campus" },
  { name: "Tasnim Akter", campus: "Architecture, Studio Building" },
  { name: "Imran Kabir", campus: "Physics, Science Faculty" },
  { name: "Rumana Parvin", campus: "Statistics, Science Faculty" },
  { name: "Zahid Hossain", campus: "Economics, Social Sciences" },
]

const BIOS = [
  "Final year. Clearing out everything I have finished with.",
  "Third year CS. I keep my books in good shape.",
  "Selling my sister's old course material too, message me.",
  "Usually free between classes, easy to meet near the library.",
  "Happy to hold something for a day if you are sure.",
  null,
  null,
]

const PICKUPS = [
  "Central library entrance",
  "Block C canteen",
  "Main gate, after 4pm",
  "Science faculty lobby",
  "Student union building",
  "Near the bus stop",
  null,
]

type Item = { title: string; price: [number, number]; blurb: string }

const CATALOGUE: Record<string, Item[]> = {
  textbooks: [
    {
      title: "Fundamentals of Physics — Halliday & Resnick, 11th ed.",
      price: [900, 1800],
      blurb:
        "Covers the full first-year physics sequence. Binding is tight, no loose pages.",
    },
    {
      title: "Introduction to Algorithms (CLRS), 4th edition",
      price: [1800, 3200],
      blurb:
        "The big one. Used it for two semesters of algorithms and never wrote in it.",
    },
    {
      title: "Organic Chemistry — Clayden, 2nd edition",
      price: [1400, 2400],
      blurb:
        "Mechanisms chapters are highlighted, everything else is clean. No missing pages.",
    },
    {
      title: "Calculus: Early Transcendentals — Stewart",
      price: [700, 1500],
      blurb:
        "Standard first-year calculus text. Cover has shelf wear, inside is fine.",
    },
    {
      title: "Engineering Mechanics: Statics — Hibbeler",
      price: [600, 1300],
      blurb:
        "Worked through about half the problem sets in pencil, all erased.",
    },
    {
      title: "Principles of Economics — Mankiw",
      price: [500, 1100],
      blurb: "First year econ. Light highlighting in the first four chapters.",
    },
    {
      title: "Molecular Biology of the Cell — Alberts",
      price: [1600, 2800],
      blurb:
        "Heavy book, excellent condition. Selling because I switched track.",
    },
    {
      title: "Digital Design — Morris Mano, 5th edition",
      price: [600, 1200],
      blurb:
        "Logic design course text. Some pencil notes in the K-map chapter.",
    },
    {
      title: "Concepts of Programming Languages — Sebesta",
      price: [500, 1000],
      blurb:
        "Barely opened, honestly. Bought it and then the course dropped it.",
    },
    {
      title: "Structural Analysis — Hibbeler, 10th ed.",
      price: [800, 1600],
      blurb:
        "Civil core text. Corner of the back cover is bent, otherwise solid.",
    },
    {
      title: "Financial Accounting — Weygandt",
      price: [450, 950],
      blurb: "Comes with the practice workbook, unused.",
    },
    {
      title: "Griffiths — Introduction to Electrodynamics",
      price: [900, 1700],
      blurb:
        "Clean copy. A classic, and much cheaper than the campus bookshop.",
    },
  ],
  calculators: [
    {
      title: "Casio fx-991EX ClassWiz scientific calculator",
      price: [1400, 2200],
      blurb: "Exam-approved, works perfectly. Includes the slide cover.",
    },
    {
      title: "Casio fx-991ES Plus (2nd edition)",
      price: [900, 1600],
      blurb:
        "Used it for two years of engineering maths. Battery still original.",
    },
    {
      title: "Texas Instruments TI-84 Plus CE",
      price: [4500, 7500],
      blurb: "Colour screen, charging cable included. Screen has no scratches.",
    },
    {
      title: "Casio FC-200V financial calculator",
      price: [1800, 3000],
      blurb: "For finance and accounting courses. Barely used, box included.",
    },
    {
      title: "Sharp EL-W535 scientific calculator",
      price: [700, 1300],
      blurb: "Backup calculator, works fine. Slight scuff on the back.",
    },
    {
      title: "Casio fx-100MS scientific calculator",
      price: [500, 900],
      blurb: "Entry level, does everything a first-year needs.",
    },
  ],
  electronics: [
    {
      title: "Lenovo ThinkPad T480 — i5, 16GB RAM, 256GB SSD",
      price: [26000, 38000],
      blurb:
        "Battery holds about four hours. Keyboard is excellent, ideal for note-taking.",
    },
    {
      title: "Logitech MX Master 3 mouse",
      price: [4500, 7000],
      blurb: "Dongle and cable included. Grip has very light shine from use.",
    },
    {
      title: "Arduino Uno R3 starter kit",
      price: [1800, 3200],
      blurb:
        "Board, breadboard, jumpers, sensors, servo. Everything in the box.",
    },
    {
      title: "Raspberry Pi 4 (4GB) with case and PSU",
      price: [6500, 9500],
      blurb: "Ran a home server on it. Includes 32GB SD card.",
    },
    {
      title: "Sony WH-CH720N noise cancelling headphones",
      price: [7000, 11000],
      blurb: "Great for the library. Earpads clean, comes with the pouch.",
    },
    {
      title: "Portable 128GB SSD, USB-C",
      price: [3500, 5500],
      blurb: "Fast enough for project files and VMs. Barely any hours on it.",
    },
    {
      title: "Wacom Intuos S drawing tablet",
      price: [4000, 6500],
      blurb:
        "Used it for architecture sketches. Pen and two spare nibs included.",
    },
    {
      title: "Anker 20000mAh power bank",
      price: [1800, 2800],
      blurb: "Survives a full day of classes. Charges two devices at once.",
    },
  ],
  "lab-equipment": [
    {
      title: "White lab coat, size M — chemistry approved",
      price: [400, 900],
      blurb: "Washed and pressed. No stains or burns, all buttons intact.",
    },
    {
      title: "Dissection kit, stainless steel, 14 pieces",
      price: [500, 1100],
      blurb: "Used one semester of biology. Sharpened and cleaned.",
    },
    {
      title: "Digital vernier caliper, 0-150mm",
      price: [700, 1500],
      blurb: "Accurate to 0.01mm. Battery replaced last month.",
    },
    {
      title: "Safety goggles and nitrile glove box",
      price: [200, 500],
      blurb: "Goggles are anti-fog. Glove box is about two thirds full.",
    },
    {
      title: "Student microscope slides set, prepared",
      price: [600, 1400],
      blurb: "Fifty prepared slides in a wooden case. Nothing cracked.",
    },
    {
      title: "Borosilicate glassware set — beakers and flasks",
      price: [900, 2000],
      blurb:
        "Three beakers, two conical flasks, one measuring cylinder. No chips.",
    },
    {
      title: "Engineering drawing set with compass",
      price: [300, 700],
      blurb: "Full set in the original tin. Compass holds its angle properly.",
    },
  ],
  stationery: [
    {
      title: "Rotring 600 mechanical pencil, 0.5mm",
      price: [900, 1600],
      blurb: "The good metal one. Comes with a tube of spare leads.",
    },
    {
      title: "A3 drawing board with parallel rule",
      price: [1200, 2400],
      blurb: "Architecture studio standard. Surface is unmarked.",
    },
    {
      title: "Pack of 10 unused A4 notebooks",
      price: [400, 800],
      blurb: "Bought in bulk and overestimated badly. Still shrink-wrapped.",
    },
    {
      title: "Staedtler technical pen set (0.1–0.8)",
      price: [700, 1400],
      blurb: "Four pens, all flowing. Used for one drafting course.",
    },
    {
      title: "Scientific graph paper pads, A4, pack of 5",
      price: [150, 400],
      blurb: "Two pads opened, three untouched.",
    },
    {
      title: "Highlighter and fineliner bundle",
      price: [100, 350],
      blurb: "Mixed colours, all still write. Good for exam season.",
    },
  ],
  "notes-and-guides": [
    {
      title: "Handwritten Data Structures notes — full semester",
      price: [200, 500],
      blurb:
        "Every lecture, diagrams included. Got an A in the course using these.",
    },
    {
      title: "Thermodynamics summary sheets and solved problems",
      price: [150, 400],
      blurb: "Condensed to twenty pages. Covers the whole syllabus.",
    },
    {
      title: "Organic chemistry reaction map (laminated)",
      price: [200, 450],
      blurb: "One A2 sheet with every mechanism. Saved me in finals.",
    },
    {
      title: "Past exam papers with worked answers, 2019–2024",
      price: [250, 600],
      blurb: "Printed and bound. Answers checked against the marking scheme.",
    },
    {
      title: "Linear algebra revision guide, annotated",
      price: [150, 350],
      blurb: "My own notes in the margins where the book was unclear.",
    },
  ],
  other: [
    {
      title: "Study desk lamp with adjustable arm",
      price: [600, 1400],
      blurb: "Warm and cool modes. No flicker, easy on the eyes at night.",
    },
    {
      title: "Backpack with padded laptop sleeve, 25L",
      price: [1200, 2500],
      blurb: "Fits a 15 inch laptop. All zips work, no tears.",
    },
    {
      title: "Ergonomic laptop stand, aluminium",
      price: [800, 1800],
      blurb: "Folds flat. Fixed my neck pain during thesis writing.",
    },
    {
      title: "Bicycle lock, hardened steel",
      price: [400, 900],
      blurb: "Two keys included. Selling because I graduated.",
    },
    {
      title: "Insulated water bottle, 1L",
      price: [300, 700],
      blurb: "Keeps water cold through a full day of labs.",
    },
  ],
}

const CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "GOOD", "GOOD", "FAIR"] as const

const OPENERS = [
  "Hi! Is this still available?",
  "Hello, is it still up for sale?",
  "Hey, would you take a bit less for this?",
  "Is this still available? I need it for next semester.",
  "Hi, could you tell me what condition the cover is in?",
]

const REPLIES = [
  "Yes, still available. When are you free to meet?",
  "It is! I am on campus most afternoons.",
  "Still here. I could do a small discount if you collect today.",
  "Yes — happy to meet near the library if that works for you.",
]

const FOLLOW_UPS = [
  "Tomorrow after 3 works for me.",
  "Could we do Thursday instead? I have labs until late tomorrow.",
  "Great, I will take it. See you at the main gate.",
  "Perfect. Do you take bkash or cash only?",
]

const now = Date.now()
const DAY = 24 * 60 * 60 * 1000
const daysAgo = (days: number) => new Date(now - days * DAY)

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is not set")

  const resetOnly = process.argv.includes("--reset")

  await mongoose.connect(uri)
  const db = mongoose.connection

  const users = db.collection("users")
  const listings = db.collection("listings")
  const favorites = db.collection("favorites")
  const conversations = db.collection("conversations")
  const messages = db.collection("messages")

  // --- wipe anything a previous run created -------------------------------
  const oldDemoUsers = await users
    .find({ uid: { $regex: `^${DEMO_PREFIX}` } })
    .project({ _id: 1 })
    .toArray()
  const oldIds = oldDemoUsers.map((user) => user._id)

  if (oldIds.length) {
    const oldListings = await listings
      .find({ seller: { $in: oldIds } })
      .project({ _id: 1 })
      .toArray()
    const oldListingIds = oldListings.map((listing) => listing._id)

    // Demo buyers also message real sellers, so match on either side.
    const oldConversations = await conversations
      .find({
        $or: [
          { buyer: { $in: oldIds } },
          { seller: { $in: oldIds } },
          { listing: { $in: oldListingIds } },
        ],
      })
      .project({ _id: 1 })
      .toArray()
    const oldConversationIds = oldConversations.map((row) => row._id)

    const removed = await Promise.all([
      messages.deleteMany({ conversation: { $in: oldConversationIds } }),
      conversations.deleteMany({ _id: { $in: oldConversationIds } }),
      favorites.deleteMany({
        $or: [{ user: { $in: oldIds } }, { listing: { $in: oldListingIds } }],
      }),
      listings.deleteMany({ _id: { $in: oldListingIds } }),
      users.deleteMany({ _id: { $in: oldIds } }),
    ])

    console.log(
      `Cleared previous demo data: ${removed[4].deletedCount} users, ` +
        `${removed[3].deletedCount} listings, ${removed[2].deletedCount} favourites, ` +
        `${removed[1].deletedCount} threads, ${removed[0].deletedCount} messages.`,
    )
  } else {
    console.log("No previous demo data found.")
  }

  if (resetOnly) {
    await mongoose.disconnect()
    return
  }

  // --- users ---------------------------------------------------------------
  const userDocs = PEOPLE.map((person, index) => ({
    _id: new mongoose.Types.ObjectId(),
    uid: `${DEMO_PREFIX}${index + 1}`,
    email: `${person.name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.edu`,
    name: person.name,
    // Deterministic avatar per person.
    image: `https://picsum.photos/seed/avatar-${index + 1}/200/200`,
    phone: null,
    campus: person.campus,
    bio: pick(BIOS),
    createdAt: daysAgo(int(120, 400)),
    updatedAt: daysAgo(int(1, 30)),
  }))
  await users.insertMany(userDocs)

  // --- listings ------------------------------------------------------------
  const listingDocs: Record<string, unknown>[] = []
  let imageSeed = 0

  // Categories are hardcoded in src/lib/constants.ts, so the slug below is
  // written straight onto the listing - there is nothing to look up.
  for (const [slug, items] of Object.entries(CATALOGUE)) {
    for (const item of items) {
      const seller = pick(userDocs)
      const created = daysAgo(int(0, 55))

      // Most things are still for sale; a few sold ones make the status
      // filters and the dashboard controls worth looking at.
      const status = chance(0.12)
        ? "SOLD"
        : chance(0.09)
          ? "RESERVED"
          : "AVAILABLE"

      const images = Array.from({ length: int(1, 3) }, () => {
        imageSeed += 1
        return {
          url: `https://picsum.photos/seed/cm${imageSeed}/900/675`,
          thumbUrl: `https://picsum.photos/seed/cm${imageSeed}/300/225`,
          deleteUrl: null,
        }
      })

      listingDocs.push({
        _id: new mongoose.Types.ObjectId(),
        title: item.title,
        description: `${item.blurb}\n\nCollection on campus. Message me here and we can sort out a time — payment in person, cash or transfer.`,
        // Round to something a person would actually ask for.
        price: Math.round(int(item.price[0], item.price[1]) / 50) * 50,
        condition: pick(CONDITIONS),
        status,
        location: pick(PICKUPS),
        category: slug,
        seller: seller._id,
        images,
        createdAt: created,
        updatedAt: created,
      })
    }
  }
  await listings.insertMany(listingDocs)

  // --- favourites ----------------------------------------------------------
  // Real accounts get favourites too, so /favorites is not empty on a demo.
  const realUsers = await users
    .find({ uid: { $not: { $regex: `^${DEMO_PREFIX}` } } })
    .project({ _id: 1 })
    .toArray()
  const allUsers = [...userDocs, ...realUsers]

  const favoriteDocs: Record<string, unknown>[] = []
  const seenFavorites = new Set<string>()

  for (const user of allUsers) {
    for (let i = 0; i < int(2, 7); i += 1) {
      const listing = pick(listingDocs)
      // The unique index on { user, listing } would reject a repeat.
      const key = `${user._id}-${listing._id}`
      if (seenFavorites.has(key)) continue
      seenFavorites.add(key)

      favoriteDocs.push({
        _id: new mongoose.Types.ObjectId(),
        user: user._id,
        listing: listing._id,
        createdAt: daysAgo(int(0, 30)),
        updatedAt: daysAgo(int(0, 30)),
      })
    }
  }
  if (favoriteDocs.length) await favorites.insertMany(favoriteDocs)

  // --- conversations and messages -----------------------------------------
  const conversationDocs: Record<string, unknown>[] = []
  const messageDocs: Record<string, unknown>[] = []
  const seenThreads = new Set<string>()

  function startThread(
    listing: Record<string, unknown>,
    buyerId: mongoose.Types.ObjectId,
  ) {
    const sellerId = listing.seller as mongoose.Types.ObjectId
    if (String(sellerId) === String(buyerId)) return

    // Mirrors the unique index on { listing, buyer }.
    const key = `${listing._id}-${buyerId}`
    if (seenThreads.has(key)) return
    seenThreads.add(key)

    const conversationId = new mongoose.Types.ObjectId()
    const startedDays = int(0, 20)
    let cursor = daysAgo(startedDays).getTime()

    const script: { from: mongoose.Types.ObjectId; body: string }[] = [
      { from: buyerId, body: pick(OPENERS) },
    ]
    if (chance(0.85)) script.push({ from: sellerId, body: pick(REPLIES) })
    if (chance(0.6)) script.push({ from: buyerId, body: pick(FOLLOW_UPS) })

    for (const line of script) {
      cursor += int(20, 600) * 60 * 1000
      messageDocs.push({
        _id: new mongoose.Types.ObjectId(),
        conversation: conversationId,
        sender: line.from,
        body: line.body,
        // Leave the last inbound message unread often enough that the navbar
        // badge and the inbox unread counts actually show something.
        readAt: chance(0.5) ? new Date(cursor + 60_000) : null,
        createdAt: new Date(cursor),
        updatedAt: new Date(cursor),
      })
    }

    conversationDocs.push({
      _id: conversationId,
      listing: listing._id,
      buyer: buyerId,
      seller: sellerId,
      lastMessageAt: new Date(cursor),
      createdAt: daysAgo(startedDays),
      updatedAt: new Date(cursor),
    })
  }

  // Demo buyers talking to demo sellers.
  for (let i = 0; i < 30; i += 1) {
    startThread(pick(listingDocs), pick(userDocs)._id)
  }

  // Demo buyers talking to the real accounts, both about demo listings (so the
  // real user sees them as a buyer) and about any listings the real user owns.
  for (const realUser of realUsers) {
    for (let i = 0; i < 4; i += 1) {
      startThread(pick(listingDocs), realUser._id)
    }

    const realListings = await listings
      .find({ seller: realUser._id })
      .project({ _id: 1, seller: 1 })
      .toArray()
    for (const listing of realListings) {
      for (let i = 0; i < int(1, 3); i += 1) {
        startThread(listing, pick(userDocs)._id)
      }
    }
  }

  if (conversationDocs.length) await conversations.insertMany(conversationDocs)
  if (messageDocs.length) await messages.insertMany(messageDocs)

  console.log(
    [
      "",
      "Demo data inserted:",
      `  users          ${userDocs.length}`,
      `  listings       ${listingDocs.length}`,
      `  favourites     ${favoriteDocs.length}`,
      `  conversations  ${conversationDocs.length}`,
      `  messages       ${messageDocs.length}`,
      "",
      `Real accounts left in place: ${realUsers.length}`,
      "Undo with: bun run db:demo:reset",
    ].join("\n"),
  )

  await mongoose.disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
