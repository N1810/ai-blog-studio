import { Lexer, Token } from 'marked'

export function markdownToLexical(markdownStr: string) {
  const tokens = Lexer.lex(markdownStr)

  function mapText(text: string, tokens: any[] = []): any[] {
    // Basic inline formatting parsing
    // Since Lexer.lex doesn't give us inline tokens by default in the top level array without inline lexer,
    // we use a simple parsing strategy or just map the raw text.
    // To support bold, italic, links inside paragraphs, we rely on marked's inline token array if present.
    const children: any[] = []

    if (!tokens || tokens.length === 0) {
      return [{
        type: 'text',
        text: text,
        version: 1,
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
      }]
    }

    for (const t of tokens) {
      let format = 0
      if (t.type === 'strong') format = 1
      if (t.type === 'em') format = 2
      if (t.type === 'codespan') format = 16

      if (t.type === 'link') {
        // Prevent javascript: URLs
        let url = t.href || ''
        if (url.toLowerCase().trim().startsWith('javascript:')) {
          url = '#'
        }
        children.push({
          type: 'link',
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          fields: {
            url,
            newTab: false,
            linkType: 'custom',
          },
          children: mapText(t.text, (t as any).tokens)
        })
        continue
      }

      if (t.type === 'text' || t.type === 'escape' || t.type === 'html') {
        children.push({
          type: 'text',
          text: t.raw,
          version: 1,
          detail: 0,
          format: format,
          mode: 'normal',
          style: '',
        })
      } else {
        // Fallback for strong, em, etc.
        children.push({
          type: 'text',
          text: (t as any).text || t.raw,
          version: 1,
          detail: 0,
          format: format,
          mode: 'normal',
          style: '',
        })
      }
    }
    return children
  }

  function mapToken(token: Token): any {
    switch (token.type) {
      case 'heading':
        return {
          type: 'heading',
          tag: `h${token.depth}`,
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: mapText(token.text, (token as any).tokens),
        }
      case 'paragraph':
        return {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: mapText(token.text, (token as any).tokens),
        }
      case 'blockquote':
        return {
          type: 'quote',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: mapText(token.text, (token as any).tokens),
        }
      case 'list':
        return {
          type: 'list',
          listType: token.ordered ? 'number' : 'bullet',
          start: token.start || 1,
          tag: token.ordered ? 'ol' : 'ul',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: token.items.map((item: any) => ({
            type: 'listitem',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            value: 1,
            children: mapText(item.text, (item as any).tokens),
          })),
        }
      case 'code':
        return {
          type: 'code',
          language: token.lang || 'plaintext',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              text: token.text,
              version: 1,
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
            }
          ],
        }
      case 'space':
      case 'hr':
      case 'html': // Prevent unsanitized HTML block injections by skipping them or converting to text
        return null 
      default:
        // Fallback for unhandled tokens
        return {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [{ type: 'text', text: token.raw, version: 1, detail: 0, format: 0, mode: 'normal', style: '' }],
        }
    }
  }

  const lexicalBlocks = tokens.map(mapToken).filter(Boolean)

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: lexicalBlocks.length > 0 ? lexicalBlocks : [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [],
        }
      ],
    }
  }
}
