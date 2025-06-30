import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
	// Defines the "target server", which is the server
	const running = true
	const optimalServer: string = ns.args[0].toString()
	const target: string = optimalServer

	let moneyThresh: number = ns.getServerMaxMoney(target)
	let securityThresh: number = ns.getServerMinSecurityLevel(target)
	moneyThresh = moneyThresh - (moneyThresh * 0.20)
	securityThresh = securityThresh + (securityThresh * 0.20)

	// If we have the BruteSSH.exe program, open the SSH Port
	if (ns.fileExists('BruteSSH.exe', 'home')) {
		ns.brutessh(target)
	}

	// Get root access to target server
	ns.nuke(target)

	while (running) {
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			// If the server's security level is above our threshold, weaken it
			ns.print("---- WEAKEN ----")
			await ns.weaken(target)
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			// If the server's money is less than our threshold, grow it
			ns.print("---- GROW ----")
			await ns.grow(target)
		} else {
			// Otherwise, hack it
			ns.print("---- HACKING ----")
			await ns.hack(target)
		}
	}
}
