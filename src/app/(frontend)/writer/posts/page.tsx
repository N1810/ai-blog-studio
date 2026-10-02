import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import React from 'react'

export default async function WriterPostsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const reqHeaders = await headers()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: reqHeaders })

  if (!user) return null

  const resolvedParams = await searchParams
  const page = parseInt(resolvedParams.page || '1', 10)

  const posts = await payload.find({
    collection: 'posts',
    where: { writer: { equals: user.id } },
    sort: '-updatedAt',
    page,
    limit: 10,
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">My Posts</h1>
          <p className="text-muted-foreground mt-1">Manage and edit your drafts and published articles.</p>
        </div>
        <Link href="/writer/posts/new" className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
          Create New Draft
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.docs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No posts found. Start by creating a new draft.
                  </td>
                </tr>
              ) : (
                posts.docs.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">{post.title || 'Untitled Draft'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{post.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        post._status === 'published' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                        post.editorialStatus === 'draft' ? 'bg-muted text-muted-foreground' :
                        post.editorialStatus === 'changes_requested' ? 'bg-destructive/10 text-destructive' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {post._status === 'published' ? 'Published' : post.editorialStatus?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                      {(post.editorialStatus === 'draft' || post.editorialStatus === 'changes_requested') ? (
                        <Link href={`/writer/posts/${post.id}/edit`} className="text-sm font-medium text-primary hover:underline">
                          Edit
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground/50 cursor-not-allowed">Locked</span>
                      )}
                      <Link href={`/api/preview?url=${encodeURIComponent(`/${post.slug || ''}`)}&secret=${process.env.PAYLOAD_SECRET || ''}`} target="_blank" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Preview
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {posts.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/10">
            <p className="text-sm text-muted-foreground">
              Showing page <span className="font-medium text-foreground">{posts.page}</span> of <span className="font-medium text-foreground">{posts.totalPages}</span>
            </p>
            <div className="space-x-2">
              {posts.hasPrevPage && (
                <Link href={`/writer/posts?page=${posts.prevPage}`} className="px-3 py-1 border border-border bg-card rounded text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Previous
                </Link>
              )}
              {posts.hasNextPage && (
                <Link href={`/writer/posts?page=${posts.nextPage}`} className="px-3 py-1 border border-border bg-card rounded text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
