import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
	await ns.sleep(500)

	// Defines the "target server", which is the server
	const running = true
	const optimalServer: string = ns.args[0].toString()
	const target: string = optimalServer
	const isHome: boolean = ns.args[1] !== undefined ? true : false

	let moneyThresh: number = ns.getServerMaxMoney(target)
	let securityThresh: number = ns.getServerMinSecurityLevel(target)
	moneyThresh = moneyThresh - (moneyThresh * 0.20)
	securityThresh = securityThresh + (securityThresh * 0.20)

	// If we have the BruteSSH.exe program, open the SSH Port
	if (ns.fileExists('BruteSSH.exe', 'home')) {
		ns.brutessh(target)
	}

	// Get root access to target server
	ns.nuke(target)

	function updateTerminal(target: string, att: string, money: number, sec: number) {
		if (isHome) {
			const strMoney = money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
			const maxMoney = ns.getServerMaxMoney(target).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
			ns.tprint(`---- ${target} [${att}][$${strMoney}/${maxMoney}][SEC:${sec}] ----`)
		}
	}

	while (running) {
		const secLevel = Math.floor(ns.getServerSecurityLevel(target))
		const moneyAvailable = Math.floor(ns.getServerMoneyAvailable(target))
		let currentAttack = ''

		if (secLevel > securityThresh) {
			currentAttack = 'WEAKEN'
			updateTerminal(target, currentAttack, moneyAvailable, secLevel)
			await ns.weaken(target)
		} else if (moneyAvailable < moneyThresh) {
			currentAttack = 'GROW'
			updateTerminal(target, currentAttack, moneyAvailable, secLevel)
			await ns.grow(target)
		} else {
			currentAttack = 'HACK'
			updateTerminal(target, currentAttack, moneyAvailable, secLevel)
			await ns.hack(target)
		}
	}
}
