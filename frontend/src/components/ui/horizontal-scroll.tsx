import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode, useRef } from "react";

type HorizontalScrollProps = {
	children: ReactNode;
	className?: string;
	label: string;
};

const HorizontalScroll = ({ children, className = "", label }: HorizontalScrollProps) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	const scroll = (direction: "left" | "right") => {
		scrollRef.current?.scrollBy({
			left: direction === "right" ? scrollRef.current.clientWidth * 0.82 : -scrollRef.current.clientWidth * 0.82,
			behavior: "smooth",
		});
	};

	return (
		<div className="group/rail relative min-w-0">
			<button
				type="button"
				aria-label={`Scroll ${label} left`}
				onClick={() => scroll("left")}
				className="absolute left-1 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-950/90 text-white shadow-lg ring-1 ring-white/10 transition hover:scale-105 hover:bg-zinc-800 focus-visible:flex group-hover/rail:flex sm:flex"
			>
				<ChevronLeft className="size-5" />
			</button>
			<div ref={scrollRef} className={`horizontal-scrollbar scrollbar-hidden flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 ${className}`}>
				{children}
			</div>
			<button
				type="button"
				aria-label={`Scroll ${label} right`}
				onClick={() => scroll("right")}
				className="absolute right-1 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-950/90 text-white shadow-lg ring-1 ring-white/10 transition hover:scale-105 hover:bg-zinc-800 focus-visible:flex group-hover/rail:flex sm:flex"
			>
				<ChevronRight className="size-5" />
			</button>
		</div>
	);
};

export default HorizontalScroll;
