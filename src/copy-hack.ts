import { NS } from '@ns'
import { getOptimalServer } from 'find-optimal-server.js'

export async function deploy(
	ns: NS,
	script: string,
	map: Record<string, string>,
	accessibleServers: Record<string, number>,
	targetServer: string
): Promise<boolean> {
	const total = Object.keys(accessibleServers).length
	let successCount = 0

	const renderProgressBar = (
		completed: number,
		total: number,
		width = 30
	): string => {
		const filledLength = Math.round((completed / total) * width)
		const bar = '█'.repeat(filledLength) + '-'.repeat(width - filledLength)
		return `[${bar}] ${completed}/${total} (${((completed / total) * 100).toFixed(2)}%)`
	}

	let progress = ''
	for (const [server, threads] of Object.entries(accessibleServers)) {
		ns.killall(server)
		ns.scp(script, server)

		const pid = ns.exec(script, server, threads, targetServer)

		if (pid !== 0) {
			successCount++

			progress = renderProgressBar(successCount, total)
			ns.ui.clearTerminal()
			ns.tprint(`✅ Deployed to ${server} with ${threads} threads`)
			ns.tprint(progress)
		} else {
			ns.ui.clearTerminal()
			ns.tprint(`❌ Deployment to ${server} failed!`)
			ns.tprint(progress)
		}

		await ns.sleep(50)
	}

	ns.tprint('🚀 Deployment finished.')
	return true
}

export async function share_ram(
	ns: NS,
	script: string,
	servers: Array<string>
): Promise<boolean> {
	for (const serv of servers) {
		ns.killall(serv)
		ns.scp(script, serv)
		ns.nuke(serv)

		const serverMaxRam = ns.getServerMaxRam(serv)

		const pid = ns.exec(script, serv)
		if (pid === 0) {
			ns.tprint(`❌ Failed to start ${script} on ${serv}`)
		} else {
			ns.tprint(
				`✅ Started ${script} on ${serv} with sharing ${serverMaxRam}GB of ram`
			)
		}
	}
	return true
}

export async function printNetworkTree(
	ns: NS,
	parents: Record<string, string>
): Promise<void> {
	const children: Record<string, string[]> = {}

	for (const [child, parent] of Object.entries(parents)) {
		if (!children[parent]) {
			children[parent] = []
		}
		children[parent].push(child)
	}

	function printNode(server: string, prefix: string, isLast: boolean): void {
		const branch = isLast ? '└─ ' : '├─ '
		ns.tprint(prefix + branch + server)

		const newPrefix = prefix + (isLast ? '    ' : '│   ')
		const childList = children[server] || []

		for (let i = 0; i < childList.length; i++) {
			const child = childList[i]
			const childIsLast = i === childList.length - 1
			printNode(child, newPrefix, childIsLast)
		}
	}

	ns.tprint('home')
	const rootChildren = children['home'] || []

	for (let i = 0; i < rootChildren.length; i++) {
		const child = rootChildren[i]
		const isLast = i === rootChildren.length - 1
		printNode(child, '', isLast)
	}
}

export async function crawlNetwork(ns: NS): Promise<Record<string, string>> {
	const queue = ['home']

	const visited = new Set()
	visited.add('home')

	const parents: Record<string, string> = {}

	while (queue.length !== 0) {
		const current = queue.shift()
		if (current === undefined) {
			return {}
		}
		const neighbors: Array<string> = ns.scan(current)

		for (const neighbor of neighbors) {
			if (!visited.has(neighbor)) {
				visited.add(neighbor)
				parents[neighbor] = current
				queue.push(neighbor)
			}
		}
	}

	return parents
}

export async function openPorts(
	ns: NS,
	map: Record<string, string>,
	script: string
): Promise<Record<string, number>> {
	const programs = [
		'BruteSSH.exe',
		'FTPCrack.exe',
		'relaySMTP.exe',
		'HTTPWorm.exe',
		'SQLInject.exe',
	]

	let portsAccessible = 0
	for (let i = 0; i < programs.length; ++i) {
		if (ns.fileExists(programs[i])) portsAccessible++
	}

	const accessibleServers: Record<string, number> = {}
	for (const [server, _] of Object.entries(map)) {
		const portsRequired = ns.getServerNumPortsRequired(server)

		const ramCost = ns.getScriptRam(script) 
		const ramAmount = ns.getServerMaxRam(server)

		if ((ramAmount > 0 && portsRequired <= portsAccessible) || server.startsWith('pserv')) {
			accessibleServers[server] = Math.floor(ramAmount/ramCost)
		}

		if (portsRequired > 0 && portsRequired <= portsAccessible) {
			for (let i = 0; i < portsRequired; ++i) {
				switch (programs[i]) {
					case 'BruteSSH.exe': {
						ns.brutessh(server)
						break
					}
					case 'FTPCrack.exe': {
						ns.ftpcrack(server)
						break
					}
					case 'relaySMTP.exe': {
						ns.relaysmtp(server)
						break
					}
					case 'HTTPWorm.exe': {
						ns.httpworm(server)
						break
					}
					case 'SQLInject.exe': {
						ns.httpworm(server)
						break
					}
				}
			}
		}

		if (portsRequired <= portsAccessible) {
			if (!ns.hasRootAccess(server) && server !== 'home') {
				if (!ns.nuke(server)) {
					ns.tprint(`Nuke failed to run on ${server}`)
				}
			}
		}
	}

	return accessibleServers
}

export async function main(ns: NS): Promise<void> {
	// Hacking script to copy and run on servers
	const hackScript = 'ez-hack.js'
	const shareScript = 'share-ram.js'
	const argServer = ns.args[0] || ''
	const optimalServer = await getOptimalServer(ns, argServer.toString())

	const map = await crawlNetwork(ns)
	const accessibleServers = await openPorts(ns, map, hackScript)
	await deploy(ns, hackScript, map, accessibleServers, optimalServer)

	// await printNetworkTree(ns, map)
	// ns.print(hackScript, shareScript, optimalServer)
}
