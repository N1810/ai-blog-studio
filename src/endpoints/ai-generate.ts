import type { PayloadRequest } from 'payload'
import Groq from 'groq-sdk'

export const aiGenerateHandler = async (req: PayloadRequest): Promise<Response> => {
  if (!req.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY is not configured' }), { status: 500 })
  }

  try {
    const groq = new Groq({ apiKey })
    const body = await (req as any).json()
    const { action, prompt, text } = body

    if (action === 'generate_post') {
      const systemPrompt = `You are an expert blog post writer. Generate a complete, SEO-optimized blog post based on the following topic or prompt.
Return ONLY valid JSON matching this schema exactly without any markdown formatting or code blocks:
{
  "title": "Post Title",
  "excerpt": "A short summary",
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "slug": "seo-friendly-slug",
  "contentBlocks": [
    { "type": "h2", "text": "Heading text" },
    { "type": "p", "text": "Paragraph text" }
  ]
}`
      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Topic/Prompt: ${prompt}` }
        ],
        model: 'openai/gpt-oss-120b',
        response_format: { type: 'json_object' }
      })
      
      const resultText = response.choices[0]?.message?.content
      if (!resultText) throw new Error("Empty response from AI")
      
      const generatedJSON = JSON.parse(resultText)

      // Convert blocks to simple Lexical AST
      const lexicalContent = {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: (generatedJSON.contentBlocks || []).map((block: any) => {
            if (block.type === 'h2') {
              return {
                type: 'heading',
                tag: 'h2',
                format: '',
                indent: 0,
                version: 1,
                direction: 'ltr',
                children: [{ type: 'text', text: block.text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' }]
              }
            }
            return {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [{ type: 'text', text: block.text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' }]
            }
          })
        }
      }

      return new Response(JSON.stringify({ ...generatedJSON, lexicalContent }), { status: 200 })
    } 
    
    else if (action === 'rewrite' || action === 'expand' || action === 'shorten' || action === 'grammar' || action === 'tone') {
      const actionPrompts: Record<string, string> = {
        'rewrite': 'Rewrite the following text to improve clarity and flow. Return ONLY the rewritten text.',
        'expand': 'Expand the following text with more details. Return ONLY the expanded text.',
        'shorten': 'Shorten the following text while keeping the main points. Return ONLY the shortened text.',
        'grammar': 'Fix any grammar and spelling errors in the following text. Return ONLY the fixed text.',
        'tone': `Change the tone of the following text to be ${prompt || 'professional'}. Return ONLY the changed text.`
      }

      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: actionPrompts[action] || 'Improve this text.' },
          { role: 'user', content: `Text: ${text}` }
        ],
        model: 'openai/gpt-oss-120b',
      })
      
      const resultText = response.choices[0]?.message?.content

      return new Response(JSON.stringify({ resultText: resultText }), { status: 200 })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })
  } catch (error: any) {
    console.error('AI Generate Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 })
  }
}
