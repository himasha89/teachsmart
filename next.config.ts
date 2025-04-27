import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // 1. Exclude binary files from processing
    config.module.rules.push({
      test: /\.node$/,
      loader: "node-loader",
    });

    // 2. Important: Mark canvas as external if not needed
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: "commonjs canvas", // Prevents client-side import
      });
    }

    // 3. Fix for "Critical dependency" warnings (optional)
    config.module.rules.push({
      test: /pdf\.worker(\.min)?\.js$/,
      loader: "file-loader",
      options: {
        name: "[contenthash].[ext]",
        publicPath: "_next/static/worker",
        outputPath: "static/worker"
      }
    });

    return config;
  },
  // 4. Enable experimental server components if needed
  experimental: {
    serverComponentsExternalPackages: ["canvas", "pdfjs-dist"]
  }
};

export default nextConfig;