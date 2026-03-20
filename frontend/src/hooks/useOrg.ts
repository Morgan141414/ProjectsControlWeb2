import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Org, JoinRequest } from '@/types'
import { createOrg, getOrg, joinOrg, listJoinRequests, approveJoinRequest, rejectJoinRequest } from '@/api/orgs'
import { queryKeys } from '@/lib/queryKeys'

export function useOrg(orgId: string | null) {
  return useQuery({
    queryKey: queryKeys.org.detail(orgId!),
    queryFn: () => getOrg(orgId!).then((r) => r.data as Org),
    enabled: !!orgId,
  })
}

export function useJoinRequests(orgId: string | null) {
  return useQuery({
    queryKey: queryKeys.org.joinRequests(orgId!),
    queryFn: () => listJoinRequests(orgId!).then((r) => r.data as JoinRequest[]),
    enabled: !!orgId,
  })
}

export function useCreateOrg() {
  return useMutation({
    mutationFn: (name: string) => createOrg(name).then((r) => r.data as Org),
  })
}

export function useJoinOrg() {
  return useMutation({
    mutationFn: (code: string) => joinOrg(code),
  })
}

export function useApproveJoinRequest(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) => approveJoinRequest(orgId, requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.org.joinRequests(orgId) })
      qc.invalidateQueries({ queryKey: queryKeys.users.list(orgId) })
    },
  })
}

export function useRejectJoinRequest(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) => rejectJoinRequest(orgId, requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.org.joinRequests(orgId) })
    },
  })
}
