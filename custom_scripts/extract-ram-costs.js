const fs = require('fs')
const path = require('path')

const inputFile = path.resolve(__dirname, '../NetscriptDefinitions.d.ts') // or NetscriptDefinitions.d.ts
const outputFile = path.resolve(__dirname, 'bitburner-ram.json')

const file = fs.readFileSync(inputFile, 'utf-8')

// Step 1: Match docblocks with @remarks RAM cost
const docblockRegex =
	/\/\*\*([\s\S]*?)\*\/\s*\n\s*([a-zA-Z0-9_.]+\??\s*[:=]\s*)?(function\s*)?([a-zA-Z0-9_]+)\s*\(/g

const result = {}
let match

while ((match = docblockRegex.exec(file)) !== null) {
	const [, docblock, , , fnName] = match

	const ramMatch = docblock.match(
		/@remarks[\s\S]*?RAM cost:\s*([\d.]+)\s*GB/i
	)
	if (!ramMatch) continue

	const ram = parseFloat(ramMatch[1])
	if (!isNaN(ram)) {
		result[fnName] = ram
	}
}

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2))
console.log(
	`✅ RAM cost table exported to ${outputFile} (${Object.keys(result).length} entries)`
)
