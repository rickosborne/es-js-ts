import * as console from "node:console";
import { getModuleNames } from "./shared/module-names.js";
import { updateModuleBarrel } from "./shared/update-module-barrel.js";

for (const moduleName of getModuleNames()) {
	console.log(`📦 ${ moduleName }`);
	updateModuleBarrel(moduleName);
}
