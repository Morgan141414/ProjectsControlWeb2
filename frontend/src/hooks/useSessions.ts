import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Session } from '@/types'
import { startSession, stopSession, listMySessions, listOrgSessions } from '@/api/sessions'
import { queryKeys } from '@/lib/queryKeys'

export function useMySessions(orgId: string | null) {
  return useQuery({
    queryKey: queryKeys.sessions.my(orgId!),
    queryFn: () => listMySessions(orgId!).then((r) => r.data as Session[]),
    enabled: !!orgId,
  })
}

export function useOrgSessions(orgId: string | null) {
  return useQuery({
    queryKey: queryKeys.sessions.org(orgId!),
    queryFn: () => listOrgSessions(orgId!).then((r) => r.data as Session[]),
    enabled: !!orgId,
  })
}

export function useStartSession(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { deviceName: string; osName: string }) =>
      startSession(orgId, data.deviceName, data.osName).then((r) => r.data as Session),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sessions.my(orgId) })
      qc.invalidateQueries({ queryKey: queryKeys.sessions.org(orgId) })
    },
  })
}

export function useStopSession(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => stopSession(orgId, sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sessions.my(orgId) })
      qc.invalidateQueries({ queryKey: queryKeys.sessions.org(orgId) })
    },
  })
}
