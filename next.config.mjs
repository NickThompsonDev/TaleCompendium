/** @type {import('next').NextConfig} */
import autoCert from "anchor-pki/auto-cert/integrations/next";

const withAutoCert = autoCert({
  enabledEnv: "development",
});

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lovely-flamingo-139.convex.cloud'
      },
      {
        protocol: 'https',
        hostname: 'sleek-capybara-771.convex.cloud'
      },
      {
        protocol: 'https',
        hostname: 'prestigious-mockingbird-887.convex.cloud'
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com'
      },
    ]
  }
};

export default withAutoCert(nextConfig);;

