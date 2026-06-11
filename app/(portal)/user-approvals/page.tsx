"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MoreVertical, RefreshCw, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { VerificationModal } from "@/components/verification-modal";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDate, initials } from "@/lib/utils";
import type { IdentityVerificationDetail, IdentityVerificationItem } from "@/lib/types";

export default function UserApprovalsPage() {
  const [items, setItems] = useState<IdentityVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<IdentityVerificationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listIdentityVerifications({
        limit: 50,
        status: statusFilter === "" ? "all" : statusFilter,
      });
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = async (submissionId: string) => {
    setSelectedId(submissionId);
    setDetailLoading(true);
    try {
      const res = await api.getIdentityVerification(submissionId);
      setDetail(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load verification");
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedId(null);
    setDetail(null);
  };

  const handleApprove = async () => {
    if (!selectedId) return;
    setActing(true);
    try {
      await api.approveIdentity(selectedId);
      toast.success("Member approved");
      closeModal();
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setActing(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedId) return;
    setActing(true);
    try {
      await api.rejectIdentity(selectedId, reason);
      toast.success("Re-submission requested");
      closeModal();
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Rejection failed");
    } finally {
      setActing(false);
    }
  };

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return !q || item.display_name.toLowerCase().includes(q);
  });

  return (
    <>
      <Header
        placeholder="Search by name, email or ID..."
        value={search}
        onChange={setSearch}
      />
      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">User Approvals Queue</h1>
            <p className="mt-2 text-text-secondary">
              Verify government identity documents and trust markers for new members.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </Button>
            <Button onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Queue
            </Button>
          </div>
        </div>

        {showFilters ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
              { label: "All", value: "" },
            ].map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full px-3 py-1 text-sm ${
                  statusFilter === filter.value
                    ? "bg-brand text-white"
                    : "bg-surface-inset text-text-muted"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-card border border-surface-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border bg-surface-inset/50 text-xs uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Date Joined</th>
                <th className="px-6 py-4 font-semibold">Verification</th>
                <th className="px-6 py-4 font-semibold">ID Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-text-secondary">
                    No pending verifications in the queue.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.submission.id}
                    className="border-b border-surface-border last:border-0 hover:bg-surface-inset/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-brand">
                          {initials(item.display_name)}
                        </div>
                        <div>
                          <p className="font-semibold text-brand-dark">{item.display_name}</p>
                          <p className="text-xs text-text-secondary">
                            {item.user_verification_level}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {formatDate(item.submission.submitted_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-inset">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{
                            width: `${item.submission.has_government_id && item.submission.has_selfie ? 100 : 50}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-status-mint px-3 py-1 text-xs font-medium capitalize text-brand-dark">
                        {item.submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => openModal(item.submission.id)}
                        className="rounded p-1 text-text-muted hover:bg-surface-inset"
                        aria-label="Review"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <VerificationModal
        open={!!selectedId}
        loading={detailLoading}
        detail={detail}
        onClose={closeModal}
        onApprove={handleApprove}
        onReject={handleReject}
        acting={acting}
      />
    </>
  );
}
