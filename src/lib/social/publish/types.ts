/** A media item to upload to the destination before publishing. */
export interface PublishMedia {
  filename: string
  contentType: string
  data: Uint8Array
  altText?: string
}

export interface PublishRequest {
  text: string
  media: PublishMedia[]
}

export interface PublishResult {
  postUrn: string
}

/** Swappable destination. LinkedIn today; Facebook/Instagram/Blotato later. */
export interface Publisher {
  publish(req: PublishRequest): Promise<PublishResult>
}
