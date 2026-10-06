import { createHash } from 'node:crypto'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Header the FinScribe mobile app sends instead of a Clerk session.
 *
 * The app generates a random 256-bit key on first launch and keeps it in the
 * device's secure storage. The key is the credential for that device's data, so
 * only its SHA-256 hash is stored server-side.
 */
export const DEVICE_KEY_HEADER = 'x-finscribe-device-key'

const deviceKeyPattern = /^[A-Za-z0-9_-]{43,128}$/

// Device users share the User table with Clerk users. Clerk IDs start with
// "user_", so this prefix cannot collide with them.
const deviceIdPrefix = 'device:'

export type RequestIdentity = { id: string; source: 'clerk' | 'device' }

/** Resolves the caller from a Clerk session, or from a mobile device key. */
export async function getRequestIdentity(request: Request): Promise<RequestIdentity | null> {
  const { isAuthenticated, userId } = await auth()
  if (isAuthenticated && userId) return { id: userId, source: 'clerk' }

  const deviceKey = request.headers.get(DEVICE_KEY_HEADER)
  if (!deviceKey || !deviceKeyPattern.test(deviceKey)) return null

  const hash = createHash('sha256').update(deviceKey).digest('hex')
  return { id: `${deviceIdPrefix}${hash}`, source: 'device' }
}

/** Resolves the caller and returns (creating on first use) their database user. */
export async function getRequestUser(request: Request) {
  const identity = await getRequestIdentity(request)
  if (!identity) return null

  return prisma.user.upsert({
    where: { clerkId: identity.id },
    update: {},
    create: { clerkId: identity.id },
  })
}
