"use client";

import { useCallback, useEffect, useState } from "react";
import auctionApi from "@/lib/auction";
import { AuctionLot, BuyingPower, PreBid } from "@/types/auction";

export function useAuctionLot(id: string) {
	const [lot, setLot] = useState<AuctionLot | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchLot = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await auctionApi.get(`/lots/${id}`);
			setLot(res.data.data ?? null);
		} catch {
			setError("Could not load this lot.");
			setLot(null);
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetchLot();
	}, [fetchLot]);

	return { lot, loading, error, refetch: fetchLot };
}

export function useBuyingPower() {
	const [power, setPower] = useState<BuyingPower | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchPower = useCallback(async () => {
		try {
			setLoading(true);
			const res = await auctionApi.get("/me/buying-power");
			setPower(res.data.data ?? null);
		} catch {
			setPower(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPower();
	}, [fetchPower]);

	return { power, loading, refetch: fetchPower };
}

export function useMyPreBids() {
	const [bids, setBids] = useState<PreBid[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchBids = useCallback(async () => {
		try {
			setLoading(true);
			const res = await auctionApi.get("/me/pre-bids");
			setBids(res.data.data ?? []);
		} catch {
			setBids([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchBids();
	}, [fetchBids]);

	return { bids, loading, refetch: fetchBids };
}