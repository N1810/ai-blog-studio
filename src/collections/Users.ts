import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrSelf } from '../access'
import { registerHandler } from '../endpoints/register'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  endpoints: [
    {
      path: '/register',
      method: 'post',
      handler: registerHandler,
    }
  ],
  fields: [
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'editor', 'writer'],
      defaultValue: 'writer',
      required: true,
      access: {
        update: isAdmin as any,
      },
    },
    {
      name: 'accountStatus',
      type: 'select',
      options: ['active', 'suspended'],
      defaultValue: 'active',
      required: true,
      access: {
        update: isAdmin as any,
      },
    },
    {
      name: 'displayName',
      type: 'text',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  versions: false,
}
