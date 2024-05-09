export async function getCpuUsage(): Promise<number> {
    throw new Error("Not implemented");
    // return new Promise((r) => {
    //     cpuUsage((v) => {
    //         r(Number((v * 100).toFixed(0)));
    //     });
    // });
}
