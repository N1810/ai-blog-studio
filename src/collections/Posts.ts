import type { CollectionConfig } from 'payload'
import { submitReviewHandler } from '../endpoints/submit-review'
import { aiGenerateHandler } from '../endpoints/ai-generate'
import { revalidatePath } from 'next/cache'
import { isAdmin, isAdminOrEditor } from '../access'

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
    },
    {
      path: '/:id/submit',
      method: 'post',
      handler: submitReviewHandler as any,
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
      const user = req.user as any
      if (user?.role === 'admin' || user?.role === 'editor') return true
      if (user?.role === 'writer') {
        return {
          or: [
            { _status: { equals: 'published' } },
            { writer: { equals: user.id } },
          ],
        } as any
      }
      return { _status: { equals: 'published' } } as any
    },
    create: ({ req }: any) => {
      const user = req.user as any
      return user && user.accountStatus === 'active'
    },
    update: ({ req }: any) => {
      const user = req.user as any
      if (user?.role === 'admin' || user?.role === 'editor') return true
      if (user?.role === 'writer' && user.accountStatus === 'active') {
        return {
          and: [
            { writer: { equals: user.id } },
            { editorialStatus: { in: ['draft', 'changes_requested', null] } },
          ],
        } as any
      }
      return false
    },
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ req, operation, data, originalDoc }) => {
        const user = req.user as any
        if (user?.role === 'writer') {
          if (operation === 'create') {
            data.writer = user.id
            data.editorialStatus = 'draft'
          } else if (operation === 'update' && originalDoc) {
            data.writer = originalDoc.writer
            data.editorialStatus = originalDoc.editorialStatus
            // Prevent publishing via direct _status mutation
            if (data._status === 'published') {
              data._status = 'draft'
            }
          }
          
          if (typeof data._markdown === 'string') {
            const { markdownToLexical } = await import('../utils/markdownToLexical')
            data.content = markdownToLexical(data._markdown)
          }
        }
        return data
      },
    ],
    afterChange: [
      ({ doc }) => {
        if (doc._status === 'published') {
          try {
            revalidatePath(`/${doc.slug}`)
            revalidatePath('/blog')
          } catch (e) {
            // Ignore in standalone node environments (like tests)
          }
        }
        return doc
      }
    ]
  },
  fields: [
    {
      name: 'writer',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
      access: {
        update: isAdminOrEditor as any,
      },
    },
    {
      name: 'editorialStatus',
      type: 'select',
      options: ['draft', 'pending_review', 'in_review', 'changes_requested', 'approved', 'rejected'],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
      access: {
        update: isAdminOrEditor as any,
      },
    },
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
      name: '_markdown',
      type: 'textarea',
      admin: {
        hidden: true,
      },
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
