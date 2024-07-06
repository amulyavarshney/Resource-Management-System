/** @type {import('next').NextConfig} */
const nextConfig = {
	serverRuntimeConfig: {
		HOST: process.env.NEXTAUTH_URL,
	},
};

module.exports = nextConfig;
