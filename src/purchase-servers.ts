import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
	// How much RAM each purchased server will have. In this case, it'll
	// be 8GB.
	if (ns.args[0] === undefined) {
		ns.tprint('Please enter an amount of RAM or type -l to list ram values and cost')
		return
	}

	if (ns.args[0] === '-l') {
		for (let ram = 2; ram <= 1048576; ram *= 2) {
			ns.tprint(`${ram}GB: $${ns.getPurchasedServerCost(ram).toLocaleString()}`);
		}
	} else {
		const ram: number = Number(ns.args[0]) || 0
		let i = 0

		while (i < ns.getPurchasedServerLimit()) {
			// Check if we have enough money to purchase a server
			if (
				ns.getServerMoneyAvailable('home')/2 >= ns.getPurchasedServerCost(ram)
			) {
				const ownedServers = ns.getPurchasedServers()
				ns.purchaseServer(`pserv-${ownedServers.length}`, ram)
				++i
			}
			//Make the script wait for a second before looping again.
			//Removing this line will cause an infinite loop and crash the game.
			await ns.asleep(1000)
		}
	}
}
