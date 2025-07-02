import { NS } from "@ns";
import { getOptimalServer } from 'find-optimal-server.js'

export async function main(ns: NS): Promise<void> {
	const hackScript = "ez-hack.js"
	const serv = "home"

	ns.kill(hackScript)

	const argServer = ns.args[0] || ''
	const optimalServer = await getOptimalServer(ns, argServer.toString())

	const ramPerThread = ns.getScriptRam(hackScript)
	let serverMaxRam = ns.getServerMaxRam(serv)
	serverMaxRam = serverMaxRam - (serverMaxRam * 0.20)
	const serverUsedRam = ns.getServerUsedRam(serv)
	const threads = Math.floor((serverMaxRam - serverUsedRam) / ramPerThread)

	const isHome = true
	const pid = ns.exec(hackScript, serv, threads, optimalServer, isHome)
	if (pid === 0) {
		ns.tprint(`❌ Failed to start ${hackScript} on ${serv}`)
	} else {
		ns.tprint(
			`✅ Started ${hackScript} on ${serv} with ${threads} threads targeting ${optimalServer}`
		)
	}
}
