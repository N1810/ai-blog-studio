import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { FileText, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EditorOverview() {
  const reqHeaders = await headers()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: reqHeaders })

  const pendingReview = await payload.find({
    collection: 'posts',
    where: { editorialStatus: { equals: 'pending_review' } },
    limit: 10,
    depth: 1,
    sort: '-updatedAt',
    req: { user } as any,
  })

  const changesRequested = await payload.find({
    collection: 'posts',
    where: { editorialStatus: { equals: 'changes_requested' } },
    limit: 0,
    req: { user } as any,
  })

  const approved = await payload.find({
    collection: 'posts',
    where: { editorialStatus: { equals: 'approved' } },
    limit: 0,
    req: { user } as any,
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user?.displayName || 'Editor'}. Here is the current review queue.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center text-orange-500 mb-4">
            <Clock className="w-5 h-5 mr-2" />
            <h2 className="font-semibold text-sm tracking-wide uppercase">Awaiting Review</h2>
          </div>
          <span className="text-4xl font-bold text-foreground">{pendingReview.totalDocs}</span>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center text-green-500 mb-4">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <h2 className="font-semibold text-sm tracking-wide uppercase">Approved</h2>
          </div>
          <span className="text-4xl font-bold text-foreground">{approved.totalDocs}</span>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center text-blue-500 mb-4">
            <AlertCircle className="w-5 h-5 mr-2" />
            <h2 className="font-semibold text-sm tracking-wide uppercase">Changes Requested</h2>
          </div>
          <span className="text-4xl font-bold text-foreground">{changesRequested.totalDocs}</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Recent Submissions</h2>
          <Link href="/editor/review" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {pendingReview.docs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No posts are currently awaiting review.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pendingReview.docs.map((post) => {
              const writer = typeof post.writer === 'object' ? post.writer : null
              return (
                <div key={post.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Submitted by {writer?.displayName || writer?.email || 'Unknown Writer'} • {new Date(post.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link 
                    href={`/editor/review/${post.id}`}
                    className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-md hover:bg-primary/20 transition-colors text-sm"
                  >
                    Review Post
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
