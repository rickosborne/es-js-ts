import { describe, expect, test } from "tstyche";
import type { JSONataPassState, JSONPathPassState, QueryLanguageJSONata, QueryLanguageJSONPath, StateMachine, StateMachineOf, TaskState } from "../sfn-types.js";

describe("States Language examples", () => {
	/**
	 * @see {@link https://states-language.net/#example | Hello World}
	 */
	test("Hello World", () => {
		const helloWorld = {
			Comment: "A simple minimal example of the States language",
			StartAt: "Hello World",
			States: {
				"Hello World": {
					Type: "Task",
					Resource: "arn:aws:lambda:us-east-1:123456789012:function:HelloWorld",
					End: true,
				},
			},
		} satisfies StateMachine;

		expect(helloWorld).type.toBeAssignableTo<StateMachine>();
		expect(helloWorld.States["Hello World"]).type.toBeAssignableTo<TaskState>();
	});

	/**
	 * @see {@link https://states-language.net/#data | Data}
	 */
	test("Data", () => {
		const add = {
			StartAt: "Add",
			States: {
				Add: {
					Type: "Task",
					Resource: "arn:aws:lambda:us-east-1:123456789012:function:Add",
					End: true,
				},
			},
		} satisfies StateMachine;

		expect(add).type.toBeAssignableTo<StateMachine>();
		expect(add.States.Add).type.toBeAssignableTo<TaskState>();
	});

	test("Query Languages", () => {
		const topLevelJSONata = {
			QueryLanguage: "JSONata",
			StartAt: "Hello World",
			States: {
				"Hello World": {
					Type: "Task",
					Resource: "arn:aws:lambda:us-east-1:123456789012:function:HelloWorld",
					End: true,
				},
			},
		} satisfies StateMachineOf<"Hello World", QueryLanguageJSONata>;
		expect(topLevelJSONata).type.toBeAssignableTo<StateMachine>();
		expect(topLevelJSONata).type.toBeAssignableTo<StateMachineOf<"Hello World", QueryLanguageJSONata>>();
		const overrides = {
			QueryLanguage: "JSONPath",
			StartAt: "JSONPath state",
			States: {
				"JSONPath state": {
					Type: "Pass",
					Parameters: {
						"total.$": "$.transaction.total",
					},
					Next: "JSONata state",
				},
				"JSONata state": {
					Type: "Pass",
					QueryLanguage: "JSONata",
					Output: {
						total: "{% $states.input.transaction.total %}",
					},
					End: true,
				},
			},
		} satisfies StateMachineOf<"JSONPath state" | "JSONata state", QueryLanguageJSONPath>;
		expect(overrides).type.toBeAssignableTo<StateMachine>();
		expect(overrides).type.toBeAssignableTo<StateMachineOf<"JSONPath state" | "JSONata state", QueryLanguageJSONPath>>();
		expect(overrides.States["JSONPath state"]).type.toBeAssignableTo<JSONPathPassState>();
		expect(overrides.States["JSONata state"]).type.toBeAssignableTo<JSONataPassState>();
	});
});
