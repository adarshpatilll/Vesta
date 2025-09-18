// components/ErrorFallback.tsx
import Lottie from "lottie-react";
import errorAnimation from "../assets/error-404.json"; // place inside src/assets/

export default function ErrorFallback() {
	return (
		<div className="flex h-screen w-full flex-col items-center justify-center bg-dark">
			<Lottie
				animationData={errorAnimation}
				loop={true}
				className="w-64 h-64"
			/>
			<h2 className="text-xl font-semibold text-accent mt-6">
				Oops! Something broke.
			</h2>
			<p className="text-neutral-300 text-sm mt-2">
				Please try refreshing the page 🚀
			</p>
		</div>
	);
}
