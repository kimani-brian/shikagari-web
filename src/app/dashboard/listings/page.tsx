"use client";

import { useState } from "react";
import Link from "next/link";
import { useMyListings } from "@/hooks/useListings";
import { formatKES, timeAgo } from "@/lib/utils";
import {
  PlusCircle, Edit3, Trash2, Eye,
  Search
} from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { ListingCard } from "@/types";

export default function MyListingsPage() {
  const [page,          setPage]          = useState(1);
  const [search,        setSearch]        = useState("");
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { listings, meta, loading, refetch } = useMyListings(page, 20);

  const filtered = listings.filter((l) => {
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await api.delete(`/listings/${id}`);
      toast.success("Listing deleted");
      refetch();
    } catch {
      toast.error("Failed to delete listing");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-neutral-900">My Listings</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {meta?.total_items ?? 0} total listings
          </p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            New Listing
          </Button>
        </Link>
      </div>

      {/* ── Filters bar ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-200  p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 border border-neutral-200 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your listings..."
              className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
            />
          </div>


        </div>
      </div>

      {/* ── Listings table ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-200  overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 p-5 animate-pulse">
                <div className="w-24 h-18 rounded-xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            variant="listings"
            title={search ? "No listings match your search" : "No listings yet"}
            description={
              search
                ? "Try a different search term"
                : "Create your first listing to start selling"
            }
            actionLabel="Create Listing"
            actionHref="/dashboard/listings/new"
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {/* Table header — desktop */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-neutral-50 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <span>Vehicle</span>
              <span>Price</span>
              <span>Status</span>
              <span>Listed</span>
              <span>Actions</span>
            </div>

            {filtered.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                isDeleting={deletingId === listing.id}
                onDeleteClick={() => setConfirmDelete(listing.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <Pagination
          page={page}
          totalPages={meta.total_pages}
          onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      )}

      {/* ── Delete confirmation modal ──────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-up">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-display font-bold text-neutral-900 text-center mb-2">Delete listing?</h3>
            <p className="text-sm text-neutral-500 text-center mb-6">
              This action cannot be undone. The listing will be permanently removed.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                fullWidth
                loading={deletingId === confirmDelete}
                onClick={() => handleDelete(confirmDelete)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Listing row ────────────────────────────────────────────────────────────────
function ListingRow({
  listing,
  isDeleting,
  onDeleteClick,
}: {
  listing:       ListingCard;
  isDeleting:    boolean;
  onDeleteClick: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-neutral-50 transition-colors">
      {/* Vehicle info */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
          {listing.thumbnail_url ? (
            <img
              src={listing.thumbnail_url.startsWith("http")
                ? listing.thumbnail_url
                : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}${listing.thumbnail_url}`
              }
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl"></div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-neutral-900 text-sm truncate">{listing.title}</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {listing.year} · {listing.make} {listing.model} · {listing.location}
          </p>
          <div className="flex items-center gap-3 mt-1.5 md:hidden">
            <span className="text-sm font-bold text-neutral-900">{formatKES(listing.price_kes)}</span>
          </div>
        </div>
      </div>

      {/* Price — desktop */}
      <div className="hidden md:block">
        <p className="font-bold text-neutral-900 text-sm">{formatKES(listing.price_kes)}</p>
      </div>



      {/* Date — desktop */}
      <div className="hidden md:block">
        <p className="text-xs text-neutral-500">{timeAgo(listing.created_at)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/listings/${listing.id}`}
          target="_blank"
          className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-slate-200 transition-colors"
          title="View listing"
        >
          <Eye className="w-4 h-4" />
        </Link>
        <Link
          href={`/dashboard/listings/${listing.id}/edit`}
          className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors"
          title="Edit listing"
        >
          <Edit3 className="w-4 h-4" />
        </Link>
        <button
          onClick={onDeleteClick}
          disabled={isDeleting}
          className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-600 hover:bg-red-100 transition-colors disabled:opacity-50"
          title="Delete listing"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}