const js = require("@eslint/js");
const tse = require("@typescript-eslint/eslint-plugin");
const tsp = require("@typescript-eslint/parser");
const json = require("eslint-plugin-jsonc");
const sortKeysFix = require("eslint-plugin-sort-keys-fix");
const editorConfig = require("eslint-plugin-editorconfig");
const globals = require("globals");
const stylistic = require("@stylistic/eslint-plugin-js");
const fs = require("node:fs");
const requireExtensions = require("eslint-plugin-require-extensions");
const markdown = require("eslint-plugin-markdown");
const path = require("node:path");

/**
 * Load the `ignores` definitions from the `.gitignore` instead of replicating it.
 */
const ignores = fs.readFileSync(path.join(__dirname, ".gitignore"), { encoding: "utf-8" })
	.split("\n")
	// remove comments
	.map((line) => line.replace(/#.*$/g, "").trim())
	// remove empty lines
	.filter((line) => line !== "")
	// Turn trailing slashes into globs
	.map((line) => line.endsWith("/") ? line.concat("*") : line);

console.debug("eslint ignores: ", ignores);

module.exports = [
	{
		ignores,
	},
	{
		...js.configs.recommended,
		files: [ "**/*.js" ],
		languageOptions: {
			ecmaVersion: "latest",
			globals: { ...globals.node },
			sourceType: "commonjs",
		},
	},
	{
		...js.configs.recommended,
		files: [ "**/*.mjs" ],
		languageOptions: {
			ecmaVersion: "latest",
			globals: { ...globals.node },
			sourceType: "module",
		},
	},
	...[
		tse.configs["recommended-type-checked"],
		tse.configs["stylistic-type-checked"],
	].map((c) => ({
		files: [ "**/*.ts", "**/*.tsx", "**/*.mts" ],
		languageOptions: {
			parser: tsp,
			// ...c.languageOptions,
			parserOptions: {
				// ...c.languageOptions?.parserOptions,
				project: "tsconfig.json",
				tsconfigRootDir: __dirname,
			},
		},
		plugins: {
			"@typescript-eslint": tse,
		},
		rules: {
			...c.rules,
			"@typescript-eslint/consistent-type-definitions": [ "error", "type" ],
		},
	})),
	{
		plugins: {
			"@stylistic/js": stylistic,
			editorConfig,
			markdown,
			"require-extensions": requireExtensions,
			sortKeysFix,
		},
	},
	...json.configs["flat/recommended-with-json"],
	{
		rules: {
			"jsonc/key-spacing": "error",
			"jsonc/no-irregular-whitespace": "error",
			"jsonc/sort-keys": "error",
			"quotes": [
				"error",
				"double",
				{
					allowTemplateLiterals: true,
					avoidEscape: true,
				},
			],
			"sort-keys": "off",
		},
	},
	// markdown.configs.recommended,
	{
		files: [ "**/*.md" ],
		processor: "markdown/markdown",
	},
	// {
	// 	files: [ "**/*.md/*.ts" ],
	// 	...tse.configs.disableTypeChecked,
	// },
	{
		rules: {
			"@stylistic/js/no-extra-parens": "off",
			"@stylistic/js/space-infix-ops": "error",
			"array-bracket-spacing": [ "error", "always" ],
			"comma-dangle": [ "error", "always-multiline" ],
			"eol-last": [ "error", "always" ],
			"linebreak-style": [ "error", "unix" ],
			"no-mixed-spaces-and-tabs": "error",
			"no-multi-spaces": "error",
			"no-trailing-spaces": "error",
			"object-curly-spacing": [ "error", "always" ],
			"semi": [ "error", "always" ],
			"sort-imports": [
				"error",
				{ ignoreDeclarationSort: true },
			],
			...requireExtensions.configs.recommended.rules,
		},
	},
	{
		files: [ "**/*.schema.d.ts" ],
		rules: {
			"@typescript-eslint/consistent-indexed-object-style": "off",
			"@typescript-eslint/consistent-type-definitions": "off",
		},
	},
	{
		files: [ "package.json", "package-lock.json" ],
		rules: {
			"jsonc/sort-keys": [
				"error",
				{
					/**
					 * Because someone at Node is a monster.
					 */
					order: [
						"types",
						"import",
						"require",
						"default",
					],
					pathPattern: "^exports\\[.+?\\]$",
				},
				{
					pathPattern: ".*",
					order: { type: "asc" },
				},
			],
		},
	},
];
