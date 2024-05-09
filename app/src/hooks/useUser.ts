import useRootData from "./useRootData";

export default function useUser<T extends boolean = false>(isLogged: T = false as T) {
    const root = useRootData();

    return (isLogged ? root!.user! : root?.user) as T extends true
        ? NonNullable<typeof root.user>
        : typeof root.user;
}
