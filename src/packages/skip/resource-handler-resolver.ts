import type { ResourceHandlerResolver, RunStateMachineOptions } from "./run-types.js";
import type { ResourceURI } from "./sfn-types.js";

/**
 * Given some State Machine options, generate a function which can resolve Resource
 * URIs to Lambda-like function implementations.
 */
export const resourceHandlerResolver = (options: RunStateMachineOptions): ResourceHandlerResolver => {
	if (typeof options.fnForResource === "function") {
		return options.fnForResource;
	}
	const resourceFns = options.fnForResource ?? {};
	return (resourceUri: ResourceURI) => {
		const fn = resourceFns[ resourceUri ];
		if (fn == null) {
			throw new Error(`No function found for resource: ${ resourceUri }`);
		}
		return fn;
	};
};
