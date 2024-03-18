/** @format */

import cproc from "child_process"
import c from "ansi-colors"

// simple state monitor
let _lastState
export function status(state) {
	if (_lastState) console.log(c.green("[ OK ]"), c.cyan(_lastState))
	if (state) console.log(c.yellow("[ .. ]"), c.cyan(state))
	_lastState = state
}
process.on("beforeExit", () => {
	status(null)
})

/** if the last commit was tagged in Git returns the tag, otherwise returns a default string */
export function getVersion() {
	const command = `git tag -l --contains`
	const fallback = `WIP-` + new Date().toISOString().replaceAll(":", "").replaceAll(":", "") // <-- the default string;
	const result = cproc.execSync(command).toString()
	return result.trim() || fallback
}
