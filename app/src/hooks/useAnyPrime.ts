import useUser from "@/hooks/useUser";

interface ServerProps {
    prime: boolean;
}

// check if user or server has prime
export default function useAnyPrime({ prime }: ServerProps) {
    const user = useUser();

    if (user?.prime || prime) {
        return true;
    }
    return false;
}
