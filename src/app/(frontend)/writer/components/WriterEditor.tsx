'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

export default function WriterEditor({ 
  initialData, 
  isNew 
}: { 
  initialData: any
  isNew: boolean 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    _markdown: initialData?._markdown || '',
  })

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHasUnsavedChanges(true)
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const wordCount = formData._markdown.trim() ? formData._markdown.trim().split(/\s+/).length : 0
  const charCount = formData._markdown.length

  const handleSave = async (submitForReview = false) => {
    setLoading(true)
    setError('')
    try {
      const endpoint = isNew ? '/api/posts' : `/api/posts/${initialData.id}`
      const method = isNew ? 'POST' : 'PATCH'
      
      const payloadData: any = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        _markdown: formData._markdown,
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.errors?.[0]?.message || 'Failed to save post')
      }

      const savedPost = await res.json()
      setHasUnsavedChanges(false)
      
      if (submitForReview) {
        const submitRes = await fetch(`/api/posts/${savedPost.doc.id}/submit`, {
          method: 'POST'
        })
        if (!submitRes.ok) {
           const subErr = await submitRes.json()
           throw new Error(subErr.error || 'Saved, but failed to submit for review.')
        }
      }

      router.push('/writer/posts')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const renderPreview = () => {
    const rawHtml = marked.parse(formData._markdown || '*Empty*') as string
    const cleanHtml = DOMPurify.sanitize(rawHtml)
    return { __html: cleanHtml }
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/20 gap-4">
        <h2 className="text-xl font-bold text-foreground">
          {isNew ? 'Create New Draft' : 'Edit Draft'} 
          {hasUnsavedChanges && <span className="text-amber-500 text-sm ml-3 font-medium">(Unsaved Changes)</span>}
        </h2>
        <div className="space-x-3 w-full sm:w-auto flex">
          <button 
            onClick={() => handleSave(false)} 
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2 bg-card border border-border text-foreground text-sm font-medium rounded-md hover:bg-muted transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          {!isNew && (
             <button 
               onClick={() => handleSave(true)} 
               disabled={loading}
               className="flex-1 sm:flex-none px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
             >
               Submit for Review
             </button>
          )}
        </div>
      </div>
      
      <div className="p-6 sm:p-8 space-y-8">
        {error && <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm border border-destructive/20">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border pb-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title</label>
              <input 
                type="text" 
                name="title"
                value={formData.title} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-foreground transition-shadow"
                placeholder="Post title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Slug</label>
              <input 
                type="text" 
                name="slug"
                value={formData.slug} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-foreground transition-shadow"
                placeholder="url-friendly-slug"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Excerpt</label>
              <textarea 
                name="excerpt"
                value={formData.excerpt} 
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-foreground transition-shadow resize-none"
                placeholder="Brief summary..."
              />
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">SEO Title</label>
              <input 
                type="text" 
                name="metaTitle"
                value={formData.metaTitle} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-foreground transition-shadow"
                placeholder="SEO Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">SEO Description</label>
              <textarea 
                name="metaDescription"
                value={formData.metaDescription} 
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-foreground transition-shadow resize-none"
                placeholder="SEO Description..."
              />
            </div>
          </div>
        </div>

        {/* Article Body Section */}
        <div>
           <div className="flex justify-between items-center mb-4">
             <label className="block text-sm font-bold text-foreground">Article Body (Markdown)</label>
             <div className="flex items-center gap-4">
               <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border">
                 {wordCount} words | {charCount} chars
               </span>
               <div className="flex bg-muted rounded-lg p-1 border border-border">
                 <button 
                    type="button" 
                    onClick={() => setPreviewMode(false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${!previewMode ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                 >
                   Write
                 </button>
                 <button 
                    type="button" 
                    onClick={() => setPreviewMode(true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${previewMode ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                 >
                   Preview
                 </button>
               </div>
             </div>
           </div>
           
           {previewMode ? (
             <div 
                className="w-full p-6 border border-border rounded-lg min-h-[500px] prose dark:prose-invert max-w-none bg-background shadow-inner overflow-auto"
                dangerouslySetInnerHTML={renderPreview()}
             />
           ) : (
             <textarea 
                name="_markdown"
                value={formData._markdown} 
                onChange={handleChange}
                rows={22}
                className="w-full p-6 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary font-mono text-[15px] leading-loose bg-background text-foreground shadow-inner resize-y transition-shadow"
                placeholder="# Your heading here&#10;&#10;Write your post body using Markdown syntax...&#10;&#10;**Bold text**, *Italic text*, [Links](https://example.com)&#10;&#10;- List item 1&#10;- List item 2"
             />
           )}
        </div>
      </div>
    </div>
  )
}
