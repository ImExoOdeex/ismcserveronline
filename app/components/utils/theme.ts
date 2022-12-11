import { extendTheme, type ThemeOverride, type ThemeConfig } from '@chakra-ui/react'
import { mode, type StyleFunctionProps } from '@chakra-ui/theme-tools'
import type { Dict } from '@chakra-ui/utils'

const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: true,
    disableTransitionOnChange: true
}

const styles = {
    global: (props: StyleFunctionProps | Dict<any>) => ({
        body: {
            minH: '100vh',
            bg: mode('bg.100', 'bg.900')(props)
        },
        th: {
            color: mode("#393942cc!important", "#dedef1be!important")(props),
        },
        html: {
            '&::-webkit-scrollbar': {
                width: '8px',
                padding: '2px'
            },
            '&::-webkit-scrollbar-track': {
                borderLeft: '1px solid ' + mode('#e9e7ee', '#272729')(props)
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: mode('#c2c2c2', '#272729')(props),
                borderRadius: '5px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: mode('#a1a1a1', '#1b1b1d')(props),
            },
            '&::-webkit-scrollbar-thumb:active': {
                backgroundColor: mode('#c4c4c4', '#39393a')(props),
            },
            '*::selection': {
                backgroundColor: mode("#0078D7", '#8F4FD3')(props)
            }
        }
    })
}

const colors = {
    brand: {
        100: '#a263e6',
        200: '#8F4FD3',
        300: '#8F4FD3',
        400: '#8F4FD3',
        500: '#8F4FD3',
        600: '#8F4FD3',
        700: '#8F4FD3',
        800: '#8F4FD3',
        900: '#8F4FD3',
    },
    bg: {
        100: '#ffffff',
        900: `#0f0f0f`,
    },
    sec: {
        100: "#93b8e9",
        900: "#0078D7"
    }
}
const theme = extendTheme({
    colors, config, styles,
    fonts: {
        body: `"Poppins", sans-serif`,
        heading: `"Poppins", sans-serif`,
    },
    semanticTokens: {
        colors: {
            brand: {
                default: 'brand.900',
                _dark: 'brand.100'
            },
            sec: {
                default: '#0078D7',
                _dark: "#93b8e9"
            },
            text: {
                default: 'blackAlpha.900',
                _dark: 'whiteAlpha.900'
            },
            textSec: {
                default: 'blackAlpha.800',
                _dark: 'whiteAlpha.800'
            },
            inv: {
                default: 'white',
                _dark: 'black'
            },
            red: {
                default: 'red.500',
                _dark: 'red.400'
            },
            green: {
                default: 'green.500',
                _dark: 'green.400'
            },
            bg: {
                default: 'bg.100',
                _dark: 'bg.900'
            },
            alpha: {
                default: 'blackAlpha.50',
                _dark: 'whiteAlpha.50'
            },
            raisedBg: {
                default: "#f6f6ff",
                _dark: "#18181b"
            }
        }
    },
    components: {
        Tooltip: {
            baseStyle: {
                bg: "#1d1d22",
                "--tooltip-bg": "#1d1d22",
                _dark: {
                    "--tooltip-bg": "#fff",
                    bg: "bg.100",
                }
            }
        },
        Button: {
            variants: {
                brand: {
                    bg: 'brand.900',
                    color: 'whiteAlpha.900',
                    _hover: {
                        bg: '#8f4fd3ca'
                    },
                    _active: {
                        bg: '#8f4fd3e6'
                    },
                },
                sec: {
                    bg: 'sec.900',
                    color: 'whiteAlpha.900',
                    _hover: {
                        bg: '#0866b3'
                    },
                    _active: {
                        bg: '#278adb'
                    },
                },
            }
        },
        IconButton: {
            variants: {
                brand: {
                    bg: 'brand.900',
                    color: 'whiteAlpha.900',
                    _hover: {
                        bg: '#8f4fd3ca'
                    },
                    _active: {
                        bg: '#8f4fd3e6'
                    },
                },
            }
        },
        Link: {
            variants: {
                subtle: {
                    bg: "rgba(0, 120, 215, .15)",
                    px: 4,
                    py: 3,
                    mx: 4,
                    my: 3,
                    rounded: '2xl',
                    fontWeight: '600',
                    m: 0

                    ,
                    _dark: {
                        bg: "#7093c24c",
                    },
                    _hover: {
                        textDecor: 'none',
                        bg: "rgba(0, 120, 215, .20)",
                        _dark: {
                            bg: "#6789b659"
                        }
                    }
                },
                subtleBrand: {
                    bg: "rgba(143, 79, 211, .15)",
                    px: 4,
                    py: 3,
                    mx: 4,
                    my: 3,
                    rounded: '2xl',
                    fontWeight: '600',
                    m: 0

                    ,
                    _dark: {
                        bg: "rgba(143, 79, 211, .10)",
                    },
                    _hover: {
                        textDecor: 'none',
                        bg: "rgba(143, 79, 211, .2)",
                        _dark: {
                            bg: "rgba(143, 79, 211, .15)"
                        }
                    }
                }
            }
        }
    }
}) as ThemeOverride

export default theme