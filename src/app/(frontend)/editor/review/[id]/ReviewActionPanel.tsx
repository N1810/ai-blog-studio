'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, AlertCircle } from 'lucide-react'

export default function ReviewActionPanel({ postId, currentStatus }: { postId: string, currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [actionType, setActionType] = useState<'approve' | 'request_changes' | 'reject' | null>(null)

  const handleAction = async (action: 'approve' | 'request_changes' | 'reject') => {
    if ((action === 'request_changes' || action === 'reject') && !feedback.trim()) {
      setError(`Please provide feedback or a reason to ${action.replace('_', ' ')}.`)
      return
    }

    setLoading(true)
    setError('')
    setActionType(action)

    try {
      const res = await fetch(`/api/posts/${postId}/review-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, feedback }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Action failed')
      }

      setFeedback('')
      setActionType(null)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isLocked = currentStatus === 'approved' || currentStatus === 'rejected' || currentStatus === 'draft'

  if (isLocked) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 text-center">
        <h3 className="font-semibold text-lg mb-2">Review Complete</h3>
        <p className="text-sm text-muted-foreground">This post is currently {currentStatus.replace('_', ' ')} and cannot be reviewed further from this panel.</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6">
      <h3 className="font-semibold text-lg mb-4">Editorial Decision</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm font-medium flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Feedback / Reason (Required for Changes or Rejection)</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-sm min-h-[100px]"
            placeholder="Provide constructive feedback for the writer..."
          />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
          >
            <Check size={18} /> {loading && actionType === 'approve' ? 'Approving...' : 'Approve Submission'}
          </button>
          
          <button
            onClick={() => handleAction('request_changes')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
          >
            <AlertCircle size={18} /> {loading && actionType === 'request_changes' ? 'Requesting...' : 'Request Changes'}
          </button>
          
          <button
            onClick={() => handleAction('reject')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
          >
            <X size={18} /> {loading && actionType === 'reject' ? 'Rejecting...' : 'Reject Submission'}
          </button>
        </div>
      </div>
    </div>
  )
}
