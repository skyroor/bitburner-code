import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
	// Defines the "target server", which is the server
	const optimalServer: string = ns.args[0].toString()
	const target: string = optimalServer

	if (ns.fileExists('BruteSSH.exe', 'home')) {
		ns.brutessh(target)
	}
	// Get root access to target server
	ns.nuke(target)
	// Infinite loop that continously hacks/grows/weakens the target server
	await ns.grow(target)
	while (true) {
		if (ns.getServerMoneyAvailable(target) > 0) {
			await ns.hack(target)
		}
	}
}

