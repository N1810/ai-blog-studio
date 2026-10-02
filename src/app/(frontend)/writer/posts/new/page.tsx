import React from 'react'
import WriterEditor from '../../components/WriterEditor'

export default function NewPostPage() {
  return (
    <div>
      <WriterEditor initialData={{}} isNew={true} />
    </div>
  )
}
