
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    allowedDevOrigins: [
      'https://9000-firebase-studio-1749913518058.cluster-bg6uurscprhn6qxr6xwtrhvkf6.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
