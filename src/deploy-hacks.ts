import { NS } from '@ns'
import { getOptimalServer } from 'find-optimal-server.js'
import { crawlNetwork } from 'crawl-network.js'

export async function deploy(
	ns: NS,
	script: string,
	map: Record<string, string>,
	hostServers: Record<string, number>,
	targetServer: string
): Promise<boolean> {
	const total = Object.keys(hostServers).length
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
	for (const [server, threads] of Object.entries(hostServers)) {
		ns.killall(server)
		ns.scp(script, server)

		let pid: number
		if (script === 'share-ram.js') {
			pid = ns.exec(script, server, threads)
		} else {
			pid = ns.exec(script, server, threads, targetServer)
		}

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

		await ns.asleep(50)
	}

	ns.tprint(
		`🚀 Deployment finished. Deployed servers now targeting ${targetServer} with ☠️${script}☠️`
	)
	return true
}

export async function advancedDeploy(
	ns: NS,
	scripts: Record<string, number>,
	hostServers: Record<string, number>,
	targetServer: string
): Promise<boolean> {
	const total = Object.keys(hostServers).length
	const keys = Object.keys(scripts)
	const values = Object.values(scripts)

	const renderProgressBar = (
		completed: number,
		total: number,
		width = 30
	): string => {
		const filledLength = Math.round((completed / total) * width)
		const bar = '█'.repeat(filledLength) + '-'.repeat(width - filledLength)
		return `[${bar}] ${completed}/${total} (${((completed / total) * 100).toFixed(2)}%)`
	}

	const maxScriptRam = Math.max(
		...keys.map(script => ns.getScriptRam(script))
	)

	const ratios: Record<string, number> = {}
	const partsSum = values.reduce((sum, val) => sum + val, 0)
	for (const [key, parts] of Object.entries(scripts)) {
		ratios[key] = parts / partsSum
	}

	for (const [server, maxServerRam] of Object.entries(hostServers)) {
		let successCount = 0
		let progress = ''
		let pid: number
		let success = false
		let noFailures = true

		let threads = 1
		const maxThreads = maxServerRam / maxScriptRam 

		for (const script of keys) {
			ns.scriptKill(script, server)
		}

		for (const [script, ratio] of Object.entries(ratios)) {
			threads = Math.floor(maxThreads * ratio) || 1

			if (script === keys.at(-1)) {
				threads = Math.floor((maxServerRam - ns.getServerUsedRam(server)) / ns.getScriptRam(script)) || 1
			}

			ns.scp(script, server)

			pid = ns.exec(script, server, threads, targetServer)
			if ((pid !== 0) && noFailures) {
				success = true
			} else {
				success = false
				noFailures = false
			}

			ns.tprint(`${progress} --- ${threads} of ${script}`)
			await ns.asleep(100)
		}

		if (success) {
			successCount++
			progress = renderProgressBar(successCount, total)
			ns.ui.clearTerminal()
			ns.tprint(`✅ Deployed to ${server} with ${threads} threads`)
		} else {
			ns.ui.clearTerminal()
			ns.tprint(`❌ Deployment to ${server} failed!`)
		}

		await ns.asleep(100)
	}

	ns.tprint(
		`🚀 Deployment finished. Deployed servers now targeting ${targetServer}`
	)
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

export async function openPorts(
	ns: NS,
	map: Record<string, string>,
	script: string
): Promise<Record<string, number>> {
	let portsAccessible = 0

	let hasTor = ns.hasTorRouter()
	while (!hasTor) {
		// hasTor = ns.singularity.purchaseTor()
		hasTor = ns.hasTorRouter()
		if (!hasTor) {
			ns.alert('Cannot afford Tor Router -- Will re-attempt purchase.')
			await ns.asleep(5000)
		}
	}

	// const programs = ns.singularity.getDarkwebPrograms()
	const portPrograms = [
		'BruteSSH.exe',
		'FTPCrack.exe',
		'relaySMTP.exe',
		'HTTPWorm.exe',
		'SQLInject.exe',
	]

	const programs = [
		'ServerProfiler.exe',
		'DeepscanV1.exe',
		'DeepscanV2.exe',
		'AutoLink.exe',
		'Formulas.exe',
	]

	for (const program of portPrograms) {
		if (!ns.fileExists(program)) {
			// if (ns.singularity.getDarkwebProgramCost(program) < ns.getServerMoneyAvailable('home')*0.1) {
			//	ns.singularity.purchaseProgram(program)
			// }
		} else {
			portsAccessible++
		}
	}

	const accessibleServers: Record<string, number> = {}
	for (const [server, _] of Object.entries(map)) {
		const portsRequired = ns.getServerNumPortsRequired(server)

		const ramCost = ns.getScriptRam(script)
		const ramAmount = ns.getServerMaxRam(server)
		let threads = Math.floor(ramAmount / ramCost)
		if (script === 'share-ram.js') {
			threads = Math.ceil(threads / 4)
		}

		if (
			(ramAmount > 0 && portsRequired <= portsAccessible) ||
			server.startsWith('pserv')
		) {
			accessibleServers[server] = ramAmount
		}

		if (portsRequired > 0 && portsRequired <= portsAccessible) {
			for (let i = 0; i < portsRequired; ++i) {
				switch (portPrograms[i]) {
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
						ns.sqlinject(server)
						break
					}
				}
			}
		}

		if (portsRequired <= portsAccessible) {
			if (!ns.hasRootAccess(server) && server !== 'home') {
				ns.tprint(server)
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

	const map = await crawlNetwork(ns)

	const uploadScript = argServer === 'share' ? shareScript : hackScript
	const uploadScripts = { 'weaken.js': 10, 'grow.js': 20, 'hack.js': 1}

	const accessibleServers = await openPorts(ns, map, uploadScript)
	const optimalServer = await getOptimalServer(ns, argServer.toString())
	// await deploy(ns, uploadScript, map, accessibleServers, optimalServer)
	await advancedDeploy(ns, uploadScripts, accessibleServers, optimalServer)

	// await printNetworkTree(ns, map)
	// ns.print(hackScript, shareScript, optimalServer)
}
