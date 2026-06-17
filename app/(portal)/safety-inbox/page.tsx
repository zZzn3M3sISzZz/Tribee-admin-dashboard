"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDate, initials } from "@/lib/utils";
import type { SafetyInboxMessage, SafetyInboxThread } from "@/lib/types";

export default function SafetyInboxPage() {
  const [threads, setThreads] = useState<SafetyInboxThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SafetyInboxMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      const res = await api.listSafetyInbox();
      setThreads(res.items);
      if (!selectedId && res.items.length > 0) {
        setSelectedId(res.items[0].thread_id);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load safety inbox");
    } finally {
      setLoadingThreads(false);
    }
  }, [selectedId]);

  const loadMessages = useCallback(async (threadId: string) => {
    setLoadingMessages(true);
    try {
      const res = await api.listSafetyInboxMessages(threadId, { limit: 100 });
      setMessages([...res.messages].reverse());
      await api.markSafetyInboxRead(threadId);
      loadThreads();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, [loadThreads]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId);
    }
  }, [selectedId, loadMessages]);

  const sendReply = async () => {
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    try {
      const message = await api.replySafetyInbox(selectedId, reply.trim());
      setMessages((prev) => [...prev, message]);
      setReply("");
      loadThreads();
      toast.success("Reply sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const selectedThread = threads.find((t) => t.thread_id === selectedId);

  return (
    <>
      <Header placeholder="Search safety inbox…" />
      <main className="flex flex-1 flex-col overflow-hidden px-8 py-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-brand-dark">Safety Inbox</h1>
          <p className="mt-2 text-text-secondary">
            Live support chats from members who used Emergency Support in the app.
          </p>
        </div>
        <div className="flex min-h-0 flex-1 overflow-hidden rounded-card border border-surface-border bg-white">
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-surface-border">
          <div className="border-b border-surface-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Support threads
          </div>
          {loadingThreads ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          ) : threads.length === 0 ? (
            <p className="px-4 py-8 text-sm text-text-secondary">No safety support chats yet.</p>
          ) : (
            <ul>
              {threads.map((thread) => (
                <li key={thread.thread_id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(thread.thread_id)}
                    className={`w-full border-b border-surface-border px-4 py-3 text-left transition-colors hover:bg-surface-inset/40 ${
                      selectedId === thread.thread_id ? "bg-brand-tint/60" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-brand-dark">
                        {thread.member_display_name}
                      </span>
                      {thread.unread_count > 0 ? (
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          {thread.unread_count}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-xs text-text-secondary">
                      {thread.last_message_body ?? "No messages"}
                    </p>
                    {thread.last_message_at ? (
                      <p className="mt-1 text-[10px] text-text-muted">
                        {formatDate(thread.last_message_at)}
                      </p>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="flex flex-1 flex-col bg-surface-inset/20">
          {!selectedThread ? (
            <div className="flex flex-1 items-center justify-center text-sm text-text-secondary">
              Select a thread to view messages
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-surface-border bg-white px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {initials(selectedThread.member_display_name)}
                </div>
                <div>
                  <p className="font-semibold text-brand-dark">
                    {selectedThread.member_display_name}
                  </p>
                  <p className="text-xs text-text-secondary">Member ID: {selectedThread.member_id}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
                {loadingMessages ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-brand" />
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        message.is_safety_team
                          ? "ml-auto bg-brand text-white"
                          : "bg-white text-brand-dark shadow-sm"
                      }`}
                    >
                      <p>{message.body}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          message.is_safety_team ? "text-white/70" : "text-text-muted"
                        }`}
                      >
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-surface-border bg-white p-4">
                <div className="flex gap-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Reply as Tribee Safety Team…"
                    rows={2}
                    className="flex-1 resize-none rounded-lg border border-surface-border px-3 py-2 text-sm"
                  />
                  <Button onClick={sendReply} disabled={sending || !reply.trim()}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
        </div>
      </main>
    </>
  );
}
