// components/ErrorBoundary.tsx
import { Component, ReactNode } from "react";

type ErrorBoundaryProps = {
	children: ReactNode;
	fallback?: ReactNode;
};

type ErrorBoundaryState = {
	hasError: boolean;
	error?: Error;
};

export default class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: any) {
		console.error("Uncaught error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;

			return (
				<div className="flex h-screen w-full flex-col items-center justify-center bg-dark">
					<h1 className="text-xl font-bold text-accent mb-4">
						Something went wrong 😢
					</h1>
					<p className="text-light text-sm">
						Please refresh the page or try again later.
					</p>
				</div>
			);
		}
		return this.props.children;
	}
}
