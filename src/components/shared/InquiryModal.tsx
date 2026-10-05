"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { formatKES } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

const DEFAULT_MESSAGE = "Hi, is this car still available? Can we arrange a viewing?";
const MAX_LENGTH = 1000;

interface InquiryModalProps {
  listingId: string;
  /** Car the buyer is asking about, shown at the top of the modal. */
  vehicle: {
    title: string;
    priceKES: number;
  };
  /** Dealership or individual name, when it is known. */
  sellerName?: string | null;
  onClose: () => void;
  onSent?: () => void;
}

/**
 * Contact-seller popup. Shared by the car cards and the listing detail page so
 * a buyer can send an inquiry without leaving the page they are browsing.
 */
export default function InquiryModal({
  listingId,
  vehicle,
  sellerName,
  onClose,
  onSent,
}: InquiryModalProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);

  // Escape closes the popup the same way a backdrop click does.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSend = async () => {
    if (!isLoggedIn) {
      toast.error("Sign in to contact the seller");
      router.push("/login");
      return;
    }
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setSending(true);
      await api.post(`/listings/${listingId}/inquiries`, {
        message: trimmed.slice(0, MAX_LENGTH),
      });
      toast.success("Message sent");
      onSent?.();
      onClose();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
      toast.error(data?.message ?? "Could not send message");
    } finally {
      setSending(false);
    }
  };

  // Card grids animate in with a transform, and a transformed ancestor becomes
  // the containing block for `position: fixed`. Rendering into <body> keeps the
  // backdrop covering the whole viewport so clicking outside really closes.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/30" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Contact seller"
        className="relative bg-white rounded-2xl w-full max-w-md border border-neutral-200"
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Contact seller</h3>
            {sellerName && (
              <p className="text-xs text-neutral-500 mt-0.5">{sellerName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="mx-5 mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
          <p className="text-xs text-neutral-500 mb-0.5">Regarding</p>
          <p className="text-sm font-medium text-neutral-900 line-clamp-1">
            {vehicle.title}
          </p>
          <p className="text-sm font-semibold text-neutral-900">
            {formatKES(vehicle.priceKES)}
          </p>
        </div>

        <div className="p-5">
          <label htmlFor="inquiry-message" className="text-sm font-medium text-neutral-700 block mb-2">
            Message
          </label>
          <textarea
            id="inquiry-message"
            rows={4}
            maxLength={MAX_LENGTH}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 resize-none"
          />
          <p className="text-xs text-neutral-400 mt-1.5 text-right">
            {message.length} / {MAX_LENGTH}
          </p>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            loading={sending}
            onClick={handleSend}
            leftIcon={<Icon name="chat_bubble" size={18} />}
          >
            Send
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}