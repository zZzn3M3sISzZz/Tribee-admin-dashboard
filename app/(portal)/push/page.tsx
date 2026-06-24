"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Bell, ImagePlus, Loader2, Send, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  PushBroadcastAction,
  PushBroadcastAudience,
  PushBroadcastCampaign,
  PushBroadcastResult,
} from "@/lib/types";

const BROADCAST_ALL_CONFIRM_PHRASE = "SEND TO ALL";

const DESTINATIONS: { value: PushBroadcastAction; label: string; description: string }[] = [
  {
    value: "open_explore",
    label: "Explore",
    description: "Opens the Explore tab when the notification is tapped.",
  },
  {
    value: "open_community",
    label: "Community",
    description: "Opens the Community feed.",
  },
  {
    value: "open_connections",
    label: "Connections",
    description: "Opens the Connections tab.",
  },
  {
    value: "open_create_experience",
    label: "Create experience",
    description: "Opens the host event / create experience flow.",
  },
  {
    value: "open_profile",
    label: "Profile",
    description: "Opens the member profile tab.",
  },
];

const TITLE_MAX = 100;
const BODY_MAX = 500;

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
      {children}
      {required && <span className="text-brand"> *</span>}
    </label>
  );
}

function destinationLabel(action: PushBroadcastAction): string {
  return DESTINATIONS.find((item) => item.value === action)?.label ?? action;
}

