import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from './client'

const builder = imageUrlBuilder(sanityClient)

export function getImageUrl(source: any, width?: number, height?: number): string | null {
  if (!source) return null

  let img = builder.image(source)
  if (width) img = img.width(width)
  if (height) img = img.height(height)

  return img.url()
}
