import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import config from '@/payload.config'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ArrowRight, Sparkles } from 'lucide-react'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  
  let posts: any[] = []
  try {
    const { docs } = await payload.find({
      collection: 'posts',
      where: {
        _status: {
          equals: 'published',
        },
      },
      sort: '-publishedAt',
      limit: 6,
    })
    posts = docs
  } catch (error) {
    console.warn('⚠️ Skipping recent posts fetch: DB not available or migrations not applied.', error)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 -z-10 [mask-image:radial-gradient(ellipse_at_top_right,transparent,black)]"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Sparkles size={16} />
                  <span>AI-Powered Publishing</span>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground leading-[1.1]">
                  Ideas to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Impact.</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                  Write, review, and publish faster with intelligent AI assistance and a modern editorial workflow.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register" className="inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-medium hover:bg-primary/90 transition-colors">
                    Start Writing <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link href="/blog" className="inline-flex items-center justify-center bg-muted text-foreground px-8 py-3.5 rounded-full font-medium hover:bg-muted/80 transition-colors border border-border">
                    Read the Blog
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-blue-500/20 border border-border/50 shadow-2xl relative">
                  <div className="absolute inset-4 rounded-xl bg-background shadow-sm border border-border p-6 flex flex-col">
                    <div className="h-6 w-3/4 bg-muted rounded-md mb-8"></div>
                    <div className="space-y-4">
                      <div className="h-4 w-full bg-muted/50 rounded-md"></div>
                      <div className="h-4 w-5/6 bg-muted/50 rounded-md"></div>
                      <div className="h-4 w-4/6 bg-muted/50 rounded-md"></div>
                    </div>
                    <div className="mt-auto flex justify-end">
                      <div className="h-10 w-32 bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Articles */}
        <section className="py-20 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Latest Articles</h2>
                <p className="text-muted-foreground">Discover stories, thinking, and expertise.</p>
              </div>
              <Link href="/blog" className="hidden sm:inline-flex items-center text-primary font-medium hover:underline">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {posts.length === 0 ? (
              <div className="text-center py-20 border rounded-2xl bg-background shadow-sm">
                <h3 className="text-lg font-medium mb-2">No articles published yet.</h3>
                <p className="text-muted-foreground">Check back soon for our latest content.</p>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <article key={post.id} className="group flex flex-col bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                    <Link href={`/${post.slug || ''}`} className="block aspect-[16/10] bg-muted overflow-hidden relative">
                       {/* Placeholder for featured image */}
                       <div className="absolute inset-0 bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/30 group-hover:scale-105 transition-transform duration-300"></div>
                    </Link>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
                        <span className="uppercase tracking-wider">Design</span>
                      </div>
                      <Link href={`/${post.slug || ''}`}>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      {post.excerpt && (
                        <p className="text-muted-foreground mb-6 line-clamp-3 text-sm flex-1">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {(typeof post.author === 'object' && post.author?.name) ? post.author.name[0] : 'A'}
                          </div>
                          <span>{(typeof post.author === 'object' && post.author?.name) ? post.author.name : 'Unknown Author'}</span>
                        </div>
                        {post.publishedAt && (
                          <time>
                            {new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </time>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <div className="mt-8 text-center sm:hidden">
              <Link href="/blog" className="inline-flex items-center text-primary font-medium hover:underline">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
