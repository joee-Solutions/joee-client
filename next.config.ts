import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images served from DigitalOcean Spaces (employee/profile images)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "joee.nyc3.digitaloceanspaces.com",
        pathname: "/**",
      },
    ],
  },
  
};

export default nextConfig;
