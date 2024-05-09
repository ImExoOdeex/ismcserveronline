import { Flex } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

export default function InfiniteScroller({
    children,
    loading,
    loadNext,
    ended = false
}: {
    children: React.ReactNode;
    loading: boolean;
    ended?: boolean;
    loadNext: () => void;
}) {
    const bottomElementRef = useRef<HTMLDivElement>(null);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (bottomElementRef.current) {
            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && !loading && !ended) {
                        loadNext();
                    }
                },
                {
                    root: null,
                    rootMargin: "0px",
                    threshold: 0.1
                }
            );

            observer.current.observe(bottomElementRef.current);
        }

        return () => {
            if (observer.current && bottomElementRef.current) {
                observer.current.unobserve(bottomElementRef.current);
            }
        };
    }, [loading, loadNext, ended]);

    return (
        <Flex flexDir={"column"} w="100%">
            {children}
            <div ref={bottomElementRef} style={{ height: "1px" }} />
        </Flex>
    );
}
