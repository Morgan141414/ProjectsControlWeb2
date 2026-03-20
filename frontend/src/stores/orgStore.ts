import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OrgState {
  orgId: string | null
  orgName: string | null
  setOrg: (orgId: string, orgName: string) => void
  clear: () => void
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      orgId: null,
      orgName: null,

      setOrg: (orgId, orgName) => set({ orgId, orgName }),

      clear: () => set({ orgId: null, orgName: null }),
    }),
    { name: 'org-storage' },
  ),
)
