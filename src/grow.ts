import { NS } from "@ns"

export async function main(ns: NS): Promise<void> {
	const optimalServer: string = ns.args[0].toString()
	const target: string = optimalServer

	while(true) {
		await ns.grow(target)
	}
}
