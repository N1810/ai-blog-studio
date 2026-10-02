export const isAdmin: any = ({ req: { user } }: any) => {
  return user?.role === 'admin' ? true : false
}

export const isAdminOrEditor: any = ({ req: { user } }: any) => {
  return (user?.role === 'admin' || user?.role === 'editor') ? true : false
}

export const isWriter: any = ({ req: { user } }: any) => {
  return user?.role === 'writer' ? true : false
}

export const isActive: any = ({ req: { user } }: any) => {
  return user?.accountStatus === 'active'
}

export const isAdminOrSelf: any = ({ req: { user } }: any) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return { id: { equals: user.id } }
}
