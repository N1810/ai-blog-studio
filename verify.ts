import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config'

async function run() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  console.log('1. Checking original post ID 1 resolving author...')
  const post1 = await payload.findByID({ collection: 'posts', id: 1, depth: 1 })
  if (post1.author && typeof post1.author === 'object' && post1.author.name === 'Neeraj Kumar') {
    console.log('✅ Post 1 resolves original Author successfully')
  } else {
    console.log('❌ Post 1 failed to resolve original author')
  }

  console.log('2. Creating a test writer...')
  // Clean up old test user if exists
  const existingUsers = await payload.find({ collection: 'users', where: { email: { equals: 'testwriter@example.com' } } })
  if (existingUsers.docs.length > 0) {
    await payload.delete({ collection: 'users', id: existingUsers.docs[0].id })
  }

  const writer = await payload.create({
    collection: 'users',
    data: { email: 'testwriter@example.com', password: 'password', role: 'writer', accountStatus: 'active' }
  })
  
  console.log('3. Writer creates a post...')
  const draftPost = await payload.create({
    collection: 'posts',
    data: { title: 'Writer Draft', slug: `writer-draft-${Date.now()}` },
    req: { user: writer } as any
  })

  if (draftPost.writer === writer.id && draftPost.editorialStatus === 'draft') {
    console.log('✅ Writer post created with correct writer ID and draft status')
  } else {
    console.log('❌ Writer post failed to set writer ID or draft status', draftPost)
  }

  console.log('4. Writer attempts to publish (should be blocked by access control/hooks)...')
  try {
    await payload.update({
      collection: 'posts',
      id: draftPost.id,
      data: { editorialStatus: 'published', _status: 'published' } as any,
      req: { user: writer } as any
    })
    // If it succeeded, check if hooks overrode it
    const updatedPost = await payload.findByID({ collection: 'posts', id: draftPost.id })
    if (updatedPost._status === 'published' || (updatedPost as any).editorialStatus === 'published') {
      console.log('❌ Writer successfully published a post (Security flaw)')
    } else {
      console.log('✅ Writer failed to publish post (Hook protected)')
    }
  } catch (err) {
    console.log('✅ Writer failed to publish post (Access denied)')
  }

  process.exit(0)
}
run().catch(console.error)
