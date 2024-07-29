import { commitSession, getSession } from "@/.server/session";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import { LoginDiscordButton } from "@/layout/global/Header/Buttons";
import config from "@/utils/config";
import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Button,
    Flex,
    HStack,
    Icon,
    Link
} from "@chakra-ui/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { FaQuestionCircle } from "react-icons/fa";
import { typedjson } from "remix-typedjson";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get("Cookie"));

    const loginError: string = session.get("login-error") || "Unknown error";

    return typedjson(
        {
            loginError
        },
        {
            headers: {
                "Set-Cookie": await commitSession(session)
            }
        }
    );
}

export default function LoginError() {
    const { loginError } = useAnimationLoaderData<typeof loader>();

    return (
        <Flex
            flexDir={"column"}
            maxW={"1200px"}
            mx={"auto"}
            w={"100%"}
            mt={"75px"}
            px={4}
            gap={10}
            alignItems={"center"}
        >
            <Alert
                status="error"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                py={10}
            >
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                    Login error
                </AlertTitle>
                <AlertDescription
                    maxWidth="sm"
                    fontWeight={600}
                    color={"red"}
                    fontSize={"xl"}
                    lineHeight={"175%"}
                >
                    {loginError}
                </AlertDescription>

                <HStack mt={4}>
                    <LoginDiscordButton text="Try again" px={6} />
                    <Button
                        px={6}
                        rightIcon={<Icon as={FaQuestionCircle} />}
                        as={Link}
                        isExternal
                        href={config.discordServerInvite}
                    >
                        Support
                    </Button>
                </HStack>
            </Alert>
        </Flex>
    );
}
