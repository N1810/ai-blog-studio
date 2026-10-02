import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { ArrowLeft, Clock, History, AlertCircle } from 'lucide-react'
import ReviewActionPanel from './ReviewActionPanel'

export const dynamic = 'force-dynamic'

export default async function ReviewDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  
  const reqHeaders = await headers()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: reqHeaders })

  let post;
  try {
    post = await payload.findByID({
      collection: 'posts',
      id,
      depth: 1,
      req: { user } as any,
    })
  } catch (e) {
    notFound()
  }

  if (!post) {
    notFound()
  }

  const writer = typeof post.writer === 'object' ? post.writer : null

  // Fetch Review History
  const history = await payload.find({
    collection: 'review-history',
    where: { 'post': { equals: id } },
    sort: '-createdAt',
    depth: 1,
    req: { user } as any,
  })

  // Basic html fallback if no lexical renderer is setup on server. 
  // Normally would use the Lexical rich text renderer, but we can display the raw markdown if lexical isn't wired.
  const markdownContent = post._markdown || 'No content provided.'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/editor/review" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ArrowLeft size={16} className="mr-2" /> Back to Queue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Content Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm p-8">
            <div className="mb-8 border-b border-border pb-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary mb-4 inline-block">
                {post.editorialStatus?.replace('_', ' ')}
              </span>
              <h1 className="text-3xl font-extrabold text-foreground mb-4 leading-tight">{post.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{post.excerpt}</p>
              
              <div className="flex items-center text-sm text-muted-foreground gap-4">
                <span className="font-medium text-foreground">By {writer?.displayName || writer?.email || 'Unknown'}</span>
                <span className="flex items-center gap-1"><Clock size={14}/> {post.readingTime || 5} min read</span>
                <span>Last updated: {new Date(post.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              {/* Very rudimentary fallback for viewing markdown if HTML renderer isn't used */}
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/80">{markdownContent}</pre>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & History */}
        <div className="space-y-6">
          <ReviewActionPanel postId={String(post.id)} currentStatus={post.editorialStatus || 'draft'} />
          
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <History size={18} /> Review History
            </h3>
            
            {history.docs.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No review history yet.</p>
            ) : (
              <div className="space-y-4">
                {history.docs.map(record => {
                  const reviewer = typeof record.reviewer === 'object' ? record.reviewer : null
                  return (
                    <div key={record.id} className="text-sm border-l-2 border-primary/20 pl-4 py-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold capitalize text-foreground">{record.action.replace('_', ' ')}</span>
                        <span className="text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">By {reviewer?.displayName || reviewer?.email || 'Unknown'}</p>
                      {record.comment && (
                        <p className="mt-2 text-muted-foreground bg-muted p-2 rounded-md italic">"{record.comment}"</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
