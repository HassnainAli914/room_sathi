/**
 * API Service for communicating with FastAPI backend
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
    }

    setAuthToken(token: string) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    clearAuthToken() {
        delete this.client.defaults.headers.common['Authorization'];
    }

    // ============================================
    // Auth Endpoints
    // ============================================
    async signUp(email: string, password: string, fullName: string, role: string) {
        const response = await this.client.post('/auth/signup', {
            email,
            password,
            full_name: fullName,
            role,
        });
        return response.data;
    }

    async signIn(email: string, password: string) {
        const response = await this.client.post('/auth/signin', {
            email,
            password,
        });
        return response.data;
    }

    async signOut() {
        const response = await this.client.post('/auth/signout');
        return response.data;
    }

    async getCurrentUser(userId: string) {
        const response = await this.client.get(`/auth/me?user_id=${userId}`);
        return response.data;
    }

    // ============================================
    // Profile Endpoints
    // ============================================
    async getProfile(userId: string) {
        const response = await this.client.get(`/profiles/${userId}`);
        return response.data;
    }

    async updateProfile(userId: string, data: any) {
        const response = await this.client.patch(`/profiles/${userId}`, data);
        return response.data;
    }

    // ============================================
    // Listings Endpoints
    // ============================================
    async getListings(filters?: any) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }
        const response = await this.client.get(`/listings?${params.toString()}`);
        return response.data;
    }

    async getListing(listingId: string) {
        const response = await this.client.get(`/listings/${listingId}`);
        return response.data;
    }

    async getSellerListings(sellerId: string) {
        const response = await this.client.get(`/listings/seller/${sellerId}`);
        return response.data;
    }

    async createListing(sellerId: string, data: any) {
        const response = await this.client.post(`/listings?seller_id=${sellerId}`, data);
        return response.data;
    }

    async updateListing(listingId: string, sellerId: string, data: any) {
        const response = await this.client.put(
            `/listings/${listingId}?seller_id=${sellerId}`,
            data
        );
        return response.data;
    }

    async deleteListing(listingId: string, sellerId: string) {
        const response = await this.client.delete(
            `/listings/${listingId}?seller_id=${sellerId}`
        );
        return response.data;
    }

    async saveListing(listingId: string, userId: string) {
        const response = await this.client.post(
            `/listings/${listingId}/save?user_id=${userId}`
        );
        return response.data;
    }

    async unsaveListing(listingId: string, userId: string) {
        const response = await this.client.delete(
            `/listings/${listingId}/save?user_id=${userId}`
        );
        return response.data;
    }

    async getSavedListings(userId: string) {
        const response = await this.client.get(`/listings/saved/${userId}`);
        return response.data;
    }

    // ============================================
    // AI Agent Endpoints
    // ============================================
    async parseProfile(rawInput: string, userId: string) {
        const response = await this.client.post('/agents/parse-profile', {
            raw_input: rawInput,
            user_id: userId,
        });
        return response.data;
    }

    async scoreMatch(buyerId: string, sellerId: string, listingId?: string) {
        const response = await this.client.post('/agents/score-match', {
            buyer_id: buyerId,
            seller_id: sellerId,
            listing_id: listingId,
        });
        return response.data;
    }

    async detectRedFlags(buyerId: string, sellerId: string, listingId?: string) {
        const response = await this.client.post('/agents/detect-redflags', {
            buyer_id: buyerId,
            seller_id: sellerId,
            listing_id: listingId,
        });
        return response.data;
    }

    async getWingmanMessage(
        buyerId: string,
        sellerId: string,
        compatibilityScore: number,
        redFlags?: any[]
    ) {
        const response = await this.client.post('/agents/wingman', {
            buyer_id: buyerId,
            seller_id: sellerId,
            compatibility_score: compatibilityScore,
            red_flags: redFlags || [],
        });
        return response.data;
    }

    async getRecommendations(buyerId: string, limit?: number, filters?: any) {
        const response = await this.client.post('/agents/recommend-rooms', {
            buyer_id: buyerId,
            limit: limit || 10,
            filters,
        });
        return response.data;
    }

    async getAgentLogs(matchId: string) {
        const response = await this.client.get(`/agents/logs/${matchId}`);
        return response.data;
    }

    // Convenience properties for organized access
    profiles = {
        get: (userId: string) => this.getProfile(userId),
        update: (userId: string, data: any) => this.updateProfile(userId, data),
    };
}

export const api = new ApiService();
export default api;
