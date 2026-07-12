import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/whatsapp',
        destination: 'https://chat.whatsapp.com/JsXT6Od90Ms77sqiCy5oHm?s=cl&p=a&ilr=1',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
