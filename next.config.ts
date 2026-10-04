import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const r2Host = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : undefined;
const nextConfig: NextConfig = {
  images: { remotePatterns: r2Host ? [{ protocol: 'https', hostname: r2Host }] : [] },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
