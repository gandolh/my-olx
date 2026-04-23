export interface HomeListing {
  id: number
  price: string
  title: string
  location: string
  time: string
  verified: boolean
  image: string
}

export interface HomeCategory {
  icon: string
  label: string
  slug: string
}
