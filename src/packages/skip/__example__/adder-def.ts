import { addImpl } from "./adder-impl.js";

const isValidInput = (value: unknown): value is {val1: number; val2: number} => {
	return value != null && typeof value === "object" && "val1" in value && typeof value.val1 === "number" && "val2" in value && typeof value.val2 === "number";
};

export const addStateMachine = (input?: unknown): number => {
	if (isValidInput(input)) {
		// noinspection UnnecessaryLocalVariableJS
		const result = addImpl(input);
		return result;
	} else {
		throw new SyntaxError("Expected: {val1: number, val2: number}");
	}
};
