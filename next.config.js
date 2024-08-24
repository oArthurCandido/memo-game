/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [ {
      protocol: 'https',
      hostname: 'rickandmortyapi.com',
      pathname: '**',
    },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '**',
      },],
  },
};

module.exports = nextConfig;
