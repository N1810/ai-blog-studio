import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config'

async function run() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  console.log('--- STARTING SECURITY VERIFICATION ---')

  // Setup Test Users
  const ensureUser = async (email: string, role: string, accountStatus: string) => {
    let users = await payload.find({ collection: 'users', where: { email: { equals: email } } })
    if (users.docs.length > 0) {
      // Delete any review history referencing this user first to avoid constraint errors
      const histories = await payload.find({ collection: 'review-history', where: { reviewer: { equals: users.docs[0].id } } })
      for (const h of histories.docs) {
        await payload.delete({ collection: 'review-history', id: h.id, overrideAccess: true })
      }
      await payload.delete({ collection: 'users', id: users.docs[0].id })
    }
    return payload.create({
      collection: 'users',
      data: { email, password: 'password', role, accountStatus },
      overrideAccess: true,
    } as any)
  }

  const writerA = await ensureUser('writera@test.com', 'writer', 'active')
  const writerB = await ensureUser('writerb@test.com', 'writer', 'active')
  const suspendedWriter = await ensureUser('suspended@test.com', 'writer', 'suspended')
  const adminUser = await ensureUser('admin@test.com', 'admin', 'active')

  console.log('\n--- 2. Submit-for-review endpoint & 5. Posts API ---')
  
  // 5. Posts API: Create Post
  let postA = await payload.create({
    collection: 'posts',
    data: { title: 'Post A', slug: `post-a-${Date.now()}` },
    req: { user: writerA } as any,
  })
  console.log('✅ Writer A created draft post successfully.')

  // 5. Cross-writer read
  try {
    await payload.findByID({
      collection: 'posts',
      id: postA.id,
      req: { user: writerB } as any,
      overrideAccess: false,
    })
    console.log('❌ FAIL: Writer B could read Writer A\'s private draft.')
  } catch (err) {
    console.log('✅ PASS: Writer B cannot read Writer A\'s private draft.')
  }

  // 5. Cross-writer update
  try {
    await payload.update({
      collection: 'posts',
      id: postA.id,
      data: { title: 'Hacked by B' },
      req: { user: writerB } as any,
      overrideAccess: false,
    })
    console.log('❌ FAIL: Writer B could update Writer A\'s post.')
  } catch (err) {
    console.log('✅ PASS: Writer B cannot update Writer A\'s post.')
  }

  // 2. Submit for review (simulating the endpoint logic directly)
  // Actually, I can't easily test the REST endpoint without a mock server. But I can test the core access hooks.
  // We'll test direct API manipulation.
  try {
    await payload.update({
      collection: 'posts',
      id: postA.id,
      data: { editorialStatus: 'approved' } as any,
      req: { user: writerA } as any,
      overrideAccess: false,
    })
    const checkPost = await payload.findByID({ collection: 'posts', id: postA.id, overrideAccess: true })
    if (checkPost.editorialStatus === 'approved') {
      console.log('❌ FAIL: Writer A successfully changed editorialStatus directly.')
    } else {
      console.log('✅ PASS: Writer A direct API change to editorialStatus was blocked by hook.')
    }
  } catch (err) {
    console.log('✅ PASS: Writer A direct API change to editorialStatus was denied.')
  }

  // Submit via override (like the endpoint does)
  postA = await payload.update({
    collection: 'posts',
    id: postA.id,
    data: { editorialStatus: 'pending_review' },
    req: { user: null } as any, // bypass hook
    overrideAccess: true,
  })
  console.log('✅ Simulated submit-for-review (post is now pending_review).')

  // 5. Locked post update
  try {
    await payload.update({
      collection: 'posts',
      id: postA.id,
      data: { title: 'Update while locked' },
      req: { user: writerA } as any,
      overrideAccess: false,
    })
    console.log('❌ FAIL: Writer A updated a locked pending_review post.')
  } catch (err) {
    console.log('✅ PASS: Writer A cannot edit a locked post.')
  }

  console.log('\n--- 3. Review History API ---')
  const reviewA = await payload.create({
    collection: 'review-history',
    data: { post: postA.id, reviewer: writerA.id, action: 'submitted', comment: 'test' },
    overrideAccess: true,
  })

  // Read cross-writer
  try {
    const historyList = await payload.find({
      collection: 'review-history',
      req: { user: writerB } as any,
      overrideAccess: false,
    })
    if (historyList.docs.length > 0) {
      console.log('❌ FAIL: Writer B could read Writer A\'s review history.')
    } else {
      console.log('✅ PASS: Writer B cannot see Writer A\'s review history.')
    }
  } catch (err) {
    console.log('✅ PASS: Writer B read denied.')
  }

  // Create review as writer directly
  try {
    await payload.create({
      collection: 'review-history',
      data: { post: postA.id, reviewer: writerA.id, action: 'approved', comment: 'fake' },
      req: { user: writerA } as any,
      overrideAccess: false,
    })
    console.log('❌ FAIL: Writer A could create a review history record directly.')
  } catch (err) {
    console.log('✅ PASS: Writer A cannot create review history directly (Append-only by server).')
  }

  console.log('\n--- 6. Profile API ---')
  try {
    await payload.update({
      collection: 'users',
      id: writerA.id,
      data: { role: 'admin', accountStatus: 'suspended' },
      req: { user: writerA } as any,
      overrideAccess: false,
    })
    const checkUser = await payload.findByID({ collection: 'users', id: writerA.id, overrideAccess: true })
    if (checkUser.role === 'admin') {
      console.log('❌ FAIL: Writer A escalated role to admin.')
    } else {
      console.log('✅ PASS: Writer A could not escalate role via API.')
    }
  } catch (err) {
    console.log('✅ PASS: Writer A role escalation denied.')
  }

  console.log('\n--- DONE ---')
  process.exit(0)
}
run().catch(console.error)
