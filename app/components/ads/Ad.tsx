import { Box, type BoxProps } from "@chakra-ui/react";
import { useEffect } from "react";

export enum adType {
	// 786 x 90 (px)
	small,
	// fully responsive display ad
	responsive,
	// large multiplex ad
	multiplex,
	// article ad, that should be in some text
	article
}

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

export function Ad({ type = adType.responsive, ...props }: { type?: adType } & BoxProps) {
	useEffect(() => {
		try {
			(window.adsbygoogle = window.adsbygoogle || []).push({});
		} catch (err) {
			console.error(err);
		}
	}, []);

	switch (type) {
		case adType.small: {
			return (
				<Box w="100%" h="100%" minW={"1000px"} justifyContent={"center"} alignItems={"center"} {...props}>
					<ins
						className="adsbygoogle"
						style={{ display: "inline-block", width: "1000px", height: "90px", marginInline: "auto" }}
						data-ad-client="ca-pub-4203392968171424"
						data-ad-slot="8306208692"
					></ins>
				</Box>
			);
		}
		case adType.responsive: {
			return (
				<Box w="100%" h="100%" maxH={"90px"} minW={"400px"} justifyContent={"center"} alignItems={"center"}>
					<ins
						className="adsbygoogle"
						style={{ display: "block" }}
						data-ad-client="ca-pub-4203392968171424"
						data-ad-slot="7156778558"
						data-ad-format="auto"
						data-full-width-responsive="true"
					></ins>
				</Box>
			);
		}
		case adType.multiplex: {
			return (
				<Box w="100%" h="100%" minH={"90px"} minW={"400px"} justifyContent={"center"} alignItems={"center"}>
					<ins
						className="adsbygoogle"
						style={{ display: "block" }}
						data-ad-format="autorelaxed"
						data-ad-client="ca-pub-4203392968171424"
						data-ad-slot="8108017707"
					></ins>
				</Box>
			);
		}
		case adType.article: {
			return (
				<Box w="100%" h="100%" minH={"90px"} minW={"400px"} justifyContent={"center"} alignItems={"center"}>
					<ins
						className="adsbygoogle"
						style={{ display: "block", textAlign: "center" }}
						data-ad-layout="in-article"
						data-ad-format="fluid"
						data-ad-client="ca-pub-4203392968171424"
						data-ad-slot="7975052113"
					></ins>
				</Box>
			);
		}
	}
}
