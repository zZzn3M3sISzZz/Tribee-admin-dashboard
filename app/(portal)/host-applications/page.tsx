"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Flag, Loader2, SlidersHorizontal, SortAsc } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDate, initials } from "@/lib/utils";
import type { HostApplication } from "@/lib/types";

function statusBadge(status: string) {
  if (status === "pending") {
    return (
      <span className="rounded bg-status-mint px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-brand-dark">
        New
      </span>
    );
  }
  if (status === "under_review") {
    return (
      <span className="rounded bg-surface-inset px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-text-muted">
        Under Review
      </span>
    );
  }
  return (
    <span className="rounded bg-surface-inset px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-text-muted">
      {status}
    </span>
  );
}

export default function HostApplicationsPage() {
  const [items, setItems] = useState<HostApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listHostApplications({ limit: 50 });
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (hostId: string) => {
    try {
      await api.approveHost(hostId);
      toast.success("Host approved");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approval failed");
    }
  };

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return !q || item.display_name.toLowerCase().includes(q);
  });

  return (
    <>
      <Header placeholder="Search applications..." value={search} onChange={setSearch} />
      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Host Applications</h1>
            <p className="mt-2 text-text-secondary">
              Review and verify community members applying to host new experiences.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <SortAsc className="h-4 w-4" />
              Newest First
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-card border border-surface-border bg-white p-16 text-center text-text-secondary">
            No host applications in the queue.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <article
                key={item.host_id}
                className="rounded-card border border-surface-border bg-white p-6"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-status-mint bg-brand-tint text-lg font-bold text-brand">
                    {initials(item.display_name)}
                  </div>
                  {statusBadge(item.status)}
                </div>
                <h2 className="text-xl font-semibold text-brand-dark">{item.display_name}</h2>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-brand-muted">
                  <Check className="h-3.5 w-3.5" />
                  {item.vouch_count} Vouches
                </p>
                <div className="mt-4 rounded-lg bg-surface-inset p-3">
                  <p className="text-xs font-semibold text-brand-dark">Proposed Experience</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Host application in {item.city_id}
                  </p>
                  <p className="mt-1 text-xs text-text-disabled">
                    Applied {formatDate(item.created_at)}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleApprove(item.host_id)}
                    disabled={item.status !== "pending_review"}
                  >
                    {item.status === "pending_review" ? "Approve" : "Review"}
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Flag application">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
