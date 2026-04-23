import type { ListingDetail, RelatedListing } from '../types'

export const MOCK_LISTING_DETAIL: ListingDetail = {
  id: '248192301',
  title: 'iPhone 15 Pro, 256GB, Stare Excelentă',
  price: 4200,
  images: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuChARpLwk8AgIysq107TTpwwnrJ1P6pVaMTRjLEV04V_vs3C-kCGnJDVbpwzAzPeDEdo6xmsM7NBkUCoHopBX3uUPs5JQCHFdE1g7eSoVWRWgCQyUowS6r1wz1O-xm4pEkz2FONLjyN11mNLEqRfNcZeQNtYKbODEtqa3l3EEbhyQVJaBUaM8ViBEKIUm66u9eQ8Q0qBpKjJoEZtsCFO-z4kVk2zK8sfmNXt8-jFCMV2HcJvv1Kp2k-qW8p3YChHhKqfzstes-gSvw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDn08NaBdEZHIHpRJ-_3fzVEN0X1zEvz6NL4O9vosx7v5bpZO80S2UHYgbNCxWsWNMhcb47umCwQ5qyUIwXVv4rtgzVeAxr7iPcG55qpyy9CmA4Ch1QGCrVhFleLVBvob-lUsmP8F9Phxr4lIXHpwyq6woxbEFPwm-43Be7wPdOVEMl47nMH8E5izFPr9vkrZzZ5-Ico9_nMyZ_ySdWdC8XG7AqK7N3T1oDpkWo199n8BSTIBCE6sp3A4u8K7i4knnqtMUkEqqe3CI',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDNBxkCaCretplRXFU5JOUQ9lv0PMWnIGEIFqYP-gw65ZT9lCWb0kA5NFqy8rErC283cSlgvahVYv66Qr8bzfQeDqjDQl2V6BsmX-nEG-QppZm-4YwwNEFsiZJ6Xr380IqaTYNggAWdMmbQyD3WKsgcOUXJ9Vh0Yaz0eDO3Zc2ZEd1bnZCfDpaESRZVpzs3SwdVp68ivbAAeHfRvnZ8Ffg2UFXJa3VUvzIs29tgtXI4b9TnJUiljVIaZOWUJ-pKM1tU6ZaCBoxwQmA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuABu_AttRRQc1q9IEgIC0dFVE4rC-O97FqSza9Kz1XMQ4_Er6z072LLZ1wjYZUT_k-iRUrz1tE1rV45cy_RPmWdMEd5UCwp4DfSMnnKm1zcaUoV6cXp9cz0aZCXbQRaNi7z_Shvv0pNXAkWRIzJr9sevf0MEciNzgIKVuHGApNfvFODTWtMm1aaqVo9l6JSHV6DzRc4YXMaJ0i6Z7z-vNSnWZZERaIESqkTVPoavhlLC-tSgP-LysyaPQx76BlflJhP1IGWKh8n-dc',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCNFpJgaPm3aMxUSacWPiyb-CgvuUNK0PbTKESE1RMHCnsK2ZFqFku4eK5kIosh-gB-ODUXukNaEyZREP_waMxRHaLZia0rnLRObB8QjwXSiDciY4-N6z98rUoHzbhIFmee_PYJZqx_AYj_bv92HutOHf0tddj3rXgz0fSvpERd60JZX2i98IQOYLDVjVphRuZSf7OaCRceFPECcl_42GX5Jrwl4kCMvPOSZZthgw0XCyM9Pzog6bzkl6OclhA1NJzLOGP6Dm9RF5I',
  ],
  location: 'București, Sector 1',
  viewCount: 243,
  description:
    'Vând iPhone 15 Pro, varianta de 256GB, culoare Natural Titanium. Telefonul a fost achiziționat acum 4 luni și este într-o stare impecabilă, fără nicio zgârietură sau urmă de uzură.\n\nPachetul este complet: cutie originală, cablu USB-C original nefolosit și factură. A fost ținut mereu în husă și cu folie de protecție din prima zi. Se vinde deoarece am trecut la modelul Pro Max.\n\nAccept orice test în București. Nu sunt interesat de schimburi.',
  features: [
    { icon: 'battery_very_low', label: 'Sănătate Baterie', value: '100% Capacitate' },
    { icon: 'verified_user', label: 'Garanție', value: 'Valabilă până în 2025' },
  ],
  specs: [
    { icon: 'memory', label: 'Procesor', value: 'A17 Pro Bionic' },
    { icon: 'display_settings', label: 'Ecran', value: '6.1" ProMotion' },
    { icon: 'photo_camera', label: 'Camera', value: '48 MP Main' },
    { icon: 'bolt', label: 'Stare', value: 'Ca Nou' },
  ],
  seller: {
    name: 'Alexandru Popescu',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAKDKrHE1h6A8ojXeuYJg4FU-AR44EV781TNy1BrsDtKmZAO6pghcCyaDJp7mdXcV1e_cemWbVP6fUiSB5VvbMM--KzC2esiuKIS53wK4YVZOx-gWg_iH4Q0LaiNJKz_SbIwSR0eqdbS93xi3iG2CuQizM7y98MMNLgsp3E5j0yJohSoarsqhL65WfnFjXjBhWfQlEvwNOK62LOvmIRj-wnqW0lcaRo5Mo5NcA9Q_796NlO_x3XTqpkYd95LNTnxDWJfWBIth0P_nU',
    verified: true,
    memberSince: 'Mai 2021',
    activeListings: 12,
    rating: 4.9,
    reviewCount: 48,
  },
  categorySlug: 'electronice',
  categoryLabel: 'Electronice',
  postedAt: new Date('2024-03-15T10:30:00'),
}

