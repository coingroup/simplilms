/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@simplilms/ui",
    "@simplilms/database",
    "@simplilms/auth",
    "@simplilms/core",
  ],
};

export default nextConfig;
