import { Box, type BoxProps } from "@chakra-ui/react";
import { useMatches } from "@remix-run/react";
import { useEffect } from "react";

export enum adType {
	// 786 x 90 (px)
	small,
	// 360 x 600 (px)
	column,
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

export function Ad({ type = adType.responsive, width = "1168px", ...props }: { type?: adType; width?: string } & BoxProps) {
	useEffect(() => {
		try {
			(window.adsbygoogle = window.adsbygoogle || []).push({});
		} catch (err) {
			console.error(err);
		}
	}, []);

	const { showAds } = useMatches()[0].data;
	if (!showAds) {
		return <></>;
	}

	switch (type) {
		case adType.small: {
			return (
				<Box w="100%" h="100%" minW={"100%"} {...props}>
					<ins
						className="adsbygoogle"
						style={{ display: "inline-block", width: width, height: "90px", marginInline: "auto" }}
						data-ad-client="ca-pub-4203392968171424"
						data-ad-slot="8306208692"
					></ins>
				</Box>
			);
		}
		case adType.responsive: {
			return (
				<Box h="100%" w="100%" minW={"100%"} {...props}>
					<ins
						className="adsbygoogle resad"
						style={{ display: "block", height: "90px" }}
						data-ad-client="ca-pub-4203392968171424"
						data-ad-slot="7156778558"
						data-ad-format="auto"
						data-full-width-responsive="true"
					></ins>
				</Box>
			);
		}
		case adType.column: {
			return (
				<Box h="100%" minH={"90px"} {...props}>
					<ins
						className="adsbygoogle"
						style={{ display: "inline-block", width: width.length ? width : "360px", height: "600px" }}
						data-ad-client="ca-pub-4203392968171424"
						data-ad-slot="6312656088"
					></ins>
				</Box>
			);
		}
		case adType.multiplex: {
			return (
				<Box w="100%" h="100%" minH={"90px"} minW={"100%"} {...props}>
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
				<Box w="100%" h="100%" minH={"90px"} minW={"100%"} {...props}>
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
