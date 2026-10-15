import axios from "axios";
import { isServer } from "./config";

// Base URL of the auction engine (shikagari-auction, Phase 1). The engine
// verifies the marketplace token we already hold, so no second login: the
// same Bearer token authenticates both services ("direct trust" SSO).
const AUCTION_API_URL =
	process.env.NEXT_PUBLIC_AUCTION_API_URL ?? "http://localhost:8090/api/v1";

const auctionApi = axios.create({
	baseURL: AUCTION_API_URL,
	timeout: 15000,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

auctionApi.interceptors.request.use((config) => {
	if (!isServer) {
		const token = localStorage.getItem("shikagari_token");
		if (token) {
			config.headers = config.headers ?? {};
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

// WebSocket URL derived from the API base: http(s) becomes ws(s), and the
// marketplace token travels as a query parameter because sockets cannot set
// headers. The token is never logged.
export function auctionSocketUrl(token?: string | null) {
	const ws = AUCTION_API_URL.replace(/^http/, "ws");
	return token ? `${ws}/ws?token=${encodeURIComponent(token)}` : `${ws}/ws`;
}

export default auctionApi;
export { AUCTION_API_URL };