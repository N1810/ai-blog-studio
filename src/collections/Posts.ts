import type { CollectionConfig } from 'payload'
import { aiGenerateHandler } from '../endpoints/ai-generate'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status'],
    livePreview: {
      url: ({ req, data }) => {
        const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
        return `${serverURL}/api/preview?url=${encodeURIComponent(`/${data?.slug || ''}`)}&secret=${process.env.PAYLOAD_SECRET || ''}`
      },
    },
  },
  endpoints: [
    {
      path: '/ai-generate',
      method: 'post',
      handler: aiGenerateHandler,
    }
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
  },
  access: {
    read: ({ req }) => {
      // If user is logged in, they can read all. Otherwise only published.
      if (req.user) return true
      return {
        _status: {
          equals: 'published',
        },
      }
    },
  },
  fields: [
    {
      name: 'aiAssistant',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/AIAssistantField#AIAssistantField',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Estimated reading time in minutes',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
