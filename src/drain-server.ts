import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
	const hackScript = "drain-hack.js"
	const serv = "home"
	const target = ns.args[0].toString()

	if (!target) {
		return
	}

	ns.killall(serv)

	const ramPerThread = ns.getScriptRam(hackScript)
	let serverMaxRam = ns.getServerMaxRam(serv)
	serverMaxRam = serverMaxRam - (serverMaxRam * 0.20)
	const serverUsedRam = ns.getServerUsedRam(serv)
	const threads = Math.floor((serverMaxRam - serverUsedRam) / ramPerThread)

	const pid = ns.exec(hackScript, serv, threads, target)
	if (pid === 0) {
		ns.tprint(`❌ Failed to start ${hackScript} on ${serv}`)
	} else {
		ns.tprint(
			`✅ Started ${hackScript} on ${serv} with ${threads} threads targeting ${target}`
		)
	}
}
