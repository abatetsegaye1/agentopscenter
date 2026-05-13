/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@agentops/contracts"]
};

export default nextConfig;
