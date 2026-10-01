import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const url = searchParams.get('url')

  if (!url || secret !== process.env.PAYLOAD_SECRET) {
    return new Response('Invalid request', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(url)
}
