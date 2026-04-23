export function monitoringProxy(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Grafana dashboard proxy
  if (pathname.startsWith("/monitoring/grafana")) {
    const grafanaUrl = process.env.GRAFANA_URL || "http://localhost:3001";
    const newPath = pathname.replace("/monitoring/grafana", "") || "/";

    const grafanaApiUrl = new URL(newPath, grafanaUrl);

    // Copy query parameters
    url.searchParams.forEach((value, key) => {
      grafanaApiUrl.searchParams.set(key, value);
    });

    // Prepare headers
    const headers = new Headers(request.headers);

    // Add Grafana authentication if configured
    const grafanaUser = process.env.GRAFANA_USER;
    const grafanaPassword = process.env.GRAFANA_PASSWORD;

    if (grafanaUser && grafanaPassword) {
      const auth = Buffer.from(`${grafanaUser}:${grafanaPassword}`).toString(
        "base64",
      );
      headers.set("Authorization", `Basic ${auth}`);
    }

    // Forward client info for Grafana analytics
    headers.set(
      "X-Forwarded-For",
      request.headers.get("x-forwarded-for") || "",
    );
    headers.set(
      "X-Forwarded-Proto",
      request.headers.get("x-forwarded-proto") || "http",
    );
    headers.set("X-Forwarded-Host", request.headers.get("host") || "");

    return new Request(grafanaApiUrl, {
      method: request.method,
      headers,
      body: request.body,
      redirect: "manual",
    });
  }

  // Prometheus API proxy
  if (pathname.startsWith("/monitoring/prometheus")) {
    const prometheusUrl = process.env.PROMETHEUS_URL || "http://localhost:9090";
    const newPath = pathname.replace("/monitoring/prometheus", "") || "/";

    const prometheusApiUrl = new URL(newPath, prometheusUrl);

    // Copy query parameters
    url.searchParams.forEach((value, key) => {
      prometheusApiUrl.searchParams.set(key, value);
    });

    // Prepare headers
    const headers = new Headers(request.headers);

    // Forward client info
    headers.set(
      "X-Forwarded-For",
      request.headers.get("x-forwarded-for") || "",
    );
    headers.set("X-Webhook-URL", request.headers.get("x-webhook-url") || "");

    return new Request(prometheusApiUrl, {
      method: request.method,
      headers,
      body: request.body,
      redirect: "manual",
    });
  }

  // Loki logs proxy
  if (pathname.startsWith("/monitoring/loki")) {
    const lokiUrl = process.env.LOKI_URL || "http://localhost:3100";
    const newPath = pathname.replace("/monitoring/loki", "") || "/";

    const lokiApiUrl = new URL(newPath, lokiUrl);

    // Copy query parameters
    url.searchParams.forEach((value, key) => {
      lokiApiUrl.searchParams.set(key, value);
    });

    // Prepare headers
    const headers = new Headers(request.headers);

    // Forward authentication for Loki
    const lokiToken = process.env.LOKI_TOKEN;
    if (lokiToken) {
      headers.set("Authorization", `Bearer ${lokiToken}`);
    }

    return new Request(lokiApiUrl, {
      method: request.method,
      headers,
      body: request.body,
      redirect: "manual",
    });
  }

  return null; // Let Next.js handle it
}

export const monitoringProxyConfig = {
  matcher: ["/monitoring/:path*"],
};
