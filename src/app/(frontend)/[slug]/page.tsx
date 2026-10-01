import { getPayload } from 'payload'
import config from '@/payload.config'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'
import { RefreshRouteOnSave } from '@/components/RefreshRouteOnSave'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react'

export async function generateStaticParams() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      _status: {
        equals: 'published',
      },
    },
    limit: 100,
  })

  return docs.map((doc) => ({
    slug: doc.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { isEnabled: isDraftMode } = await draftMode()

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: slug,
      },
    },
    draft: isDraftMode,
    depth: 1,
  })

  const post = docs[0]
  if (!post) return {}

  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const ogImage = post.featuredImage && typeof post.featuredImage === 'object' && post.featuredImage.url 
    ? `${serverURL}${post.featuredImage.url}`
    : undefined

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    robots: isDraftMode ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: `${serverURL}/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: 'article',
      url: `${serverURL}/${post.slug}`,
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { isEnabled: isDraftMode } = await draftMode()

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: slug,
      },
    },
    draft: isDraftMode,
    depth: 2,
  })

  const post = docs[0]
  if (!post) return notFound()

  const featuredImage = post.featuredImage && typeof post.featuredImage === 'object' ? post.featuredImage : null
  const author = post.author && typeof post.author === 'object' ? post.author : null
  const categories = (post.categories || []).map(c => typeof c === 'object' ? c.title : '').filter(Boolean)
  const tags = (post.tags || []).map(t => typeof t === 'object' ? (t as any).name : '').filter(Boolean)

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <RefreshRouteOnSave />
      {isDraftMode && (
        <div className="bg-amber-100 text-amber-900 px-4 py-2 rounded-md mb-8 text-center text-sm font-medium border border-amber-200">
          Draft Mode Enabled — Live Preview
        </div>
      )}
      
      <div className="mb-8">
        <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Blog
        </Link>
      </div>

      <header className="mb-10 text-center space-y-4">
        {categories.length > 0 && (
          <div className="flex gap-2 justify-center flex-wrap">
            {categories.map((cat, i) => (
              <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                {String(cat)}
              </span>
            ))}
          </div>
        )}
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          {post.title}
        </h1>
        
        {post.excerpt && (
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 pt-4">
          {author && (
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <User className="w-4 h-4" /> {author.name}
            </div>
          )}
          {post.publishedAt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
            </div>
          )}
          {post.readingTime && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readingTime} min read
            </div>
          )}
        </div>
      </header>
      
      {featuredImage && featuredImage.url && (
        <div className="relative w-full aspect-[2/1] mb-12 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800">
          <Image 
            src={featuredImage.url} 
            alt={featuredImage.alt || post.title} 
            fill 
            className="object-cover"
            priority 
          />
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert prose-indigo mx-auto max-w-3xl prose-img:rounded-xl">
        {post.content ? (
          <RichText data={post.content} />
        ) : (
          <p className="text-slate-500 italic text-center">No content available.</p>
        )}
      </div>

      {tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 max-w-3xl mx-auto flex-wrap">
          <span className="text-sm font-semibold text-slate-500">TAGS:</span>
          {tags.map((tag, i) => (
            <span key={i} className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
              #{String(tag)}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
