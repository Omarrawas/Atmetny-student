
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'th.bing.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/**',
      },
      { // Example if using Supabase storage for images, replace with your actual Supabase project ref ID
        protocol: 'https',
        hostname: '*.supabase.co', // Use a wildcard for the project-specific part
        port: '',
        pathname: '/storage/v1/object/public/**', // Common path for public Supabase storage
      },
    ],
  },
  experimental: {
    allowedDevOrigins: ['https://6000-firebase-studio-1749913518058.cluster-bg6uurscprhn6qxr6xwtrhvkf6.cloudworkstations.dev'],
  }
};

export default nextConfig;
