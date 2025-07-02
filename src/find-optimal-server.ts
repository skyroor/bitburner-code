import { NS } from "@ns";
import { crawlNetwork } from 'crawl-network.js'

export async function getOptimalServer(ns: NS, forceServer = ''): Promise<string> {
	const servers: Record<string, string> = await crawlNetwork(ns)
	const hackingLevel: number = ns.getHackingLevel()
	let optimalServ = ''
	let max = 0
	for (const [server, _] of Object.entries(servers)) {
		const servMax = ns.getServerMaxMoney(server)
		if (ns.getServerRequiredHackingLevel(server) >= hackingLevel / 2) {
			break
		}
		optimalServ = servMax > max ? server : optimalServ
		max = servMax > max ? servMax : max
	}

	return forceServer === '' ? (optimalServ || "n00dles") : forceServer
}
