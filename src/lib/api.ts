import axios from "axios";
import { API_BASE_URL, isServer } from "./config";

const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

api.interceptors.request.use((config) => {
	if (!isServer) {
		const token = localStorage.getItem("shikagari_token");
		if (token) {
			config.headers = config.headers ?? {};
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (!isServer && error?.response?.status === 401) {
			localStorage.removeItem("shikagari_token");
			localStorage.removeItem("shikagari_user");
			if (!window.location.pathname.startsWith("/login")) {
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	}
);

export default api;
