import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
	const running = true
	while(running) {
		await ns.share()
	}
}
