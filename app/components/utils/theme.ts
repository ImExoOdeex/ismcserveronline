import {
	extendBaseTheme,
	mergeThemeOverride,
	theme as chakraTheme,
	type ThemeConfig,
	type ThemeOverride
} from "@chakra-ui/react";
import { mode, type StyleFunctionProps } from "@chakra-ui/theme-tools";
import type { Dict } from "@chakra-ui/utils";

const config: ThemeConfig = {
	initialColorMode: "system",
	useSystemColorMode: true
};

const styles = {
	global: (props: StyleFunctionProps | Dict<any>) => ({
		body: {
			minH: "100vh",
			bg: mode("bg.100", "bg.900")(props),
			overflowY: "scroll",
			overflowX: "hidden"
		},
		th: {
			color: mode("#393942cc!important", "#dedef1be!important")(props)
		},
		html: {
			"&::-webkit-scrollbar": {
				width: "8px",
				padding: "2px"
			},
			"&::-webkit-scrollbar-track": {
				borderLeft: "1px solid " + mode("#e9e7ee", "#272729")(props)
			},
			"&::-webkit-scrollbar-thumb": {
				backgroundColor: mode("#c2c2c2", "#272729")(props),
				borderRadius: "5px"
			},
			"&::-webkit-scrollbar-thumb:hover": {
				backgroundColor: mode("#a1a1a1", "#1b1b1d")(props)
			},
			"&::-webkit-scrollbar-thumb:active": {
				backgroundColor: mode("#c4c4c4", "#39393a")(props)
			},
			"-webkit-tap-highlight-color": "transparent",
			"*::selection": {
				backgroundColor: "#563B9F",
				color: "white"
			}
		}
	})
};

const colors = {
	brand: {
		100: "#aa90f0",
		200: "#563B9F",
		300: "#563B9F",
		400: "#563B9F",
		500: "#563B9F",
		600: "#563B9F",
		700: "#563B9F",
		800: "#563B9F",
		900: "#563B9F"
	},
	bg: {
		100: "#ffffff",
		900: `#0f0f0f`
	},
	sec: {
		100: "#93b8e9",
		900: "#0078D7"
	},
	discord: {
		100: "#5865F2",
		900: "#6A5ACD"
	}
};

const {
	Badge,
	Button,
	Code,
	Divider,
	FormLabel,
	Heading,
	Input,
	Popover,
	Link,
	Skeleton,
	Modal,
	Spinner,
	Textarea,
	Tooltip,
	Menu,
	Table,
	Select,
	List
} = chakraTheme.components;

const theme = extendBaseTheme({
	colors,
	config,
	styles,
	fonts: {
		body: `"Poppins", sans-serif`,
		heading: '"Outfit", "Poppins", sans-serif'
	},
	semanticTokens: {
		colors: {
			brand: {
				default: "brand.900",
				_dark: "brand.100"
			},
			sec: {
				default: "#0078D7",
				_dark: "#93b8e9"
			},
			text: {
				default: "blackAlpha.900",
				_dark: "whiteAlpha.900"
			},
			textSec: {
				default: "blackAlpha.800",
				_dark: "whiteAlpha.800"
			},
			gold: {
				default: "orange.300",
				_dark: "orange.200"
			},
			inv: {
				default: "white",
				_dark: "black"
			},
			invNormal: {
				default: "bg.900",
				_dark: "bg.100"
			},
			red: {
				default: "red.500",
				_dark: "red.400"
			},
			green: {
				default: "green.600",
				_dark: "green.400"
			},
			bg: {
				default: "bg.100",
				_dark: "bg.900"
			},
			alpha: {
				default: "blackAlpha.50",
				_dark: "whiteAlpha.50"
			},
			alpha100: {
				default: "blackAlpha.100",
				_dark: "whiteAlpha.100"
			},
			alpha200: {
				default: "blackAlpha.200",
				_dark: "whiteAlpha.200"
			},
			alpha300: {
				default: "blackAlpha.300",
				_dark: "whiteAlpha.300"
			},
			alpha400: {
				default: "blackAlpha.400",
				_dark: "whiteAlpha.400"
			},
			alpha500: {
				default: "blackAlpha.500",
				_dark: "whiteAlpha.500"
			},
			alpha600: {
				default: "blackAlpha.600",
				_dark: "whiteAlpha.600"
			},
			alpha700: {
				default: "blackAlpha.700",
				_dark: "whiteAlpha.700"
			},
			alpha800: {
				default: "blackAlpha.800",
				_dark: "whiteAlpha.800"
			},
			alpha900: {
				default: "blackAlpha.900",
				_dark: "whiteAlpha.900"
			},
			raisedBg: {
				default: "#f6f6ff",
				_dark: "#18181b"
			}
		}
	},
	components: {
		Badge,
		Code,
		FormLabel,
		Heading,
		Menu,
		Input,
		Popover,
		Skeleton,
		Modal,
		Spinner,
		Textarea,
		Table,
		Select,
		List,
		Divider: mergeThemeOverride(Divider, {
			baseStyle: {
				borderColor: "alpha300"
			}
		}),
		Tooltip: mergeThemeOverride(Tooltip, {
			baseStyle: {
				bg: "#1d1d22",
				"--tooltip-bg": "#1d1d22",
				_dark: {
					"--tooltip-bg": "#fff",
					bg: "bg.100"
				}
			}
		}),
		Button: mergeThemeOverride(Button, {
			variants: {
				brand: {
					bg: "brand.900",
					color: "whiteAlpha.900",
					_hover: {
						bg: "#563B9Fca"
					},
					_active: {
						bg: "#563B9Fe6"
					}
				},
				sec: {
					bg: "sec.900",
					color: "whiteAlpha.900",
					_hover: {
						bg: "#0866b3"
					},
					_active: {
						bg: "#278adb"
					}
				}
			},
			baseStyle: {
				rounded: "xl",
				_hover: {
					textDecor: "none"
				}
			}
		}),
		IconButton: {
			variants: {
				brand: {
					bg: "brand.900",
					color: "whiteAlpha.900",
					_hover: {
						bg: "#563B9Fca"
					},
					_active: {
						bg: "#563B9Fe6"
					}
				}
			}
		},
		Link: mergeThemeOverride(Link, {
			variants: {
				link: {
					color: "sec",
					transition: "color .2s",
					_hover: {
						color: "#005395"
					},
					_dark: {
						_hover: {
							color: "#278adb"
						}
					},
					textDecor: "underline",
					fontWeight: 600
				}
			}
		})
	}
}) as ThemeOverride;

export default theme;
