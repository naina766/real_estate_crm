/**
 * API client utility for handling fetch requests with proper error handling.
 * This prevents "Unexpected token '<', '<!DOCTYPE '..." errors by checking
 * content type before parsing JSON.
 */

export interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

export class ApiClientError extends Error implements ApiError {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Fetch wrapper that handles JSON parsing safely and provides consistent error handling.
 * 
 * @param url - The API endpoint URL
 * @param options - Fetch options
 * @returns Parsed JSON response data
 * @throws ApiClientError if the response is not JSON or if the API returns an error
 */
export async function fetchJson<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Build the full URL - handle relative URLs by prepending the base
  const fullUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Check if response is JSON
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
    let errorData: unknown;

    if (isJson) {
      try {
        errorData = await response.json();
        const error = errorData as { message?: string; success?: boolean };
        if (error.message) {
          errorMessage = error.message;
        }
      } catch {
        errorMessage = "Failed to parse error response";
      }
    } else {
      // Non-JSON response (likely HTML error page)
      const text = await response.text().catch(() => "");
      errorMessage = text.slice(0, 200) || errorMessage;
      
      // Handle common redirect scenarios
      if (response.redirected && response.url.includes("/login")) {
        errorMessage = "Session expired. Please log in again.";
      }
    }

    const error = new ApiClientError(errorMessage, response.status, errorData);
    
    // Auto-redirect on 401 for non-GET requests or when not handling in component
    if (response.status === 401 && options.method !== "GET") {
      if (typeof window !== "undefined") {
        window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
      }
    }

    throw error;
  }

  if (!isJson) {
    // If we expect JSON but get HTML, throw a clear error
    const text = await response.text().catch(() => "");
    if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
      throw new ApiClientError(
        "Server returned HTML instead of JSON. You may need to log in again.",
        response.status
      );
    }
    throw new ApiClientError(
      `Expected JSON response but received: ${contentType || "unknown"}`,
      response.status
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Safe JSON parse that returns null on failure instead of throwing
 */
export async function safeJsonParse<T = unknown>(
  response: Response
): Promise<{ data: T | null; error: ApiClientError | null }> {
  try {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!isJson) {
      return {
        data: null,
        error: new ApiClientError(
          "Response is not JSON",
          response.status
        ),
      };
    }

    const data = await response.json();
    return { data: data as T, error: null };
  } catch (err) {
    return {
      data: null,
      error: new ApiClientError(
        err instanceof Error ? err.message : "Failed to parse response",
        response.status
      ),
    };
  }
}