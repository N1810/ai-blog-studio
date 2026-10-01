import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import config from '@/payload.config'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  
  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: {
      _status: {
        equals: 'published',
      },
    },
    sort: '-publishedAt',
  })

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">AI Blog Studio</h1>
        <p className="text-xl text-muted-foreground">The latest insights and articles.</p>
      </header>
      
      <main>
        {posts.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <h2 className="text-xl font-medium mb-2">No posts yet</h2>
            <p className="text-muted-foreground">Check back soon for new content.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post) => (
              <article key={post.id} className="group">
                <Link href={`/${post.slug || ''}`}>
                  <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors cursor-pointer">
                    {post.title}
                  </h2>
                </Link>
                {post.excerpt && (
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                {post.publishedAt && (
                  <time className="text-sm text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </time>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
