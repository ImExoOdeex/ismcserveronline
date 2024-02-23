import { Global } from "@emotion/react";
import { memo } from "react";

export default memo(function McFonts() {
	return (
		<>
			<Global
				styles={`
		@font-face {
			font-family: 'Minecraft';
			src: url('/Minecraft.otf') format('opentype');
		}
		@font-face {
			font-family: 'EnchantingTable';
			src: url('/EnchantingTable.ttf') format('truetype');
		}
 `}
			/>
		</>
	);
});
