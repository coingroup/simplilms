"use client";

import { createContext, useContext } from "react";
import type { TenantConfig } from "../lib/tenant-config";

const TenantContext = createContext<TenantConfig | null>(null);

/**
 * Provider that makes tenant configuration available to all client components.
 * Wrap the root layout with this provider, passing the config loaded server-side.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx (server component)
 * const config = await loadTenantConfig();
 * return (
 *   <TenantProvider config={config}>
 *     {children}
 *   </TenantProvider>
 * );
 * ```
 */
export function TenantProvider({
  config,
  children,
}: {
  config: TenantConfig;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={config}>{children}</TenantContext.Provider>
  );
}

/**
 * Hook to access tenant configuration in client components.
 * Must be used within a TenantProvider.
 *
 * @example
 * ```tsx
 * const tenant = useTenant();
 * return <h1>{tenant.name}</h1>;
 * ```
 */
export function useTenant(): TenantConfig {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error(
      "useTenant() must be used within a <TenantProvider>. " +
        "Wrap your root layout with <TenantProvider config={...}>."
    );
  }
  return ctx;
}
