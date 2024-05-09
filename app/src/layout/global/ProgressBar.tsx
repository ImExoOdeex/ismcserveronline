import config from "@/utils/config";
import { Flex, useColorModeValue } from "@chakra-ui/react";
import type { TargetAndTransition } from "framer-motion";
import { motion, useAnimationControls } from "framer-motion";
import { memo, useEffect, useState } from "react";

interface Props {
    widthDuration: number;
    doneWidthDuration: number;
    heightDuration: number;
    height: number;
    initialProgress: number;
    progress: number;
    onHide: () => void;
    hasBeenStarted: boolean;
}

export default memo(function ProgressBar({
    doneWidthDuration,
    height,
    heightDuration,
    initialProgress,
    widthDuration,
    progress,
    onHide,
    hasBeenStarted
}: Props) {
    const [completed, setCompleted] = useState(false);
    const color = useColorModeValue("brand", "gray.100");

    const animateWidth = useAnimationControls();

    useEffect(() => {
        if (progress === 0 || progress === initialProgress) {
            animateWidth.set({ width: "0%" });
            if (progress === initialProgress) {
                // we set first to 0% and then animate to the initial
                animateWidth.start({ width: `${progress}%` });
            }
        } else {
            animateWidth.start({ width: `${progress}%` });
        }
    }, [progress, initialProgress, animateWidth]);

    return (
        <motion.div
            animate={{
                height: (completed && progress >= 100) || progress === 0 ? 0 : height,
                opacity: (completed && progress >= 100) || progress === 0 ? 0 : 1
            }}
            onAnimationComplete={(d) => {
                const animatedHeight = (d as TargetAndTransition).height as number;

                if (animatedHeight === 0 && !hasBeenStarted) {
                    onHide();
                }
            }}
            transition={{
                ease: config.ease,
                duration: progress >= 100 ? heightDuration : 0
            }}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                width: "100%",
                zIndex: 10000
            }}
        >
            <motion.div
                initial={{ width: "0%" }}
                animate={animateWidth}
                transition={{
                    ease: config.ease,
                    duration: progress < 100 ? widthDuration : doneWidthDuration
                }}
                style={{
                    height: "100%"
                }}
                onAnimationStart={() => {
                    if (progress > 0) {
                        setCompleted(false);
                    }
                }}
                onAnimationComplete={(d) => {
                    const animatedWidth = (d as TargetAndTransition).width as string;

                    if (animatedWidth === "100%") {
                        setCompleted(true);
                    }
                }}
            >
                <Flex w="100%" h={height + "px"} bg={color} />
            </motion.div>
        </motion.div>
    );
});
