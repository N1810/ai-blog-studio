import type { CollectionConfig } from 'payload'

export const ReviewHistory: CollectionConfig = {
  slug: 'review-history',
  admin: {
    useAsTitle: 'action',
  },
  access: {
    read: ({ req }) => {
      const user = req.user as any
      if (user?.role === 'admin' || user?.role === 'editor') return true
      if (user?.role === 'writer') {
        return {
          'post.writer': { equals: user.id }
        }
      }
      return false
    },
    create: () => false, // Only created via server logic
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
    },
    {
      name: 'reviewer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'action',
      type: 'text',
      required: true,
    },
    {
      name: 'comment',
      type: 'textarea',
    },
  ],
}
