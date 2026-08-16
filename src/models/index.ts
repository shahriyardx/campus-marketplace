// Importing from this barrel guarantees every model is registered before a
// populate() runs. Mongoose throws MissingSchemaError otherwise.
//
// There is no Category model: categories are hardcoded in lib/constants.ts and
// stored on a listing as a slug string.
export { Conversation, type ConversationDoc } from "./conversation"
export { Favorite, type FavoriteDoc } from "./favorite"
export { Listing, type ListingDoc } from "./listing"
export { Message, type MessageDoc } from "./message"
export { User, type UserDoc } from "./user"