export default function PushNotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [action, setAction] = useState<PushBroadcastAction>("open_explore");
  const [audience, setAudience] = useState<PushBroadcastAudience>("test");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<PushBroadcastResult | null>(null);
  const [campaigns, setCampaigns] = useState<PushBroadcastCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  const loadCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const result = await api.listPushBroadcasts({ limit: 20 });
      setCampaigns(result.campaigns);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load campaign history.");
    } finally {
      setCampaignsLoading(false);
    }
  };

  useEffect(() => {
    void loadCampaigns();
  }, []);

  useEffect(() => {
    return () => {
      if (previewFileUrl) URL.revokeObjectURL(previewFileUrl);
    };
  }, [previewFileUrl]);

  const previewImage = useMemo(() => {
    const trimmed = imageUrl.trim();
    if (trimmed) return trimmed;
    return previewFileUrl;
  }, [imageUrl, previewFileUrl]);

  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  const canCompose =
    trimmedTitle.length > 0 &&
    trimmedTitle.length <= TITLE_MAX &&
    trimmedBody.length > 0 &&
    trimmedBody.length <= BODY_MAX;

  const onPickImage = async (file: File | null) => {
    if (previewFileUrl) {
      URL.revokeObjectURL(previewFileUrl);
      setPreviewFileUrl(null);
    }
    if (!file) {
      setSelectedImageName(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2 MB or smaller.");
      return;
    }

    setPreviewFileUrl(URL.createObjectURL(file));
    setSelectedImageName(file.name);
    setImageUploading(true);
    try {
      const result = await api.uploadPushBroadcastImage(file);
      setImageUrl(result.image_url);
      toast.success("Image uploaded.");
    } catch (err) {
      setImageUrl("");
      setSelectedImageName(null);
      toast.error(err instanceof Error ? err.message : "Could not upload image.");
    } finally {
      setImageUploading(false);
    }
  };

  const clearImage = () => {
    if (previewFileUrl) URL.revokeObjectURL(previewFileUrl);
    setPreviewFileUrl(null);
    setImageUrl("");
    setSelectedImageName(null);
  };

  const buildPayload = () => {
    const payloadImageUrl = imageUrl.trim();
    return {
      title: trimmedTitle,
      body: trimmedBody,
      image_url: payloadImageUrl || null,
      action,
      action_params: {},
      audience,
      confirm_phrase:
        audience === "all" && confirmPhrase.trim() === BROADCAST_ALL_CONFIRM_PHRASE
          ? BROADCAST_ALL_CONFIRM_PHRASE
          : undefined,
    };
  };

  const allAudienceConfirmed =
    audience !== "all" || confirmPhrase.trim() === BROADCAST_ALL_CONFIRM_PHRASE;

  const openConfirm = () => {
    if (!canCompose) {
      toast.error("Add a title and message before sending.");
      return;
    }
    if (imageUploading) {
      toast.error("Wait for the image upload to finish.");
      return;
    }
    if (previewFileUrl && !imageUrl.trim()) {
      toast.error("Image upload failed or is still in progress.");
      return;
    }
    if (imageUrl.trim() && !imageUrl.trim().startsWith("https://")) {
      toast.error("Image URL must start with https://");
      return;
    }
    setShowConfirm(true);
    if (audience !== "all") {
      setConfirmPhrase("");
    }
  };

  const sendBroadcast = async () => {
    setSending(true);
    try {
      const result = await api.sendPushBroadcast(buildPayload());
      setLastResult(result);
      setShowConfirm(false);
      setConfirmPhrase("");
      void loadCampaigns();
      if (result.status === "queued") {
        toast.success(
          `Campaign queued for ${result.target_tokens} device${result.target_tokens === 1 ? "" : "s"}. The worker will deliver shortly.`
        );
      } else {
        toast.success(
          `Push sent to ${result.sent_count} device${result.sent_count === 1 ? "" : "s"}.`
        );
        if (result.failed_count > 0) {
          toast.warning(`${result.failed_count} delivery attempt(s) failed.`);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send push notification.");
    } finally {
      setSending(false);
    }
  };

  const confirmMessage =
    audience === "all"
      ? `Type ${BROADCAST_ALL_CONFIRM_PHRASE} below to confirm a broadcast to all opted-in users with registered devices.`
      : "Send this push notification to the configured test users?";

  const formatTimestamp = (value?: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleString();
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "queued":
      case "sending":
        return "bg-amber-100 text-amber-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-surface-inset text-text-secondary";
    }
  };

  return (
    <>
      <Header placeholder="Search push campaigns..." />
      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Push Notifications</h1>
            <p className="mt-2 max-w-2xl text-text-secondary">
              Compose a broadcast push for Tribee members. Test sends use{" "}
              <code className="rounded bg-surface-inset px-1.5 py-0.5 text-xs">
                PUSH_BROADCAST_TEST_USER_IDS
              </code>{" "}
              on the API. All-user sends require{" "}
              <code className="rounded bg-surface-inset px-1.5 py-0.5 text-xs">
                PUSH_BROADCAST_ALLOW_ALL=true
              </code>
              .
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <div className="rounded-card border border-surface-border bg-white p-6">
              <h2 className="font-semibold text-brand-dark">Compose notification</h2>

              <div className="mt-6 space-y-5">
                <div>
                  <FieldLabel required>Title</FieldLabel>
                  <Input
                    value={title}
                    maxLength={TITLE_MAX}
                    placeholder="e.g. New experiences this week"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-text-secondary">
                    {title.length}/{TITLE_MAX}
                  </p>
                </div>

                <div>
                  <FieldLabel required>Message</FieldLabel>
                  <Textarea
                    value={body}
                    maxLength={BODY_MAX}
                    placeholder="Short message members will see in the notification tray."
                    onChange={(e) => setBody(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-text-secondary">
                    {body.length}/{BODY_MAX}
                  </p>
                </div>

                <div>
                  <FieldLabel>Image</FieldLabel>
                  <p className="mb-3 text-xs text-text-secondary">
                    Optional rich notification image (max 2 MB). Upload from your computer or paste
                    a public HTTPS URL.
                  </p>
                  <Input
                    value={imageUrl}
                    placeholder="Upload below or paste https://..."
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-brand-dark",
                        imageUploading && "pointer-events-none opacity-60"
                      )}
                    >
                      {imageUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                      {imageUploading ? "Uploading…" : "Upload image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={imageUploading}
                        onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    {(imageUrl || previewFileUrl) && (
                      <button
                        type="button"
                        className="text-sm font-medium text-text-secondary hover:text-brand-dark"
                        onClick={clearImage}
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                  {selectedImageName && (
                    <p className="mt-2 text-xs text-text-secondary">Selected: {selectedImageName}</p>
                  )}
                </div>

                <div>
                  <FieldLabel required>Destination</FieldLabel>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {DESTINATIONS.map((item) => {
                      const selected = action === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setAction(item.value)}
                          className={cn(
                            "rounded-lg border px-4 py-3 text-left transition-colors",
                            selected
                              ? "border-brand bg-brand-tint"
                              : "border-surface-border bg-surface hover:bg-surface-inset"
                          )}
                        >
                          <p className="text-sm font-semibold text-brand-dark">{item.label}</p>
                          <p className="mt-1 text-xs text-text-secondary">{item.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <FieldLabel required>Audience</FieldLabel>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(
                      [
                        {
                          value: "test" as const,
                          label: "Test users",
                          description:
                            "Sends only to user IDs configured in PUSH_BROADCAST_TEST_USER_IDS.",
                        },
                        {
                          value: "all" as const,
                          label: "All users",
                          description:
                            "Broadcast to every opted-in user with a registered device token.",
                        },
                      ] as const
                    ).map((item) => {
                      const selected = audience === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setAudience(item.value)}
                          className={cn(
                            "rounded-lg border px-4 py-3 text-left transition-colors",
                            selected
                              ? "border-brand bg-brand-tint"
                              : "border-surface-border bg-surface hover:bg-surface-inset"
                          )}
                        >
                          <p className="text-sm font-semibold text-brand-dark">{item.label}</p>
                          <p className="mt-1 text-xs text-text-secondary">{item.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button disabled={!canCompose || imageUploading} onClick={openConfirm}>
                  <Send className="h-4 w-4" />
                  Review & send
                </Button>
              </div>
            </div>

            {lastResult && (
              <section className="rounded-card border border-emerald-200 bg-emerald-50/60 p-6">
                <h2 className="font-semibold text-brand-dark">Last send result</h2>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-text-secondary">Campaign ID</dt>
                    <dd className="font-mono text-xs">{lastResult.campaign_id}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Audience</dt>
                    <dd className="font-medium capitalize">{lastResult.audience}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Target users</dt>
                    <dd className="font-medium">{lastResult.target_users}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Target devices</dt>
                    <dd className="font-medium">{lastResult.target_tokens}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Sent</dt>
                    <dd className="font-medium text-emerald-700">{lastResult.sent_count}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Failed</dt>
                    <dd className="font-medium">{lastResult.failed_count}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Status</dt>
                    <dd className="font-medium capitalize">{lastResult.status}</dd>
                  </div>
                </dl>
              </section>
            )}

            <section className="rounded-card border border-surface-border bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold text-brand-dark">Campaign history</h2>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={campaignsLoading}
                  onClick={() => void loadCampaigns()}
                >
                  {campaignsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>

              {campaignsLoading && campaigns.length === 0 ? (
                <div className="mt-6 flex items-center gap-2 text-sm text-text-secondary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading campaigns…
                </div>
              ) : campaigns.length === 0 ? (
                <p className="mt-4 text-sm text-text-secondary">No campaigns yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-text-secondary">
                        <th className="px-2 py-2 font-semibold">Created</th>
                        <th className="px-2 py-2 font-semibold">Title</th>
                        <th className="px-2 py-2 font-semibold">Audience</th>
                        <th className="px-2 py-2 font-semibold">Status</th>
                        <th className="px-2 py-2 font-semibold">Devices</th>
                        <th className="px-2 py-2 font-semibold">Sent</th>
                        <th className="px-2 py-2 font-semibold">Failed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr
                          key={campaign.id}
                          className="border-b border-surface-border/70 last:border-0"
                        >
                          <td className="px-2 py-3 whitespace-nowrap text-text-secondary">
                            {formatTimestamp(campaign.created_at)}
                          </td>
                          <td className="px-2 py-3">
                            <p className="font-medium text-brand-dark">{campaign.title}</p>
                            <p className="mt-0.5 text-xs text-text-secondary">
                              {destinationLabel(campaign.action)}
                            </p>
                          </td>
                          <td className="px-2 py-3 capitalize">{campaign.audience}</td>
                          <td className="px-2 py-3">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                                statusBadgeClass(campaign.status)
                              )}
                            >
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-2 py-3">{campaign.target_tokens}</td>
                          <td className="px-2 py-3">{campaign.sent_count}</td>
                          <td className="px-2 py-3">{campaign.failed_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </section>

          <aside className="space-y-4">
            <div className="rounded-card border border-surface-border bg-white p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-dark">
                <Smartphone className="h-4 w-4" />
                Preview
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                Approximate appearance on a member&apos;s device.
              </p>

              <div className="mt-5 rounded-2xl border border-surface-border bg-surface-inset p-4">
                <div className="rounded-xl border border-surface-border bg-white p-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                        offScreen
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-brand-dark">
                        {trimmedTitle || "Notification title"}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {trimmedBody || "Your message will appear here."}
                      </p>
                    </div>
                  </div>
                  {previewImage && (
                    <div className="relative mt-3 aspect-[2/1] overflow-hidden rounded-lg bg-surface">
                      <Image
                        src={previewImage}
                        alt="Push preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="text-text-secondary">Tap opens</dt>
                  <dd className="font-medium">{destinationLabel(action)}</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Audience</dt>
                  <dd className="font-medium capitalize">{audience}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div
              className="w-full max-w-lg rounded-card border border-surface-border bg-white p-6 shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="push-confirm-title"
            >
              <h2 id="push-confirm-title" className="text-lg font-semibold text-brand-dark">
                Confirm broadcast
              </h2>
              <p className="mt-2 text-sm text-text-secondary">{confirmMessage}</p>

              <div className="mt-4 rounded-lg border border-surface-border bg-surface-inset p-4 text-sm">
                <p className="font-semibold text-brand-dark">{trimmedTitle}</p>
                <p className="mt-1 text-text-secondary">{trimmedBody}</p>
                <p className="mt-3 text-xs text-text-secondary">
                  Destination: {destinationLabel(action)} · Audience: {audience}
                </p>
              </div>

              {audience === "all" && (
                <div className="mt-4">
                  <FieldLabel required>Confirmation phrase</FieldLabel>
                  <Input
                    value={confirmPhrase}
                    placeholder={BROADCAST_ALL_CONFIRM_PHRASE}
                    onChange={(e) => setConfirmPhrase(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-text-secondary">
                    Type <strong>{BROADCAST_ALL_CONFIRM_PHRASE}</strong> exactly to enable send.
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button
                  variant="outline"
                  disabled={sending}
                  onClick={() => {
                    setShowConfirm(false);
                    setConfirmPhrase("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={sending || (audience === "all" && !allAudienceConfirmed)}
                  onClick={sendBroadcast}
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send push
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
