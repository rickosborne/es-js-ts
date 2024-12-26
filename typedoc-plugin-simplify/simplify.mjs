import { MarkdownPageEvent } from "typedoc-plugin-markdown";

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
	app.renderer.on(MarkdownPageEvent.END, (page) => {
		page.contents = page.contents
			.replace(/#+ Get Signature\n+[^\n]+\n+/sg, "")
			.replace(/#+ Implementation of\n+[^\n]+\n+/sg, "")
			.replace(/#+ Type Parameters\n+(?:• \*\*[A-Z]\*\*\n+)+/sg, "")
			.replace(/#+ Parameters\n+.+?(?=#+ Returns)/sg, "")
			.replace(/#+ Returns\n+[^\n]+\n+(?=\*\*\*|#|$)/sg, "")
			.replace(/(#+) Accessors\n+(#\1 [^\n]+\n+)+/sg, "")
			.replace(/#+ (\w+)\(\)\n+(> \*\*\1\*\*)/sg, "$2")
			.replace(/(>[^\n]+)\n\n(?=>)/sg, "$1  \n")
			.replace(/(?<=]\()README.md(?=#)/g, "")
			.replace(/\[(.+?)]\(#.+?\)/g, "$1")
			.replace(/>.+?\n/g, (line) => line.replace(/`/g, ""))
		;
	});
}
