import { NS } from "@ns";

export async function getOptimalServer(ns: NS, forceServer = ''): Promise<string> {
	const servers: Array<string> = ns.scan()
	const hackingLevel: number = ns.getHackingLevel()
	let optimalServ = ''
	let max = 0
	for (let i = 0; i < servers.length; ++i) {
		const serv = servers[i]
		const servMax = ns.getServerMaxMoney(serv)
		if (ns.getServerRequiredHackingLevel(serv) >= hackingLevel / 2) {
			break
		}
		optimalServ = servMax > max ? serv : optimalServ
		max = servMax > max ? servMax : max
	}
	return forceServer === '' ? (optimalServ || "n00dles") : forceServer
}
