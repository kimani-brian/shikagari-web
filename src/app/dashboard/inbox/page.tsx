"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { formatKES, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MessageSquare, Send, X, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/shared/EmptyState";
import toast from "react-hot-toast";
import { Inquiry } from "@/types";

export default function InboxPage() {
  const [inquiries,    setInquiries]    = useState<Inquiry[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState<Inquiry | null>(null);
  const [reply,        setReply]        = useState("");
  const [sending,      setSending]      = useState(false);
  const [tab,          setTab]          = useState<"inbox" | "sent">("inbox");

  useEffect(() => {
    fetchInquiries();
  }, [tab]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const endpoint = tab === "inbox" ? "/inquiries/inbox" : "/inquiries/sent";
      const res      = await api.get(`${endpoint}?page=1&per_page=50`);
      setInquiries(res.data.data ?? []);
    } catch {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    try {
      setSending(true);
      await api.patch(`/inquiries/${selected.id}/reply`, { reply: reply.trim() });
      toast.success("Reply sent!");
      setReply("");
      setSelected(null);
      fetchInquiries();
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleClose = async (id: string) => {
    try {
      await api.patch(`/inquiries/${id}/status`, { status: "closed" });
      toast.success("Inquiry closed");
      fetchInquiries();
      if (selected?.id === id) setSelected(null);
    } catch {
      toast.error("Failed to close inquiry");
    }
  };

  const statusColor = (s: string) => ({
    open:    "warning",
    replied: "success",
    closed:  "default",
  }[s] ?? "default") as any;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-bold text-slate-900">Messages</h1>
        <p className="text-sm text-slate-500 mt-0.5">Buyer inquiries about your listings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl p-1 border border-slate-100 shadow-card w-fit">
        {(["inbox", "sent"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
              tab === t
                ? "bg-brand-700 text-white"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {t === "inbox" ? "Received" : "Sent"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <EmptyState variant="inquiries" />
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className={cn(
                "bg-white rounded-2xl border border-slate-100 shadow-card p-5",
                "hover:border-brand-200 transition-all cursor-pointer",
                selected?.id === inq.id && "border-brand-300 ring-1 ring-brand-200"
              )}
              onClick={() => { setSelected(inq); setReply(""); }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                    <span className="font-bold text-brand-700 text-sm">
                      {(tab === "inbox" ? inq.buyer : inq.seller)?.full_name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 text-sm">
                        {tab === "inbox" ? inq.buyer?.full_name : inq.seller?.full_name}
                      </p>
                      <Badge variant={statusColor(inq.status)} size="xs" dot>
                        {inq.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-brand-700 font-medium mt-0.5">
                      Re: {inq.listing?.title}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{inq.message}</p>
                    {inq.reply && (
                      <p className="text-xs text-slate-400 mt-1.5 italic line-clamp-1">
                        Reply: {inq.reply}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{timeAgo(inq.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Reply modal ──────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-up">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-display font-bold text-slate-900">
                  {tab === "inbox" ? "Reply to inquiry" : "Inquiry detail"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  From: {tab === "inbox" ? selected.buyer?.full_name : selected.seller?.full_name}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Listing ref */}
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-0.5">Regarding</p>
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {selected.listing?.title}
                </p>
              </div>

              {/* Original message */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 leading-relaxed">
                  {selected.message}
                </p>
              </div>

              {/* Existing reply */}
              {selected.reply && (
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                    Your Reply
                  </p>
                  <p className="text-sm text-slate-700 bg-emerald-50 rounded-xl p-4 leading-relaxed border border-emerald-100">
                    {selected.reply}
                  </p>
                </div>
              )}

              {/* Reply input — only for inbox + open/replied */}
              {tab === "inbox" && selected.status !== "closed" && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    {selected.reply ? "Update Reply" : "Your Reply"}
                  </label>
                  <textarea
                    rows={3}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-3">
              {tab === "inbox" && selected.status !== "closed" && (
                <>
                  <Button
                    variant="danger-ghost"
                    size="sm"
                    onClick={() => handleClose(selected.id)}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    loading={sending}
                    onClick={handleReply}
                    leftIcon={<Send className="w-4 h-4" />}
                    disabled={!reply.trim()}
                  >
                    Send Reply
                  </Button>
                </>
              )}
              {(tab === "sent" || selected.status === "closed") && (
                <Button variant="secondary" fullWidth onClick={() => setSelected(null)}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}