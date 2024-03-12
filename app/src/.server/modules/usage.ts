import { cpuUsage } from "os-utils";

export async function getCpuUsage(): Promise<number> {
	return new Promise((r) => {
		cpuUsage((v) => {
			r(Number((v * 100).toFixed(0)));
		});
	});
}
