import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, User, ChevronRight, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Blog',
  description: 'Read our latest insights and articles.',
}

export default async function BlogListingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page = '1' } = await searchParams
  const currentPage = parseInt(page, 10) || 1

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  let postsData
  try {
    postsData = await payload.find({
      collection: 'posts',
      where: {
        _status: {
          equals: 'published',
        },
      },
      depth: 2,
      page: currentPage,
      limit: 9,
      sort: '-publishedAt',
    })
  } catch (err) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-5xl text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Failed to load blog posts</h1>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    )
  }

  const { docs: posts, totalPages, hasNextPage, hasPrevPage } = postsData

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <header className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Our Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Insights, tutorials, and updates from our team.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-xl font-medium text-slate-500">No posts published yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post) => {
              const featuredImage = post.featuredImage && typeof post.featuredImage === 'object' ? post.featuredImage : null
              const author = post.author && typeof post.author === 'object' ? post.author : null
              const categories = (post.categories || []).map(c => typeof c === 'object' ? c.title : '').filter(Boolean)

              return (
                <article key={post.id} className="group flex flex-col bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {featuredImage && featuredImage.url ? (
                    <Link href={`/${post.slug}`} className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <Image 
                        src={featuredImage.url} 
                        alt={featuredImage.alt || post.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </Link>
                  ) : (
                    <Link href={`/${post.slug}`} className="relative w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors">
                      <span className="text-slate-400 font-medium">No Image</span>
                    </Link>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    {categories.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          {String(categories[0])}
                        </span>
                      </div>
                    )}
                    
                    <Link href={`/${post.slug}`} className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <h2 className="text-xl font-bold leading-tight mb-3 line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>
                    
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                      {post.excerpt || 'Read full article...'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        {author && (
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {author.name}</span>
                        )}
                        {post.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {post.readingTime && (
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" /> {post.readingTime}m
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              {hasPrevPage ? (
                <Link href={`/blog?page=${currentPage - 1}`} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  Previous
                </Link>
              ) : (
                <button disabled className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-medium text-slate-400 opacity-50 cursor-not-allowed">
                  Previous
                </button>
              )}
              
              <span className="text-sm font-medium text-slate-500">
                Page {currentPage} of {totalPages}
              </span>

              {hasNextPage ? (
                <Link href={`/blog?page=${currentPage + 1}`} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  Next
                </Link>
              ) : (
                <button disabled className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-medium text-slate-400 opacity-50 cursor-not-allowed">
                  Next
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
