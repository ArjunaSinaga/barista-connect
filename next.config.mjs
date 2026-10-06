/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  async headers() {
    // React dev-mode butuh eval() untuk debugging; izinkan HANYA di development.
    // Production tetap strict tanpa 'unsafe-eval'.
    const scriptSrc =
      process.env.NODE_ENV === "development"
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com"
        : "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com";
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
                scriptSrc +
                "; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co https://randomuser.me https://picsum.photos https://fastly.picsum.photos; connect-src 'self' https://*.supabase.co https://api.pwnedpasswords.com https://api.midtrans.com https://api.sandbox.midtrans.com wss://*.supabase.co https://va.vercel-scripts.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
