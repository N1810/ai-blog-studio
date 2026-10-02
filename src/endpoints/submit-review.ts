import type { PayloadRequest } from 'payload'

export const submitReviewHandler = async (req: PayloadRequest): Promise<Response> => {
  try {
    const user = req.user as any
    if (!user || user.role !== 'writer') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { id } = req.routeParams as { id?: string }
    if (!id) {
      return new Response(JSON.stringify({ error: 'Post ID is required' }), { status: 400 })
    }

    const payload = req.payload

    // Fetch the post
    const post = await payload.findByID({
      collection: 'posts',
      id,
      depth: 0,
    })

    // Check ownership and current status
    if (post.writer !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden. You do not own this post.' }), { status: 403 })
    }

    if (post.editorialStatus !== 'draft' && post.editorialStatus !== 'changes_requested') {
      return new Response(JSON.stringify({ error: `Cannot submit post in status: ${post.editorialStatus}` }), { status: 400 })
    }

    const root = post.content?.root as any;
    let isEmptyBody = !root || !Array.isArray(root.children) || root.children.length === 0;
    
    if (!isEmptyBody && root.children.length === 1) {
      const firstChild = root.children[0];
      if (firstChild.type === 'paragraph' && (!Array.isArray(firstChild.children) || firstChild.children.length === 0)) {
        isEmptyBody = true;
      }
    }

    if (isEmptyBody) {
      return new Response(JSON.stringify({ error: 'Cannot submit a post with an empty body.' }), { status: 400 })
    }

    // Bypass the hooks by using overrideAccess and direct mutation, since the writer access blocks direct mutation of editorialStatus.
    // Wait, overrideAccess bypasses access control, but hooks still run!
    // Our beforeChange hook resets editorialStatus if user.role === 'writer'.
    // To bypass the hook, we can pass req without user, or set a custom flag.
    const updatedPost = await payload.update({
      collection: 'posts',
      id,
      data: {
        editorialStatus: 'pending_review',
      },
      // Running without req.user ensures the hook (which looks for user.role === 'writer') doesn't block it.
      req: { ...req, user: null } as any, 
      overrideAccess: true,
    })

    // Add entry to review history
    await payload.create({
      collection: 'review-history',
      data: {
        post: id as any,
        reviewer: user.id,
        action: 'submitted',
        comment: 'Writer submitted post for review.',
      },
      req: { ...req, user: null } as any,
      overrideAccess: true,
    })

    return new Response(JSON.stringify({ message: 'Submitted for review', post: updatedPost }), { status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Submission failed' }), { status: 500 })
  }
}
