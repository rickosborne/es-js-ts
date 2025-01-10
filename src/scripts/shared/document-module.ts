import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { ApiDeclaredItem, ApiDocumentedItem, ApiItem, ApiItemKind, ApiModel } from "@microsoft/api-extractor-model";
import * as tsdoc from "@microsoft/tsdoc";
import { comparatorBuilder } from "@rickosborne/foundation";
import { readFile, writeText } from "@rickosborne/term";
import * as console from "node:console";
import * as fs from "node:fs";
import * as process from "node:process";
import { buildPlus, distPlus, packagesPlus } from "./project-root.js";

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
				return `[${ id }](#api-${ slug(id) })`;
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
			return [ "`", node.code, "`" ].join("");
		} else if (node instanceof tsdoc.DocFencedCode) {
			return [
				"```typescript",
				node.code.trim(),
				"```",
				"",
			].join("\n");
		} else if (node instanceof tsdoc.DocEscapedText) {
			return node.encodedText;
		} else if (node instanceof tsdoc.DocInlineTag) {
			if (node.tagName === "@link" && node.tagContent.startsWith("import(")) {
				const id = node.tagContent.replace(/^.+?\)\./, "");
				return `[${ id }](#api-${ slug(id) })`;
			}
		} else if (node instanceof tsdoc.DocBlockTag) {
			console.dir(node);
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

export function documentModule(
	moduleName: string,
	apiExtractorTemplate: string,
): void {
	fs.mkdirSync(buildPlus(moduleName), { recursive: true });
	fs.mkdirSync(distPlus(moduleName), { recursive: true });
	const configPath = distPlus(moduleName, "api-extractor.json");
	const configJson = apiExtractorTemplate
		.replace(/\${moduleName}/g, moduleName);
	writeText(configPath, configJson);
	const config = ExtractorConfig.loadFileAndPrepare(configPath);
	// config.packageFolder = distPlus(moduleName, "package.json");
	const extractorResult = Extractor.invoke(config, {
		localBuild: true,
		showDiagnostics: false,
		showVerboseMessages: false,
	});
	if (!extractorResult.succeeded) {
		console.error(`‼️ ${ moduleName } failed`);
		process.exit(1);
	}
	const api = new ApiModel().loadPackage(config.apiJsonFilePath);
	const baseReadMe = readFile(packagesPlus(moduleName, "README.md"));
	const md: string[] = [ "", "***", "", "## API", "" ];
	const sortedMembers = Array.from(api.members[ 0 ]!.members)
		.sort(itemSorter);
	const membersByKind = sortedMembers.reduce((items, item) => {
		let existing = items.get(item.kind);
		if (existing == null) {
			existing = [];
			items.set(item.kind, existing);
		}
		existing.push(item);
		return items;
	}, new Map<ApiItemKind, ApiItem[]>());
	for (const [ kind, members ] of membersByKind.entries()) {
		md.push(`### ${ kind }${ kind.endsWith("s") ? "es" : "s" }`, "");
		for (const member of members) {
			md.push(`#### ${ member.displayName }`, "", `<a id="api-${ slug(member.displayName) }"></a>`, "");
			if (member instanceof ApiDeclaredItem) {
				md.push(
					"```typescript",
					member.excerpt.text
						.replace(/^export declare/, "")
						.replace(/^export type/, "type")
						.replace(/\\u[0-9a-fA-F]{4}/g, (all) => JSON.parse(`"${ all }"`) as string),
					"```",
					"",
				);
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
	writeText(distPlus(moduleName, "README.md"), distReadMe);
	fs.unlinkSync(configPath);
	console.log(`   📝 Documented ${ moduleName }`);
}
