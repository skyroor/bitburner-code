import { NS } from "@ns";
import { getOptimalServer } from 'find-optimal-server.js'
import { advancedDeploy } from 'deploy-hacks.js'

export async function main(ns: NS): Promise<void> {
	const uploadScripts = { 'weaken.js': 5, 'grow.js': 10, 'hack.js': 2}
	const serv = "home"

	const keys = Object.keys(uploadScripts)
	for (const script of keys) {
		ns.scriptKill(script, 'home')
	}

	const argServer = ns.args[0] || ''
	const optimalServer = await getOptimalServer(ns, argServer.toString())

	let serverMaxRam = ns.getServerMaxRam(serv)
	serverMaxRam = serverMaxRam - (serverMaxRam * 0.20)
	const serverUsedRam = ns.getServerUsedRam(serv)

	await advancedDeploy(ns, uploadScripts, {'home': (serverMaxRam - serverUsedRam)}, optimalServer)
}
