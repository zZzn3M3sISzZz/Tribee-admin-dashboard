"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  kindLabel,
  MOCK_TAXONOMY,
  TAXONOMY_TABS,
  type TaxonomyItem,
  type TaxonomyKind,
} from "@/lib/mock-taxonomy";

function TaxonomyCard({ item }: { item: TaxonomyItem }) {
  return (
    <article className="flex flex-col rounded-card border border-surface-border bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-mint-bg text-xl">
          {item.icon}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            className="rounded p-2 text-text-muted hover:bg-surface-inset"
            aria-label={`Edit ${item.title}`}
            onClick={() => toast.message("Edit coming soon")}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded p-2 text-text-muted hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${item.title}`}
            onClick={() => toast.message("Delete coming soon")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-brand-dark">{item.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
        {item.description}
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-surface-border pt-4">
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <Users className="h-3.5 w-3.5" />
          {item.userCount.toLocaleString()} Users
        </span>
        <span className="rounded-full bg-surface-inset px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {kindLabel(item.kind)}
        </span>
      </div>
    </article>
  );
}

function InsightCard({ activeTab }: { activeTab: TaxonomyKind }) {
  const total = MOCK_TAXONOMY[activeTab].reduce((sum, item) => sum + item.userCount, 0);
  const top = MOCK_TAXONOMY[activeTab][0];

  return (
    <article className="flex flex-col justify-between rounded-card bg-brand p-6 text-white">
      <div>
        <h3 className="text-lg font-semibold text-status-mint">Category Insight</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/80">
          {top
            ? `"${top.title}" is the most selected ${kindLabel(activeTab).toLowerCase()} with ${top.userCount.toLocaleString()} mapped users.`
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

  const items = useMemo(() => {
    const list = MOCK_TAXONOMY[activeTab];
    const q = search.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [activeTab, search]);

  return (
    <>
      <Header
        placeholder="Search taxonomies..."
        value={search}
        onChange={setSearch}
      />
      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
              Taxonomy Management
            </h1>
            <p className="mt-2 text-text-secondary">
              Curate and organize onboarding categories for optimal user matching.
            </p>
          </div>
          <Button onClick={() => toast.message("Add option coming soon")}>
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

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <TaxonomyCard key={item.id} item={item} />
          ))}
          <InsightCard activeTab={activeTab} />
        </div>

        {items.length === 0 && (
          <p className="mt-8 text-center text-sm text-text-muted">
            No categories match your search.
          </p>
        )}
      </main>
    </>
  );
}
