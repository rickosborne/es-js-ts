import { readFile } from "@rickosborne/term";
import { documentModule } from "./shared/document-module.js";
import { getModuleNames } from "./shared/module-names.js";
import { staticPlus } from "./shared/project-root.js";

const apiExtractorTemplate = readFile(staticPlus("api-extractor.template.json"));

for (const moduleName of getModuleNames()) {
	console.log(`📦 ${ moduleName }`);
	documentModule(moduleName, apiExtractorTemplate);
}
