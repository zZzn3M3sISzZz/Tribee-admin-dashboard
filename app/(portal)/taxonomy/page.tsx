"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { kindLabel, slugifyCatalogId, TAXONOMY_TABS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import type { CatalogItem, TaxonomyKind } from "@/lib/types";

function TaxonomyCard({ item, kind }: { item: CatalogItem; kind: TaxonomyKind }) {
  return (
    <article className="flex flex-col rounded-card border border-surface-border bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-mint-bg text-lg font-bold text-brand">
          {item.label.charAt(0).toUpperCase()}
        </div>
        <span className="rounded-full bg-surface-inset px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {kindLabel(kind)}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-brand-dark">{item.label}</h3>
      {item.subtitle ? (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
          {item.subtitle}
        </p>
      ) : (
        <p className="mt-2 flex-1 text-sm text-text-muted">ID: {item.id}</p>
      )}
      <div className="mt-6 flex items-center justify-between border-t border-surface-border pt-4">
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <Users className="h-3.5 w-3.5" />
          {item.user_count.toLocaleString()} users
        </span>
        <span className="text-xs text-text-disabled">Sort {item.sort_order}</span>
      </div>
    </article>
  );
}

function InsightCard({ items, activeTab }: { items: CatalogItem[]; activeTab: TaxonomyKind }) {
  const total = items.reduce((sum, item) => sum + item.user_count, 0);
  const top = [...items].sort((a, b) => b.user_count - a.user_count)[0];

  return (
    <article className="flex flex-col justify-between rounded-card bg-brand p-6 text-white">
      <div>
        <h3 className="text-lg font-semibold text-status-mint">Category Insight</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/80">
          {top
            ? `"${top.label}" is the most selected ${kindLabel(activeTab).toLowerCase()} with ${top.user_count.toLocaleString()} mapped users.`
            : "Add categories to start tracking onboarding selections."}
        </p>
      </div>
      <div className="mt-8">
        <p className="text-3xl font-bold">{total.toLocaleString()}</p>
        <p className="mt-1 text-xs uppercase tracking-wider text-white/60">
          Total {TAXONOMY_TABS.find((t) => t.id === activeTab)?.label} Mapped
        </p>
      </div>
    </article>
  );
}

export default function TaxonomyPage() {
  const [activeTab, setActiveTab] = useState<TaxonomyKind>("interest");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [catalogId, setCatalogId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listCatalog(activeTab);
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load taxonomy");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.subtitle ?? "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const openModal = () => {
    setLabel("");
    setSubtitle("");
    setCatalogId("");
    setShowModal(true);
  };

  const handleCreate = async () => {
    const trimmedLabel = label.trim();
    const id = (catalogId || slugifyCatalogId(trimmedLabel)).trim();
    if (!trimmedLabel || !id) {
      toast.error("Label is required");
      return;
    }
    setSaving(true);
    try {
      await api.createCatalogItem(activeTab, {
        id,
        label: trimmedLabel,
        subtitle: activeTab === "comfort" ? subtitle.trim() || undefined : undefined,
        sort_order: items.length,
      });
      toast.success(`${kindLabel(activeTab)} option created`);
      setShowModal(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create option");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header placeholder="Search taxonomies..." value={search} onChange={setSearch} />
      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
              Taxonomy Management
            </h1>
            <p className="mt-2 text-text-secondary">
              Curate onboarding categories used for user matching.
            </p>
          </div>
          <Button onClick={openModal}>
            <Plus className="h-4 w-4" />
            Add New Option
          </Button>
        </div>

        <div className="mb-8 flex gap-8 border-b border-surface-border">
          {TAXONOMY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-b-2 border-brand text-brand"
                  : "text-text-muted hover:text-brand-dark"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <TaxonomyCard key={item.id} item={item} kind={activeTab} />
            ))}
            <InsightCard items={items} activeTab={activeTab} />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-text-muted">
            No categories match your search.
          </p>
        )}
      </main>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-card border border-surface-border bg-white p-6 shadow-card">
            <h2 className="text-xl font-semibold text-brand-dark">
              Add {kindLabel(activeTab)}
            </h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Label
                </label>
                <Input
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                    if (!catalogId) setCatalogId(slugifyCatalogId(e.target.value));
                  }}
                  placeholder="e.g. Coffee Culture"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Catalog ID
                </label>
                <Input
                  value={catalogId}
                  onChange={(e) => setCatalogId(slugifyCatalogId(e.target.value))}
                  placeholder="coffee_culture"
                />
              </div>
              {activeTab === "comfort" ? (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Subtitle
                  </label>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Short helper text for members"
                  />
                </div>
              ) : null}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Saving…" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
