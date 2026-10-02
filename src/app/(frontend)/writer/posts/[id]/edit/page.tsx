import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { redirect } from 'next/navigation'
import React from 'react'
import WriterEditorWrapper from '../../../components/WriterEditorWrapper'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const reqHeaders = await headers()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: reqHeaders })

  if (!user) redirect('/admin/login')

  const resolvedParams = await params
  const { id } = resolvedParams

  try {
    const post = await payload.findByID({
      collection: 'posts',
      id,
      depth: 0,
    })

    // Strict Server-Side ownership validation
    if (post.writer !== user.id) {
      return (
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Forbidden</h1>
          <p>You do not have permission to edit this post.</p>
        </div>
      )
    }

    if (post.editorialStatus !== 'draft' && post.editorialStatus !== 'changes_requested') {
      return (
        <div className="p-8 text-center text-amber-600 bg-amber-50 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Post Locked</h1>
          <p>This post is currently {post.editorialStatus?.replace('_', ' ')} and cannot be edited.</p>
        </div>
      )
    }

    // Fetch review history if any
    const reviewHistory = await payload.find({
      collection: 'review-history',
      where: { post: { equals: id } },
      sort: '-createdAt',
      depth: 1,
    })

    return (
      <div className="space-y-6">
        <WriterEditorWrapper initialData={post} isNew={false} />
        
        {reviewHistory.docs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Review History & Feedback</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {reviewHistory.docs.map(review => (
                <div key={review.id} className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-gray-900 capitalize">{review.action}</span>
                    <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleString()}</span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8 text-center text-gray-600 bg-gray-50 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
        <p>The requested post could not be found or you don't have access.</p>
      </div>
    )
  }
}
