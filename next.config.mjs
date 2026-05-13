/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@agentops/contracts"],
  outputFileTracing: false
};

export default nextConfig;
