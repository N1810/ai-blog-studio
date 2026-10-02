import type { PayloadRequest } from 'payload'

export const registerHandler = async (req: PayloadRequest): Promise<Response> => {
  try {
    const body = await (req as any).json()
    const { email, password, displayName } = body

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400 })
    }

    const payload = req.payload

    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        role: 'writer',
        accountStatus: 'active',
        displayName: displayName || '',
      },
    })

    // Remove sensitive fields
    const safeUser = { id: user.id, email: user.email, role: user.role }

    return new Response(JSON.stringify({ message: 'Registration successful', user: safeUser }), { status: 201 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Registration failed' }), { status: 400 })
  }
}
