import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
	// How much RAM each purchased server will have. In this case, it'll
	// be 8GB.
	const ram = 8
	// Iterator we'll use for our loop
	let i = 0
	// Continuously try to purchase servers until we've reached the maximum
	// amount of servers
	while (i < ns.getPurchasedServerLimit()) {
		// Check if we have enough money to purchase a server
		if (
			ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram)
		) {
			ns.purchaseServer('pserv-' + i, ram)
			++i
		}
		//Make the script wait for a second before looping again.
		//Removing this line will cause an infinite loop and crash the game.
		await ns.sleep(1000)
	}
}
