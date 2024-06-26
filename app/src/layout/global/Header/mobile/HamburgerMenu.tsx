import { motion, type SVGMotionProps, type Transition } from "framer-motion";
import { memo, useMemo } from "react";

interface Props extends SVGMotionProps<Props> {
    isOpen?: boolean;
    color?: string;
    strokeWidth?: string | number;
    transition?: Transition;
    lineProps?: any;
}

const unitHeight = 4;
const top = {
    closed: {
        rotate: 0,
        translateY: 0.1,
        transition: { duration: 0.15 }
    },
    opened: {
        rotate: -45,
        translateY: 2,
        transition: { duration: 0.15 }
    }
};
const center = {
    closed: {
        opacity: 1,
        transition: { duration: 0 }
    },
    opened: {
        opacity: 0,
        transition: { duration: 0.15 }
    }
};
const bottom = {
    closed: {
        rotate: 0,
        translateY: 0,
        transition: { duration: 0.15 }
    },
    opened: {
        rotate: 45,
        translateY: -2,
        transition: { duration: 0.15 }
    }
};
const transition = {
    ease: [0.25, 0.1, 0.25, 1],
    duration: 0.33
} satisfies Transition;

export default memo(function HamburgerMenu({
    isOpen = false,
    width = 24,
    height = 16,
    strokeWidth = 1.5,
    color = "currentColor",
    lineProps = null,
    ...props
}: Props) {
    const variant = useMemo(() => (isOpen ? "opened" : "closed"), [isOpen]);

    lineProps = useMemo(
        () => ({
            stroke: color,
            strokeWidth: strokeWidth as number,
            vectorEffect: "non-scaling-stroke",
            initial: "closed",
            animate: variant,
            ...lineProps
        }),
        [color, strokeWidth, variant, lineProps]
    );

    const unitWidth = useMemo(
        () => (unitHeight * (width as number)) / (height as number),
        [width, height]
    );

    return (
        // @ts-ignore
        <motion.svg
            viewBox={`0 0 ${unitWidth} ${unitHeight}`}
            overflow="visible"
            preserveAspectRatio="none"
            width={width}
            height={height}
            {...props}
        >
            <motion.line
                x1="0"
                x2={unitWidth}
                y1="0"
                y2="0"
                variants={top}
                transition={transition}
                {...lineProps}
            />
            <motion.line
                x1="1"
                x2={unitWidth}
                y1="2"
                y2="2"
                variants={center}
                transition={transition}
                {...lineProps}
            />
            <motion.line
                x1="0"
                x2={unitWidth}
                y1="4"
                y2="4"
                variants={bottom}
                transition={transition}
                {...lineProps}
            />
        </motion.svg>
    );
});
