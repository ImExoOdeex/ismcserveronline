import { inputAnatomy, tableAnatomy, tagAnatomy } from "@chakra-ui/anatomy";
import {
	theme as chakraTheme,
	createMultiStyleConfigHelpers,
	extendBaseTheme,
	mergeThemeOverride,
	type ThemeConfig,
	type ThemeOverride
} from "@chakra-ui/react";
import { mode, type StyleFunctionProps } from "@chakra-ui/theme-tools";
import type { Dict } from "@chakra-ui/utils";
import { useLocation } from "@remix-run/react";
import { useMemo } from "react";
import useUser from "../hooks/useUser";
import config from "./config";

const themeConfig = {
	initialColorMode: "system",
	useSystemColorMode: true,
	disableTransitionOnChange: true
} satisfies ThemeConfig;

const brand = "#5954a4";
const lighterBrand = "#998bdd";

const colors = {
	brand: {
		100: lighterBrand,
		200: brand,
		300: brand,
		400: brand,
		500: brand,
		600: brand,
		700: brand,
		800: brand,
		900: brand
	},
	bg: {
		100: "#ffffff",
		900: `#111117`
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
	Tag,
	Progress,
	Code,
	Drawer,
	Divider,
	Switch,
	Menu,
	FormLabel,
	Avatar,
	Heading,
	Input,
	Popover,
	Link,
	Stat,
	Modal,
	Spinner,
	Textarea,
	Form,
	Tooltip,
	Table,
	Alert,
	Select,
	Slider,
	Accordion,
	CloseButton,
	List
} = chakraTheme.components;

const inputHelpers = createMultiStyleConfigHelpers(inputAnatomy.keys);
const tagHelpers = createMultiStyleConfigHelpers(tagAnatomy.keys);
const tableHelpers = createMultiStyleConfigHelpers(tableAnatomy.keys);

const multipartComponents = {
	input: inputHelpers.defineMultiStyleConfig({
		variants: {
			filled: {
				field: {
					bg: "alpha",
					_hover: {
						bg: "alpha100"
					},
					_active: {
						bg: "alpha200"
					}
				}
			},
			ghost: {
				field: {
					bg: "transparent",
					_hover: {
						bg: "alpha100"
					},
					_active: {
						bg: "alpha200"
					}
				}
			}
		},
		baseStyle: {
			field: {
				_focusVisible: {
					// boxShadow: `0 0 0 3px rgba(90, 53, 215, 0.6)`,
					borderColor: "brand !important"
				}
			}
		}
	}),
	tag: tagHelpers.defineMultiStyleConfig({
		baseStyle: {
			container: {
				bg: "alpha100",
				transform: "auto-gpu",
				transition: `transform .2s ${config.cubicEase}, background .2s ${config.cubicEase}, color .2s ${config.cubicEase}`,
				_hover: {
					textDecor: "none",
					bg: "alpha200"
				},
				_active: {
					scale: 0.9,
					bg: "alpha300"
				}
			}
		}
	}),
	table: tableHelpers.defineMultiStyleConfig({
		variants: {
			simple: {
				td: {
					borderColor: "alpha300"
				},
				th: {
					borderColor: "alpha300"
				}
			}
		}
	})
};

export default function useTheme() {
	const user = useUser();
	const path = useLocation().pathname;
	const theme = useMemo(
		() =>
			extendBaseTheme({
				colors,
				config: themeConfig,
				styles: {
					global: (props: StyleFunctionProps | Dict<any>) => ({
						body: {
							minH: "100vh",
							bg: mode("bg.100", "bg.900")(props),
							bgGradient:
								user?.everPurchased || path.startsWith("/prime")
									? mode(
											"linear(145deg, #1ebc6d -100%, #ccd4ed 15%, #f7e8f7 50%, #d2c1e6 100%)",
											"linear(145deg, #1ebc6d -100%, #10091f 15%, #130d1c 50%, #1d1525 100%)"
									  )(props)
									: undefined,
							backgroundAttachment: "fixed",
							overflowY: "scroll",
							overflowX: "hidden"
						},
						th: {
							color: mode("#393942cc!important", "#dedef1be!important")(props)
						},
						html: {
							// i wanted to style scrollbar dynamically, but it doesnt work in normal way, and i would need to do some classes for it, but im lazy and i fuck it
							"&::-webkit-scrollbar": {
								width: "6px",
								padding: "2px"
							},
							"&::-webkit-scrollbar-thumb": {
								backgroundColor: "#39393a",
								borderRadius: "1.5px"
							},
							"&::-webkit-scrollbar-thumb:hover": {
								backgroundColor: mode("#c4c4c4", "#39393a")(props)
							},
							"&::-webkit-scrollbar-thumb:active": {
								backgroundColor: "brand"
							},
							"-webkit-tap-highlight-color": "transparent",
							"*::selection": {
								bg: mode("rgb(73, 21, 179, 0.3)", "rgb(73, 21, 179, 0.3)")(props),
								color: mode("brand", "#ddc5f4")(props)
							}
						}
					})
				},
				fonts: {
					body: `"Montserrat"`,
					heading: `"Montserrat"`
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
					Progress,
					FormLabel,
					Heading,
					Drawer,
					Avatar,
					Slider,
					Form,
					Menu,
					Alert,
					Stat,
					Popover,
					CloseButton,
					Modal,
					Switch,
					Accordion,
					Spinner,
					Select,
					List,
					Textarea: mergeThemeOverride(Textarea, {
						variants: {
							filled: {
								bg: "alpha",
								_hover: {
									bg: "alpha100"
								},
								_active: {
									bg: "alpha200"
								}
							},
							ghost: {
								bg: "transparent",
								_hover: {
									bg: "alpha100"
								},
								_active: {
									bg: "alpha200"
								}
							}
						},
						baseStyle: {
							field: {
								_focusVisible: {
									// boxShadow: `0 0 0 3px rgba(90, 53, 215, 0.6)`,
									borderColor: "brand !important"
								}
							}
						}
					}),
					Table: mergeThemeOverride(Table, multipartComponents.table),
					Tag: mergeThemeOverride(Tag, multipartComponents.tag),
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
									bg: "#6943b5"
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
							},
							solid: {
								bg: "alpha200",
								_hover: {
									bg: "alpha300"
								},
								_active: {
									bg: "alpha400"
								}
							},
							ghost: {
								bg: "transparent",
								_hover: {
									bg: "alpha100"
								},
								_active: {
									bg: "alpha200"
								}
							}
						},
						baseStyle: {
							rounded: "xl",
							transform: "auto-gpu",
							transition: `transform .2s ${config.cubicEase}, background .2s ${config.cubicEase}, color .2s ${config.cubicEase}`,
							_hover: {
								textDecor: "none"
							},
							_active: {
								scale: 0.9
							}
						}
					}),
					Input: mergeThemeOverride(Input, multipartComponents.input),
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
			}) as ThemeOverride,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[path]
	);

	return theme;
}
