// src/providers/counter-store-provider.tsx
'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'

import { type TenantStore, createTenantStore } from '@/contexts/stores/tenant-store'

export type TenantStoreApi = ReturnType<typeof createTenantStore>

export const TenantStoreContext = createContext<TenantStoreApi | undefined>(
  undefined,
)

export interface TenantStoreProviderProps {
  children: ReactNode
}

export const TenantStoreProvider = ({
  children,
}: TenantStoreProviderProps) => {
  const storeRef = useRef<TenantStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createTenantStore()
  }

  return (
    <TenantStoreContext.Provider value={storeRef.current}>
      {children}
    </TenantStoreContext.Provider>
  )
}

export const useTenantStore = <T,>(
  selector: (store: TenantStore) => T,
): T => {
  const tenantStoreContext = useContext(TenantStoreContext)

  if (!tenantStoreContext) {
    throw new Error(`useTenantStore must be used within TenantStoreProvider`)
  }

  return useStore(tenantStoreContext, selector)
}
