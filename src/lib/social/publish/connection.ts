export interface ConnectionData {
  orgUrn?: string
  accessToken?: string
  refreshToken?: string
  accessExpiresAt?: string
  refreshExpiresAt?: string
}

interface PayloadLike {
  findGlobal: (args: { slug: string }) => Promise<any>
  updateGlobal: (args: { slug: string; data: any }) => Promise<any>
}

export async function getConnection(payload: PayloadLike): Promise<ConnectionData> {
  const doc = await payload.findGlobal({ slug: 'linkedin-connection' })
  return (doc || {}) as ConnectionData
}

export async function saveConnection(
  payload: PayloadLike,
  data: Partial<ConnectionData> & { connectedBy?: string | number; connectedAt?: string },
): Promise<void> {
  await payload.updateGlobal({ slug: 'linkedin-connection', data })
}
