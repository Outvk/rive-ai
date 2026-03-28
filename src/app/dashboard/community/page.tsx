import { Metadata } from 'next'
import { CommunityClient } from './CommunityClient'

export const metadata: Metadata = {
  title: "Community & Explore",
  description: "Browse thousands of AI-generated images, videos, 3D models and audio from the Rive AI community.",
}

export default function CommunityPage() {
  return <CommunityClient />
}
