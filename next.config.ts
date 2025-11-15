import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	experimental: {
		serverComponentsExternalPackages: ["@prisma/client"],
	},
	images: {
		domains: ["localhost"],
	},
	env: {
		CUSTOM_KEY: process.env.CUSTOM_KEY,
	},
};

export default nextConfig;
