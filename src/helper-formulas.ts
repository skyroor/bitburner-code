import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
	let level = 1
	let ram = 1
	let cores = 1
	for (level = 1; level <= 200; level++) {
		const moneyGainRate = ns.formulas.hacknetNodes.moneyGainRate(
			level,
			ram,
			cores
		)
		ns.write(
			`levelRate.txt`,
			`${moneyGainRate.toString()}, ${ns.hacknet.getLevelUpgradeCost(0, level)}\n`,
			'a'
		)
	}

	level = 1
	ram = 1
	cores = 1
	for (ram = 1; ram <= 64; ram *= 2) {
		const moneyGainRate = ns.formulas.hacknetNodes.moneyGainRate(
			level,
			ram,
			cores
		)
		ns.write(
			`ramRate.txt`,
			`${moneyGainRate.toString()}, ${ns.hacknet.getRamUpgradeCost(0, ram)}\n`,
			'a'
		)
	}

	level = 1
	ram = 1
	cores = 1
	for (cores = 1; cores <= 16; cores++) {
		const moneyGainRate = ns.formulas.hacknetNodes.moneyGainRate(
			level,
			ram,
			cores
		)
		ns.write(
			`coreRate.txt`,
			`${moneyGainRate.toString()}, ${ns.hacknet.getCoreUpgradeCost(0, cores)}\n`,
			'a'
		)
	}
}