export const MOCK_RELATED_LISTINGS: RelatedListing[] = [
  {
    id: 'r1',
    title: 'iPhone 15 Pro 128GB Blue',
    price: 3900,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDe8CElNY8p486rQ7XPw--NMn3Dat3nfvktB-Z1gxMPqVYgLj_zh1AoltXhqC-CeAVpdFwMEv5aWPCZctpISWonzeu4lxVuqqaRrwbolWZP91i2Ekx44aQWiWjagxDoUhUQI4Omu-kRHL04-pVv7uFoIpYxVRVzoC76SVTQRvkSl7oKGZf4hk4ni6QMxYTXTdpqSZmbxl25m_CnQ1fE2RxcpEtvKhmQhtwaACeZCn6Yv8kdd_kHmr0rtQ2JHmo7mDjnoYbzX1lGWqw',
    location: 'București',
  },
  {
    id: 'r2',
    title: 'iPhone 14 Pro Max Gold 256GB',
    price: 3450,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1OMENYwI2jhYqMDYca55NfxMJ7OOemsdMUc_9hzc13a5GZanx_yCkKrQLs5fgf_SEAEPDnl4BcFSrLEk2n4Byphs_9TeBFDqLSHszoqyhU_4ZV4IFWQZpyekeZEvvMbiLjKZe6zderBtOW6ehh7xegjlYjmHt798Tr9wFdez3_UD94U_K4KBcbDb1_yWzgitJdspNt1SXERSKirMatfF2EkJjiVaZbSyvgjuGexz5IbL09BSgj29nQ5uMWyeBUDHpDqQtNYVps_s',
    location: 'Cluj-Napoca',
  },
  {
    id: 'r3',
    title: 'iPhone 13 Pro Green Like New',
    price: 2400,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBw7k4UxviDahqeuNfsFQ61bqWD3p11Ggo9pqx6BFhRcYrLjufr54UzWAVcERdKfDwIcH0l-8Ep4D5W5aeG0VcGD9yMqD_ImvdfPOPFLYH_QnisxrVy9JOyOCMjHVHdeAP8eE7Ka5KSM9owJedhri6cT79o1HLN-iCiR1lsGg-yim85SoDZtg-S3DzYOTyaLNVJXT4pQvYNn5ibtqBxwqttxrnpBAGk423Pbz1JiMRYFz3yQs3_3i9HBdLHET9ze_NK4AdLSrucadM',
    location: 'Iași',
  },
  {
    id: 'r4',
    title: 'iPhone 15 128GB Black Sigilat',
    price: 3100,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDvxXdWAmfLdYSbxVqkrnK5i5vuo4iLfgImdQaXsgZBYq7ht20Zt4MDuYLrJPTmSn1tpLTWuZ5li1fMC41MGiDC8moFgXJUCP7Span8xtezJurFAHYx4K5xILeYsJL4XpGJGqTcsp0keqD7q_Q6jXT0vkQUh-SvcQD6_SWrWec5ia2U2JeqUPz1S1txkBGRmTk1UVV0SjXacYV2mt5FlDByK2apjZjgMgLefusDU5N_mytzfpn9m4v39C2MtGA6Za9fmPiezuYkWkFg',
    location: 'Timișoara',
  },
]

export function fetchMockListingDetail(_id: string): Promise<ListingDetail> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_LISTING_DETAIL), 400)
  })
}
