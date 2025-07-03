import { NS } from '@ns'

export async function upgradeStats(
	ns: NS,
	numNodes: number,
	highestLevel: number,
	highestRAM: number,
	highestCores: number
): Promise<void> {
	for (let n = 0; n < numNodes; ++n) {
		// TODO TODO TODO TODO TODO 
		// TODO Mock formula - buy 50 levels - 1 ram upgrade till both max - then cores TODO
		// TODO Stop buying servers once prices hits X soft/hard limit TODO
		// TODO TODO TODO TODO TODO 
		const stats = ns.hacknet.getNodeStats(n)

		return
// 		if (stats.level < highestLevel) {
// 			let upgraded = false
// 			while (!upgraded) {
// 				upgraded = ns.hacknet.upgradeLevel(
// 					n,
// 					highestLevel - stats.level
// 				)
// 				if (!upgraded) await ns.sleep(1000) // Wait for 1 second before trying again if not upgraded
// 			}
// 
// 			ns.tprint(`Node[${n}] --- Level upgraded to ${highestLevel}`)
// 		}
// 
// 		if (stats.ram < highestRAM) {
// 			let upgraded = false
// 			while (!upgraded) {
// 				upgraded = ns.hacknet.upgradeRam(
// 					n,
// 					Math.log2(highestRAM - stats.ram)
// 				)
// 				if (!upgraded) await ns.sleep(1000) // Wait for 1 second before trying again if not upgraded
// 			}
// 
// 			ns.tprint(`Node[${n}] --- RAM upgraded to ${highestRAM}`)
// 		}
// 
// 		if (stats.cores < highestCores) {
// 			let upgraded = false
// 			while (!upgraded) {
// 				upgraded = ns.hacknet.upgradeCore(n, highestCores - stats.cores)
// 				if (!upgraded) await ns.sleep(1000) // Wait for 1 second before trying again if not upgraded
// 			}
// 
// 			ns.tprint(`Node[${n}] --- Cores upgraded to ${highestCores}`)
// 		}
// 	}
}

export async function main(ns: NS): Promise<void> {
	const running = true

	while (running) {
		let currentMoney = ns.getServerMoneyAvailable('home')
		let newNodeCost = ns.hacknet.getPurchaseNodeCost()
		while (newNodeCost <= currentMoney * 0.1) {
			ns.hacknet.purchaseNode()
			currentMoney = ns.getServerMoneyAvailable('home')
			newNodeCost = ns.hacknet.getPurchaseNodeCost()
		}

		let i = 0
		let numNodes = 0
		let highestLevel = 0
		let highestRAM = 0
		let highestCores = 0
		const calculating = true

		while (calculating) {
			try {
				const stats = ns.hacknet.getNodeStats(i)

				highestLevel =
					stats.level > highestLevel ? stats.level : highestLevel
				highestRAM = stats.ram > highestRAM ? stats.ram : highestRAM
				highestCores =
					stats.cores > highestCores ? stats.cores : highestCores

				i++
			} catch (e) {
				numNodes = i

				await upgradeStats(
					ns,
					numNodes,
					highestLevel,
					highestRAM,
					highestCores
				)
				break
			}
		}

		await ns.asleep(5000)
	}
}
