/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'], // Add your domains as needed
  },
}

module.exports = nextConfig