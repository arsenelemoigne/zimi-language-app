/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: '/api/:path*'
            },
            {
                source: '/:path*',
                destination: '/:path*'
            }
        ]
    },
    // Disable server-side rendering for HTML files
    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    }
}

module.exports = nextConfig 