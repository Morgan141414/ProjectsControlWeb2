import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Project } from '@/types'
import { listProjects, createProject } from '@/api/projects'
import { queryKeys } from '@/lib/queryKeys'

export function useProjects(orgId: string | null) {
  return useQuery({
    queryKey: queryKeys.projects.list(orgId!),
    queryFn: () => listProjects(orgId!).then((r) => r.data as Project[]),
    enabled: !!orgId,
  })
}

export function useCreateProject(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      createProject(orgId, data.name, data.description).then((r) => r.data as Project),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.list(orgId) })
    },
  })
}
