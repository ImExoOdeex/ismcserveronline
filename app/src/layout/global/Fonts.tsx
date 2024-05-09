import { Global } from "@emotion/react";
import { memo } from "react";

export default memo(function Fonts() {
    return (
        <Global
            styles={`/* latin */
			@font-face {
			  font-family: 'Montserrat';
			  font-style: italic;
			  font-weight: 100 900;
			  font-display: block;
			  src: url(https://fonts.gstatic.com/s/montserrat/v26/JTUQjIg1_i6t8kCHKm459WxRyS7m.woff2) format('woff2');
			  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
			}
			/* latin */
			@font-face {
			  font-family: 'Montserrat';
			  font-style: normal;
			  font-weight: 100 900;
			  font-display: block;
			  src: url(https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2) format('woff2');
			  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
			}
		`}
        />
    );
});
