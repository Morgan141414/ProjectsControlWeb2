import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Team } from '@/types'
import { listTeams, listMyTeams, createTeam, addTeamMember } from '@/api/teams'
import { queryKeys } from '@/lib/queryKeys'

export function useTeams(orgId: string | null) {
  return useQuery({
    queryKey: queryKeys.teams.list(orgId!),
    queryFn: () => listTeams(orgId!).then((r) => r.data as Team[]),
    enabled: !!orgId,
  })
}

export function useMyTeams(orgId: string | null) {
  return useQuery({
    queryKey: queryKeys.teams.my(orgId!),
    queryFn: () => listMyTeams(orgId!).then((r) => r.data as Team[]),
    enabled: !!orgId,
  })
}

export function useCreateTeam(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; projectId?: string }) =>
      createTeam(orgId, data.name, data.projectId).then((r) => r.data as Team),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.teams.list(orgId) })
      qc.invalidateQueries({ queryKey: queryKeys.teams.my(orgId) })
    },
  })
}

export function useAddTeamMember(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      addTeamMember(orgId, teamId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.teams.list(orgId) })
    },
  })
}
