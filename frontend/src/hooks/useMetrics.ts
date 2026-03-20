import { useQuery } from '@tanstack/react-query'
import type { SessionMetrics, UserMetrics } from '@/types'
import { getSessionMetrics, getUserMetrics } from '@/api/metrics'
import { queryKeys } from '@/lib/queryKeys'

export function useSessionMetrics(
  orgId: string | null,
  sessionId: string | null,
) {
  return useQuery({
    queryKey: queryKeys.metrics.session(orgId!, sessionId!),
    queryFn: () =>
      getSessionMetrics(orgId!, sessionId!).then((r) => r.data as SessionMetrics),
    enabled: !!orgId && !!sessionId,
  })
}

export function useUserMetrics(
  orgId: string | null,
  userId: string | null,
  params?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: queryKeys.metrics.user(orgId!, userId!, params),
    queryFn: () =>
      getUserMetrics(orgId!, userId!, params).then((r) => r.data as UserMetrics),
    enabled: !!orgId && !!userId,
  })
}
