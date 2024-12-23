const process = require("process");

const args = process.argv.slice(2);
/** @type {string[]} */
const positionals = [];
while (args.length > 0) {
	const arg = args.shift();
	if (arg.startsWith("--")) {
		if (!arg.includes("=")) {
			args.shift();
		}
	} else if (!arg.startsWith("-") && arg !== ".") {
		positionals.push(arg);
	}
}
let spec = [
	// "**/*.test.js",
	// "**/*.test.mjs",
	// "**/*.test.cjs",
	"**/*.test.ts",
];
if (positionals.length > 0) {
	spec = positionals;
}
console.log(`spec: ${JSON.stringify(spec)}`);

const config = {
	checkLeaks: true,
	ignore: "node_modules/**/*",
	recursive: true,
	spec,
};

const [ nodeMajor ] = process.versions.node.split(".").map((n) => parseInt(n, 10));

if (nodeMajor < 16) {
	// tsx doesn't work with node 14, and ESM support isn't amazing
	config.spec = config.spec.filter((s) => s.endsWith(".js"));
} else if (nodeMajor < 17) {
	process.env.NODE_NO_WARNINGS = "1";
	config.loader = "tsx";
} else {
	config["node-option"] = [ "import=tsx", "import=source-map-support" ];
}

module.exports = config;
