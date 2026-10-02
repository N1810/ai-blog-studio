import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import React from 'react'

export default async function WriterDashboardOverview() {
  const reqHeaders = await headers()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: reqHeaders })

  if (!user) return null

  // Fetch writer's posts
  const posts = await payload.find({
    collection: 'posts',
    where: { writer: { equals: user.id } },
    sort: '-createdAt',
    limit: 100, // For simple overview stats
  })

  const totalPosts = posts.totalDocs
  const drafts = posts.docs.filter((p) => p.editorialStatus === 'draft').length
  const pendingReview = posts.docs.filter((p) => p.editorialStatus === 'pending_review').length
  const changesRequested = posts.docs.filter((p) => p.editorialStatus === 'changes_requested').length
  const published = posts.docs.filter((p) => p._status === 'published').length

  const recentPosts = posts.docs.slice(0, 5)

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Welcome back, {user.displayName || user.email}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
          <p className="text-3xl font-bold text-foreground mt-2">{totalPosts}</p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Drafts</p>
          <p className="text-3xl font-bold text-blue-500 mt-2">{drafts}</p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">In Review</p>
          <p className="text-3xl font-bold text-amber-500 mt-2">{pendingReview}</p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Needs Changes</p>
          <p className="text-3xl font-bold text-destructive mt-2">{changesRequested}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
          <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
          <Link href="/writer/posts" className="text-sm font-medium text-primary hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-border">
          {recentPosts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No posts yet. Start writing!</div>
          ) : (
            recentPosts.map((post) => (
              <div key={post.id} className="p-6 flex justify-between items-center hover:bg-muted/30 transition-colors">
                <div>
                  <h3 className="text-md font-semibold text-foreground">{post.title || 'Untitled Draft'}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Last updated: {new Date(post.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    post._status === 'published' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                    post.editorialStatus === 'draft' ? 'bg-muted text-muted-foreground' :
                    post.editorialStatus === 'changes_requested' ? 'bg-destructive/10 text-destructive' :
                    'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {post._status === 'published' ? 'Published' : post.editorialStatus?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
