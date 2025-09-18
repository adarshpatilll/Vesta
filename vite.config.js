import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			injectRegister: "auto",
			includeAssets: ["favicon.svg", "robots.txt", "icons/*.png"],
			manifest: {
				name: "Vesta",
				short_name: "Vesta",
				description: "Manage your societies with ease.",
				theme_color: "#F0B100",
				background_color: "#181818",
				display: "standalone",
				start_url: "/",
				icons: [
					{
						src: "icons/icon-192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "icons/icon-512.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			}, // end of manifest
			workbox: {
				navigateFallback: "/index.html",
				globPatterns: ["**/*.{js,css,html,png,svg}"],
				maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6 MB limit
			}, // end of workbox
		}),
	],
	build: {
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
			},
		}, // end of build.terserOptions
		rollupOptions: {
			output: {
				manualChunks: {
					react: ["react", "react-dom", "react-router-dom"],
					firebase: [
						"firebase/app",
						"firebase/auth",
						"firebase/firestore",
					],
					motion: ["framer-motion"],
					icons: ["react-icons", "lucide-react"],
					utils: ["dayjs", "exceljs", "file-saver"],
				},
			},
		}, // end of build.rollupOptions
	},
	resolve: {
		alias: {
			"@": "/src", // This allows you to use '@' as a shorthand for the 'src' directory
		},
	},
});
