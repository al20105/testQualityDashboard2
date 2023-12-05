/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        apiBaseUrl: "https://0t85wtueod.execute-api.ap-northeast-1.amazonaws.com/develop",
    },
    // TODO: 開発時のみ、リリース時に消す
    images: {
        domains: ["encrypted-tbn0.gstatic.com"]
    },
    // TODO: 非推奨　一旦デプロイしたいので追加
    eslint: {
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig
