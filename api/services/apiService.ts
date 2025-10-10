// api/services/apiService.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

class ApiService {
  private client: AxiosInstance;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";

    const config: ApiConfig = {
      baseURL: this.isProduction
        ? process.env.API_BASE_URL || "https://api.skygenesisenterprise.com"
        : "", // En développement, on n'utilise pas d'API externe
      timeout: 30000, // 30 secondes
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Aether-Mail/1.0",
      },
    };

    // Ajouter le token API si disponible en production
    if (this.isProduction && process.env.API_TOKEN) {
      config.headers["Authorization"] = `Bearer ${process.env.API_TOKEN}`;
    }

    this.client = axios.create(config);

    // Intercepteurs pour la gestion des erreurs
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error("API Error:", {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        // En développement, on ne lance pas d'erreur pour permettre l'utilisation des données mockées
        if (!this.isProduction) {
          return Promise.reject(error);
        }

        // En production, on relance l'erreur avec un message plus explicite
        const customError = {
          ...error,
          message: `API Error: ${error.response?.data?.message || error.message}`,
          status: error.response?.status || 500,
        };

        return Promise.reject(customError);
      },
    );
  }

  /**
   * Vérifie si l'API est disponible (uniquement en production)
   */
  isApiAvailable(): boolean {
    return this.isProduction && !!process.env.API_TOKEN;
  }

  /**
   * Effectue une requête GET
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (!this.isApiAvailable()) {
      throw new Error("API not available in development mode");
    }

    const response = await this.client.get(url, config);
    return response.data;
  }

  /**
   * Effectue une requête POST
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    if (!this.isApiAvailable()) {
      throw new Error("API not available in development mode");
    }

    const response = await this.client.post(url, data, config);
    return response.data;
  }

  /**
   * Effectue une requête PUT
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    if (!this.isApiAvailable()) {
      throw new Error("API not available in development mode");
    }

    const response = await this.client.put(url, data, config);
    return response.data;
  }

  /**
   * Effectue une requête DELETE
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (!this.isApiAvailable()) {
      throw new Error("API not available in development mode");
    }

    const response = await this.client.delete(url, config);
    return response.data;
  }

  /**
   * Effectue une requête PATCH
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    if (!this.isApiAvailable()) {
      throw new Error("API not available in development mode");
    }

    const response = await this.client.patch(url, data, config);
    return response.data;
  }
}

// Instance singleton
export const apiService = new ApiService();
export default apiService;
