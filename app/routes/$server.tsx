import { json, type LoaderArgs } from "@remix-run/node"
import { useLoaderData, useSearchParams } from "@remix-run/react"
import { useEffect, useState } from "react";

export async function loader({ request, params }: LoaderArgs) {

    const server = params.server

    console.log(`fetching http://localhost:8000/${server}`);

    const serverData = await fetch(`http://localhost:8000/${server}`, {
        method: 'get'
    })


    return json({ server, serverData })
};

export default function $server() {
    const { server, serverData } = useLoaderData()

    console.log(serverData);

    const [data, setData] = useState({})

    useEffect(() => {
        async function aa() {
            const serverData = await fetch(`http://localhost:8000/${server}`, {
                method: 'get'
            })
            // setData(serverData)
            console.log("serverData", await serverData.json());
        }

        console.log("invoking async function");
        aa()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            {/* {JSON.stringify(data)} */}
        </>
    )
}