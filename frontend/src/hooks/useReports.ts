import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { KpiReport, ReportExport } from '@/types'
import {
  getOrgKpi,
  getProjectKpi,
  exportOrgKpi,
  exportProjectKpi,
  listReportExports,
} from '@/api/reports'
import { queryKeys } from '@/lib/queryKeys'

export function useOrgKpi(orgId: string | null, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.reports.orgKpi(orgId!, params),
    queryFn: () => getOrgKpi(orgId!, params).then((r) => r.data as KpiReport),
    enabled: !!orgId,
  })
}

export function useProjectKpi(orgId: string | null, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.reports.projectKpi(orgId!, params),
    queryFn: () => getProjectKpi(orgId!, params).then((r) => r.data as KpiReport),
    enabled: !!orgId,
  })
}

export function useReportExports(orgId: string | null) {
  return useQuery({
    queryKey: queryKeys.reports.exports(orgId!),
    queryFn: () => listReportExports(orgId!).then((r) => r.data as ReportExport[]),
    enabled: !!orgId,
  })
}

export function useExportOrgKpi(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { format: string; from?: string; to?: string }) =>
      exportOrgKpi(orgId, params).then((r) => r.data as ReportExport),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reports.exports(orgId) })
    },
  })
}

export function useExportProjectKpi(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { format: string; project_id: string; from?: string; to?: string }) =>
      exportProjectKpi(orgId, params).then((r) => r.data as ReportExport),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reports.exports(orgId) })
    },
  })
}
