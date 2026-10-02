'use client'
import dynamic from 'next/dynamic'

const WriterEditor = dynamic(() => import('./WriterEditor'), { ssr: false })

export default function WriterEditorWrapper(props: any) {
  return <WriterEditor {...props} />
}
