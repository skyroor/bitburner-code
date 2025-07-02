import { NS } from '@ns'

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

