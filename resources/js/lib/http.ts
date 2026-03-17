type BackendRequestOptions = Omit<RequestInit, 'body'> & {
    body?: BodyInit | null;
    json?: unknown;
};

export const getCsrfToken = (): string =>
    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content || '';

export async function backendRequest(input: RequestInfo | URL, options: BackendRequestOptions = {}): Promise<Response> {
    const method = (options.method ?? 'GET').toUpperCase();
    const headers = new Headers(options.headers);
    const csrfToken = getCsrfToken();
    const body = options.body ?? (options.json !== undefined ? JSON.stringify(options.json) : undefined);

    headers.set('X-Requested-With', 'XMLHttpRequest');

    if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
    }

    if (csrfToken && method !== 'GET' && !headers.has('X-CSRF-TOKEN')) {
        headers.set('X-CSRF-TOKEN', csrfToken);
    }

    if (options.json !== undefined && !(body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(input, {
        ...options,
        method,
        headers,
        body,
        credentials: options.credentials ?? 'same-origin',
    });
}

export async function backendJson<T = Record<string, unknown>>(
    input: RequestInfo | URL,
    options: BackendRequestOptions = {},
): Promise<{ response: Response; data: T | null }> {
    const response = await backendRequest(input, options);
    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('application/json')) {
        return { response, data: null };
    }

    try {
        const data = (await response.json()) as T;

        return { response, data };
    } catch {
        return { response, data: null };
    }
}
