"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/browser";

/**
 * useLiveProjects hook
 * - encapsula a subscription Realtime do Supabase para Project/Delivery/View
 * - mantém um array de projetos atualizado e expõe o setter para o consumidor
 */
export default function useLiveProjects<T extends { id: string }>(
  initial: T[],
) {
  const [liveProjects, setLiveProjects] = useState<T[]>(initial);
  const fetchAndUpdateProject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) return;
      const fresh = await res.json();
      const updated = {
        ...fresh,
        updatedAt: new Date(fresh.updatedAt),
        lastViewedAt: fresh.lastViewedAt ? new Date(fresh.lastViewedAt) : null,
      } as unknown as T;

      setLiveProjects((prev) => {
        const exists = prev.some((p) => p.id === (updated as any).id);
        if (exists) {
          return prev.map((p) => (p.id === (updated as any).id ? updated : p));
        }
        return [updated, ...prev];
      });
    } catch {
      // ignore errors in background update
    }
  };

  useEffect(() => {
    // create channel explicitly and register handlers
    const channel = supabaseClient.channel("projects-realtime");

    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "Project" },
      async (payload) => {
        try {
          console.debug("useLiveProjects Project payload", payload);
        } catch {}
        if (payload.eventType === "DELETE") {
          const deletedId = (payload.old as { id: string }).id;
          setLiveProjects((prev) => prev.filter((p) => p.id !== deletedId));
          return;
        }
        const projectId = (payload.new as { id: string }).id;
        await fetchAndUpdateProject(projectId);
      },
    );

    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "Delivery" },
      async (payload) => {
        try {
          console.debug("useLiveProjects Delivery payload", payload);
        } catch {}
        const row = (
          payload.eventType === "DELETE" ? payload.old : payload.new
        ) as {
          projectId: string;
        };
        if (row.projectId) {
          await fetchAndUpdateProject(row.projectId);
        }
      },
    );

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "View" },
      async (payload) => {
        try {
          console.debug("useLiveProjects View payload", payload);
        } catch {}
        const { deliveryId } = payload.new as { deliveryId: string };
        try {
          const res = await fetch(`/api/projects/by-delivery/${deliveryId}`);
          if (!res.ok) return;
          const { projectId } = await res.json();
          if (projectId) await fetchAndUpdateProject(projectId);
        } catch {
          // ignore
        }
      },
    );

    // subscribe
    try {
      channel.subscribe();
    } catch {
      // ignore subscribe errors in dev
    }

    return () => {
      // unsubscribe the channel on cleanup
      try {
        // `unsubscribe` returns a promise in some versions
        // call it and ignore any errors
        // @ts-ignore
        if (typeof channel.unsubscribe === "function") {
          // @ts-ignore
          channel.unsubscribe();
        } else {
          supabaseClient.removeChannel(channel as any);
        }
      } catch {
        // ignore
      }
    };
  }, []);

  // expose a manual refresh helper for debugging and optional use
  const refreshProject = async (projectId: string) => {
    await fetchAndUpdateProject(projectId);
  };

  return [liveProjects, setLiveProjects, refreshProject] as const;
}
