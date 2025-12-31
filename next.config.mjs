/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  // Include content files in standalone build for serverless
  outputFileTracingIncludes: {
    '/api/tutor': ['./src/content/**/*'],
  },
};

export default nextConfig;
