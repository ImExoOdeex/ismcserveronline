import config from "@/utils/config";
import type { Transition } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";

interface AnimateFromTopProps {
	delay?: number;
	transition?: Transition;
	children: React.ReactNode;
	from?: "top" | "bottom" | "left" | "right";
}

const variants = {
	top: {
		initial: { y: -50, opacity: 0 },
		animate: { y: 0, opacity: 1 }
	},
	bottom: {
		initial: { y: 50, opacity: 0 },
		animate: { y: 0, opacity: 1 }
	},
	left: {
		initial: { x: -50, opacity: 0 },
		animate: { x: 0, opacity: 1 }
	},
	right: {
		initial: { x: 50, opacity: 0 },
		animate: { x: 0, opacity: 1 }
	}
};

export function AnimateFrom({ children, transition, delay = 0, from = "top" }: AnimateFromTopProps) {
	return (
		<AnimatePresence initial={false}>
			<motion.div
				variants={variants[from]}
				initial="initial"
				animate="animate"
				transition={{
					duration: 0.4,
					ease: config.ease,
					delay: delay,
					...transition
				}}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
}
