'use strict'

const fs = require('fs')
const path = require('path')

const inputFile = path.resolve(__dirname, '../NetscriptDefinitions.d.ts')
const outputFile = path.resolve(__dirname, 'ram-costs.json')

try {
	const fileContents = fs.readFileSync(inputFile, 'utf-8')

	// Regex to match docblocks and their following method name
	const docblockRegex = /\/\*\*([\s\S]*?)\*\/\s*([a-zA-Z0-9_$\.]+)\s*\(/g

	let results = {}
	let match

	while ((match = docblockRegex.exec(fileContents)) !== null) {
		let docblock = match[1]
		const methodName = match[2]

		// Find all RAM cost entries in docblock, take the last one
		let ramMatches = [...docblock.matchAll(/RAM\s+cost:\s*([\d.]+)\s*GB/gi)]

		if (ramMatches.length > 0) {
			let ramCost = parseFloat(ramMatches[ramMatches.length - 1][1])

			if (!isNaN(ramCost)) {
				results[methodName] = ramCost
			}
		}
	}

	fs.writeFileSync(outputFile, JSON.stringify(results, null, 2))
	console.log(
		`✅ Extracted ${Object.keys(results).length} methods with RAM cost. Results written to: ${outputFile}`
	)
} catch (error) {
	console.error('Error processing file:', error)
}
