const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

if (!rawBaseUrl) {
	throw new Error(
		"NEXT_PUBLIC_API_URL is not defined. Set it in .env.local (e.g. http://localhost:8080/api/v1)."
	);
}

const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");

export const API_BASE_URL = normalizedBaseUrl;

export const API_ORIGIN = normalizedBaseUrl.replace(/\/api\/v1$/, "");

export const isServer = typeof window === "undefined";
