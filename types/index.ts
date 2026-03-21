export interface Creator {
  id: string
  name: string
  handle: string
  category: string
  followers: number
  engagement: number
  price: number
  emoji: string
  bio: string
  tags: string[]
  available: boolean
  packages: Package[]
  created_at: string
}

export interface Package {
  name: string
  price: number
  deliverables: string[]
  turnaround: string
}

export interface HiringRequest {
  id: string
  creator_id: string
  client_email: string
  client_name: string
  package_name: string
  package_price: number
  brief: string
  status: 'pendiente' | 'negociacion' | 'cerrado'
  created_at: string
  ugc_creators?: Creator
}

export interface Profile {
  id: string
  role: 'admin' | 'cliente'
  full_name: string | null
  company: string | null
  created_at: string
}
