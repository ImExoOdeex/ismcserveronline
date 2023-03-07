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

export function Ad({ type = adType.responsive }: { type?: adType }) {
	useEffect(() => {
		(window.adsbygoogle = window.adsbygoogle || []).push({});
	}, []);

	switch (type) {
		case adType.small: {
			return (
				<ins
					className="adsbygoogle"
					style={{ display: "inline-block", width: "728px", height: "90px" }}
					data-ad-client="ca-pub-4203392968171424"
					data-ad-slot="8306208692"
				></ins>
			);
		}
		case adType.responsive: {
			return (
				<ins
					className="adsbygoogle"
					style={{ display: "block" }}
					data-ad-client="ca-pub-4203392968171424"
					data-ad-slot="7156778558"
					data-ad-format="auto"
					data-full-width-responsive="true"
				></ins>
			);
		}
		case adType.multiplex: {
			return (
				<ins
					className="adsbygoogle"
					style={{ display: "block" }}
					data-ad-format="autorelaxed"
					data-ad-client="ca-pub-4203392968171424"
					data-ad-slot="8108017707"
				></ins>
			);
		}
		case adType.article: {
			return (
				<ins
					className="adsbygoogle"
					style={{ display: "block", textAlign: "center" }}
					data-ad-layout="in-article"
					data-ad-format="fluid"
					data-ad-client="ca-pub-4203392968171424"
					data-ad-slot="7975052113"
				></ins>
			);
		}
	}
}
