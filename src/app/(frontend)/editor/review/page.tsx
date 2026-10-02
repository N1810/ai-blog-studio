import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { FileText, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReviewQueue({
  searchParams,
}: {
  searchParams: Promise<{ status?: string, page?: string }>
}) {
  const reqHeaders = await headers()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: reqHeaders })

  const resolvedParams = await searchParams
  const statusFilter = resolvedParams.status || 'pending_review'
  const page = parseInt(resolvedParams.page || '1', 10)

  let whereClause: any = {}
  
  if (statusFilter !== 'all') {
    whereClause.editorialStatus = { equals: statusFilter }
  }

  const posts = await payload.find({
    collection: 'posts',
    where: whereClause,
    depth: 1,
    sort: '-updatedAt',
    page,
    limit: 20,
    req: { user } as any,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Review Queue</h1>
          <p className="text-muted-foreground mt-2">Manage and review writer submissions.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-wrap gap-4 items-center shadow-sm">
        <div className="flex gap-2">
          {['all', 'pending_review', 'changes_requested', 'approved', 'rejected'].map(status => (
            <Link
              key={status}
              href={`/editor/review?status=${status}`}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                statusFilter === status 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {status === 'all' ? 'All Posts' : status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Link>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {posts.docs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No posts found in this status.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.docs.map((post) => {
              const writer = typeof post.writer === 'object' ? post.writer : null
              return (
                <div key={post.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/30 transition-colors gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground truncate text-lg">{post.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-primary/10 text-primary whitespace-nowrap">
                        {post.editorialStatus?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="truncate">By {writer?.displayName || writer?.email || 'Unknown'}</span>
                      <span>•</span>
                      <span>Updated {new Date(post.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/editor/review/${post.id}`}
                    className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-md hover:bg-primary/20 transition-colors text-sm whitespace-nowrap text-center"
                  >
                    Review Post
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {posts.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Link
            href={`/editor/review?status=${statusFilter}&page=${posts.prevPage || 1}`}
            className={`px-4 py-2 rounded-md text-sm font-medium border border-border ${!posts.hasPrevPage ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
          >
            Previous
          </Link>
          <span className="px-4 py-2 text-sm font-medium text-muted-foreground">
            Page {posts.page} of {posts.totalPages}
          </span>
          <Link
            href={`/editor/review?status=${statusFilter}&page=${posts.nextPage || posts.totalPages}`}
            className={`px-4 py-2 rounded-md text-sm font-medium border border-border ${!posts.hasNextPage ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  )
}
