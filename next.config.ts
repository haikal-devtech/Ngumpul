import type { NextConfig } from "next";

const securityHeaders = [
  // ── Enforce HTTPS for 1 year, include subdomains ──────────────────────────
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // ── Prevent MIME-type sniffing ────────────────────────────────────────────
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // ── Disallow being embedded in iframes (clickjacking protection) ──────────
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // ── Legacy XSS filter (belt-and-suspenders for older browsers) ───────────
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // ── Restrict Referer header to same origin ────────────────────────────────
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // ── Disable sensitive hardware APIs by default ────────────────────────────
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=()",
  },
  // ── Content Security Policy ───────────────────────────────────────────────
  // Allows: same-origin scripts, Google APIs (for Maps/OAuth), Supabase
  // realtime websocket, DiceBear/Unsplash images, and Vercel Speed Insights.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + next.js inline scripts + Firebase + Vercel Speed Insights
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://va.vercel-scripts.com https://apis.google.com https://*.firebaseapp.com https://www.gstatic.com",
      // Styles: self + inline (Tailwind/CSS-in-JS)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + Unsplash + DiceBear + Google
      "img-src 'self' data: blob: https://images.unsplash.com https://api.dicebear.com https://lh3.googleusercontent.com",
      // XHR / fetch: self + Google APIs + Firebase
      "connect-src 'self' https://maps.googleapis.com https://va.vercel-scripts.com https://*.googleapis.com https://*.firebaseio.com https://*.firebase.google.com https://*.firebasedataconnect.googleapis.com",
      // Frames: Google OAuth + Firebase Auth
      "frame-src https://accounts.google.com https://*.firebaseapp.com",
      // Disallow object/embed tags entirely
      "object-src 'none'",
      // Disallow base tag hijacking
      "base-uri 'self'",
      // Only load forms from self
      "form-action 'self'",
    ].join("; "),
  },

];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
