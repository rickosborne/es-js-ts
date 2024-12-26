import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { ApiDeclaredItem, ApiDocumentedItem, ApiItem, ApiItemKind, ApiModel } from "@microsoft/api-extractor-model";
import * as tsdoc from "@microsoft/tsdoc";
// noinspection ES6PreferShortImport
import { comparatorBuilder } from "../foundation/ts/comparator.js";
import * as process from "node:process";
import { fileExists } from "./shared/file-exists.js";
import { getModuleNames } from "./shared/module-names.js";
import { projectRoot, rootPlus } from "./shared/project-root.js";
import { readFile } from "./shared/read-file.js";
import { writeText } from "./shared/write-file.js";

const itemSorter = comparatorBuilder<ApiItem>()
	.str((item) => item.kind)
	.str((item) => item.displayName)
	.build();

const slug = (text: string): string => {
	return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
};

const mdFromDocComment = (doc: tsdoc.DocComment): string | undefined => {
	const md: string[] = [];
	const renderNode = (node: tsdoc.DocNode): string | undefined => {
		if (node instanceof tsdoc.DocPlainText) {
			return node.text;
		} else if (node instanceof tsdoc.DocHtmlStartTag || node instanceof tsdoc.DocHtmlEndTag) {
			return node.emitAsHtml();
		} else if (node instanceof tsdoc.DocLinkTag) {
			if (node.urlDestination != null) {
				return `[${ node.linkText ?? node.urlDestination }](${ node.urlDestination })`;
			} else if (node.codeDestination != null) {
				const id = node.codeDestination.memberReferences.map((ref) => {
					return ref.memberIdentifier?.identifier;
				}).filter((i) => i != null)
					.join(".");
				if (id === "") {
					throw new Error(`No member identifier`);
				}
				return `[${id}](#api-${slug(id)})`;
			}
			return "??? @link ???";
		} else if (node instanceof tsdoc.DocParagraph) {
			const text = node.getChildNodes().map((n) => renderNode(n))
				.filter((t) => t != null)
				.join("");
			return text === "" ? undefined : text;
		} else if (node instanceof tsdoc.DocSoftBreak) {
			return "\n";
		} else if (node instanceof tsdoc.DocCodeSpan) {
			return [ "`", node.code, "`" ].join(" ");
		} else if (node instanceof tsdoc.DocFencedCode) {
			return [
				"```typescript",
				node.code.trim(),
				"```",
				"",
			].join("\n");
		} else if (node instanceof tsdoc.DocEscapedText) {
			return node.encodedText;
		}
		throw new Error(`Unknown node kind: ${ node.kind }`);
	};
	for (const node of doc.summarySection.nodes) {
		const text = renderNode(node);
		if (text != null) {
			md.push(text);
		}
	}
	return md.length === 0 ? undefined : md.join("\n").concat("\n");
};

for (const moduleName of getModuleNames({
	dirEntPredicate: (de) => fileExists(projectRoot, de.name, "api-extractor.json"),
})) {
	console.log(`📦 ${ moduleName }`);
	const configPath = rootPlus(moduleName, "api-extractor.json");
	const config = ExtractorConfig.loadFileAndPrepare(configPath);
	const extractorResult = Extractor.invoke(config, {
		localBuild: true,
		showVerboseMessages: true,
	});
	if (!extractorResult.succeeded) {
		console.error(`‼️ ${ moduleName } failed`);
		process.exit(1);
	}
	const api = new ApiModel().loadPackage(config.apiJsonFilePath);
	const baseReadMe = readFile(rootPlus(moduleName, "README.md"));
	const md: string[] = [ "***", "", "## API", "" ];
	const membersByKind = api.members[ 0 ].members.toSorted(itemSorter).reduce((items, item) => {
		let existing = items.get(item.kind);
		if (existing == null) {
			existing = [];
			items.set(item.kind, existing);
		}
		existing.push(item);
		return items;
	}, new Map<ApiItemKind, ApiItem[]>());
	for (const [ kind, members ] of membersByKind.entries()) {
		md.push(`### ${ kind }${ kind.endsWith("s") ? "es" : "s"}`, "");
		for (const member of members) {
			md.push(`#### ${ member.displayName }`, "", `<a id="api-${slug(member.displayName)}"></a>`, "");
			if (member instanceof ApiDeclaredItem) {
				md.push("```typescript", member.excerpt.text.replace(/^export /, ""), "```", "");
			}
			if (member instanceof ApiDocumentedItem) {
				const comment = member.tsdocComment;
				if (comment != null) {
					const text = mdFromDocComment(comment);
					if (text != null) {
						md.push(text);
					}
				}
			}
		}
	}
	const distReadMe = baseReadMe.concat(md.join("\n"), "\n");
	writeText(rootPlus(moduleName, "dist", "README.md"), distReadMe);
}
