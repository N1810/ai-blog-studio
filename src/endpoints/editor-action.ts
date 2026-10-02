import type { PayloadRequest } from 'payload'

export const editorActionHandler = async (req: PayloadRequest): Promise<Response> => {
  try {
    const user = req.user as any
    if (!user || (user.role !== 'editor' && user.role !== 'admin')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { id } = req.routeParams as { id?: string }
    if (!id) {
      return new Response(JSON.stringify({ error: 'Post ID is required' }), { status: 400 })
    }

    const body = await (req as any).json()
    const { action, feedback } = body

    if (!['approve', 'request_changes', 'reject'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })
    }

    if ((action === 'request_changes' || action === 'reject') && !feedback) {
      return new Response(JSON.stringify({ error: 'Feedback/reason is required for this action' }), { status: 400 })
    }

    const payload = req.payload

    // Fetch the post using the user's access control (which editors/admins have read access to)
    const post = await payload.findByID({
      collection: 'posts',
      id,
      depth: 0,
      req,
    })

    if (post.editorialStatus !== 'pending_review' && post.editorialStatus !== 'in_review') {
      return new Response(JSON.stringify({ error: `Cannot review post in status: ${post.editorialStatus}` }), { status: 400 })
    }

    let newStatus: any = post.editorialStatus || 'draft';
    let _status = post._status;
    let historyAction = '';

    if (action === 'approve') {
      newStatus = 'approved'
      // Based on typical workflows, "approve" means it's ready for publication or published. 
      // The instructions say "Do not automatically publish unless the existing workflow explicitly defines approval as publication."
      // The current statuses are draft and published. We will leave it as draft, but set editorialStatus to approved.
      historyAction = 'approved'
    } else if (action === 'request_changes') {
      newStatus = 'changes_requested'
      historyAction = 'changes_requested'
    } else if (action === 'reject') {
      newStatus = 'rejected'
      historyAction = 'rejected'
    }

    // Update the post using the current user's session.
    // Editors and Admins have update access to posts in access rules, so we don't need overrideAccess here.
    const updatedPost = await payload.update({
      collection: 'posts',
      id,
      data: {
        editorialStatus: newStatus,
        _status: _status, // Do not change _status unless needed
      },
      req,
    })

    // Add entry to review history
    // ReviewHistory cannot be created by normal API (create: false), so we MUST overrideAccess here.
    await payload.create({
      collection: 'review-history',
      data: {
        post: id as any,
        reviewer: user.id,
        action: historyAction,
        comment: feedback || '',
      },
      req: { ...req, user: null } as any,
      overrideAccess: true, // Only place we bypass rules because ReviewHistory is server-write only
    })

    return new Response(JSON.stringify({ message: 'Review action successful', post: updatedPost }), { status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Action failed' }), { status: 500 })
  }
}
