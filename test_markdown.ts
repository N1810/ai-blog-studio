import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config'
import { submitReviewHandler } from './src/endpoints/submit-review'

async function run() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  console.log('--- STARTING MARKDOWN & BODY VERIFICATION ---')

  const ensureUser = async (email: string, role: string, accountStatus: string) => {
    let users = await payload.find({ collection: 'users', where: { email: { equals: email } } })
    if (users.docs.length > 0) {
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

  const writerA = await ensureUser('mdwriter@test.com', 'writer', 'active')

  // 1. Create a draft with body content
  const markdownText = `
# My Big Heading

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

> A quote block

[Safe Link](https://google.com) and [Unsafe Link](javascript:alert('XSS'))
`
  let post = await payload.create({
    collection: 'posts',
    data: {
      title: 'Markdown Test Post',
      slug: `md-test-${Date.now()}`,
      _markdown: markdownText,
    } as any, // bypassing strict types for virtual fields
    req: { user: writerA } as any,
  })

  // Verify conversion
  const root = post.content?.root
  if (root && root.children.length > 0) {
    console.log('✅ PASS: Markdown correctly converted to Lexical JSON.')
  } else {
    console.log('❌ FAIL: Markdown was not converted to Lexical JSON.')
  }

  // Find the unsafe link
  const linkText = JSON.stringify(post.content)
  if (linkText.includes('javascript:alert')) {
    console.log('❌ FAIL: Unsafe javascript: URL was not sanitized.')
  } else {
    console.log('✅ PASS: Unsafe javascript: URL was sanitized out.')
  }

  // 2. Test empty body rejection
  let emptyPost = await payload.create({
    collection: 'posts',
    data: {
      title: 'Empty Test Post',
      slug: `empty-test-${Date.now()}`,
      _markdown: '   ',
    } as any,
    req: { user: writerA } as any,
  })

  try {
    const res = await submitReviewHandler({
      user: writerA,
      routeParams: { id: emptyPost.id },
      payload,
    } as any)
    if (res.status === 400) {
      const body = await res.json()
      if (body.error.includes('empty body')) {
        console.log('✅ PASS: Rejected empty body submission.')
      } else {
        console.log('❌ FAIL: Rejected for wrong reason:', body)
      }
    } else {
      console.log('❌ FAIL: Allowed submission of empty post. Status:', res.status)
      console.log('Empty post content:', JSON.stringify(emptyPost.content))
    }
  } catch (err: any) {
    console.log('❌ FAIL: Endpoint crashed during empty check', err)
  }

  // 3. Test submitting the valid post
  try {
    const res = await submitReviewHandler({
      user: writerA,
      routeParams: { id: post.id },
      payload,
    } as any)
    if (res.status === 200) {
      console.log('✅ PASS: Allowed submission of valid post with body.')
    } else {
      console.log('❌ FAIL: Failed to submit valid post. Status:', res.status, await res.json())
    }
  } catch (err: any) {
    console.log('❌ FAIL: Failed to submit valid post.', err)
  }

  // 4. Test preservation of existing published posts
  const publishedPost = await payload.findByID({
    collection: 'posts',
    id: 1, // Assume post ID 1 exists as from earlier requirements
    overrideAccess: true,
  })
  
  if (publishedPost) {
    const origAuthor = publishedPost.author
    // Update it with just a new title to simulate metadata-only update
    const updatedPub = await payload.update({
      collection: 'posts',
      id: publishedPost.id,
      data: { title: publishedPost.title + ' Updated' },
      overrideAccess: true,
    })
    if ((typeof updatedPub.author === 'object' ? updatedPub.author?.id === (typeof origAuthor === 'object' ? origAuthor?.id : origAuthor) : updatedPub.author === origAuthor) && (updatedPub.content?.root?.children?.length ?? 0) > 0) {
      console.log('✅ PASS: Preserved existing published post author and content upon metadata update.')
    } else {
      console.log('❌ FAIL: Modified author or wiped content of existing post.')
      console.log('origAuthor:', origAuthor)
      console.log('updatedPub.author:', updatedPub.author)
      console.log('updatedPub.content:', JSON.stringify(updatedPub.content))
    }
  }

  console.log('\n--- DONE ---')
  process.exit(0)
}
run().catch(console.error)
