'use client'

import React, { useState } from 'react'
import { useForm, useConfig } from '@payloadcms/ui'
import { Bot, Sparkles, AlertCircle, CheckCircle2, CopyPlus } from 'lucide-react'

export const AIAssistantField: React.FC = () => {
  const { dispatchFields } = useForm()
  
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate')
  const [prompt, setPrompt] = useState('')
  const [textInput, setTextInput] = useState('')
  const [action, setAction] = useState('rewrite')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  
  const handleGenerate = async () => {
    if (!prompt.trim() && activeTab === 'generate') return
    if (!textInput.trim() && activeTab === 'edit') return

    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const res = await fetch(`/api/posts/ai-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: activeTab === 'generate' ? 'generate_post' : action, 
          prompt: activeTab === 'generate' ? prompt : '', 
          text: activeTab === 'edit' ? textInput : ''
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applyField = (path: string, value: any) => {
    dispatchFields({ type: 'UPDATE', path, value })
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-8">
      <div className="flex items-center gap-2 font-semibold mb-4 text-slate-800 dark:text-slate-100">
        <Bot className="w-5 h-5 text-indigo-500" />
        Groq AI Assistant
      </div>

      <div className="flex gap-2 mb-4">
        <button 
          type="button"
          onClick={() => { setActiveTab('generate'); setResult(null); setError(null) }}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'generate' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
        >
          Generate Post
        </button>
        <button 
          type="button"
          onClick={() => { setActiveTab('edit'); setResult(null); setError(null) }}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'edit' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
        >
          Edit / Improve Text
        </button>
      </div>

      {activeTab === 'generate' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Topic or Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
            placeholder="E.g., Write a comprehensive guide on modern Next.js 15 features..."
          />
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Action</label>
          <select 
            value={action} 
            onChange={(e) => setAction(e.target.value)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="rewrite">Rewrite for clarity</option>
            <option value="expand">Expand text</option>
            <option value="shorten">Shorten text</option>
            <option value="grammar">Fix grammar</option>
            <option value="tone">Change tone (Professional)</option>
          </select>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">Text to improve</label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
            placeholder="Paste text here to rewrite, expand, or improve..."
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 flex items-center justify-center w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? (
          <span className="animate-pulse">Thinking...</span>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {activeTab === 'generate' ? 'Generate Content' : 'Improve Text'}
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && activeTab === 'generate' && (
        <div className="mt-6 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium mb-2">
            <CheckCircle2 className="w-5 h-5" />
            Generation Complete!
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Review the generated content below and click Apply to inject it into your draft.</p>
          
          <div className="space-y-3">
            {['title', 'excerpt', 'metaTitle', 'metaDescription', 'slug'].map(field => (
              <div key={field} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">{field}</span>
                  <span className="text-sm text-slate-800 dark:text-slate-200 truncate block">{result[field]}</span>
                </div>
                <button type="button" onClick={() => applyField(field, result[field])} className="shrink-0 flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded">
                  <CopyPlus className="w-3 h-3" /> Apply
                </button>
              </div>
            ))}

            <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rich Text Body</span>
                <button type="button" onClick={() => applyField('content', result.lexicalContent)} className="shrink-0 flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded">
                  <CopyPlus className="w-3 h-3" /> Apply to Editor
                </button>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded h-32 overflow-y-auto whitespace-pre-wrap">
                {result.contentBlocks?.map((b: any) => b.text).join('\n\n')}
              </div>
            </div>
          </div>
        </div>
      )}

      {result && activeTab === 'edit' && (
        <div className="mt-6 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium mb-2">
            <CheckCircle2 className="w-5 h-5" />
            Improvement Complete!
          </div>
          
          <div className="relative">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Result</label>
            <div className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-md min-h-[100px] whitespace-pre-wrap">
              {result.resultText}
            </div>
            <button 
              type="button" 
              onClick={() => navigator.clipboard.writeText(result.resultText)} 
              className="absolute top-0 right-0 mt-6 mr-2 p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              title="Copy to clipboard"
            >
              <CopyPlus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500">You can copy this text and replace your existing selection in the editor.</p>
        </div>
      )}
    </div>
  )
}
