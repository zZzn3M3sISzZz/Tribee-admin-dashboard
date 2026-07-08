import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { withBasePath } from "@/lib/base-path";

type LegalPageShellProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

export function LegalPageShell({ title, updated, children }: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-surface px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href={withBasePath("/login")}
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>

        <article className="admin-card p-10">
          <header className="mb-8 border-b border-surface-border pb-6">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-brand">offScreen</p>
            <h1 className="mt-2 font-mono text-3xl font-semibold tracking-tight text-text-primary">{title}</h1>
            <p className="mt-2 text-sm text-text-secondary">Last updated: {updated}</p>
          </header>

          <div className="prose-legal space-y-6 text-sm leading-relaxed text-text-primary">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-base font-semibold text-text-primary">{title}</h2>
      <div className="space-y-3 text-text-secondary">{children}</div>
    </section>
  );
}
