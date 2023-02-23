import {
	Link as RemixLink,
	type LinkProps as RemixLinkProps
} from "@remix-run/react";
import { Link as ChakraLink, type LinkProps } from "@chakra-ui/react";
type Props = LinkProps & RemixLinkProps;

function Link({ to, children, ...rest }: Props) {
	return (
		<ChakraLink
			prefetch="intent"
			transition={".1s"}
			as={RemixLink}
			to={to}
			{...rest}
		>
			{children}
		</ChakraLink>
	);
}

export default Link;
