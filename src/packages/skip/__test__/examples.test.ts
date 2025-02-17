import { sleep } from "@rickosborne/foundation";
import type { JSONSerializable } from "@rickosborne/typical";
import { expect } from "chai";
import { describe, test } from "mocha";
import { runStateMachine } from "../run-state-machine.js";
import { type FailState, JSONATA, type JSONataPassState, JSONPATH, type StateMachine, STATES_TIMEOUT, type WaitState } from "../sfn-types.js";
import { StatesError } from "../states-error.js";

describe("States Language Examples", () => {
	const adderStateMachine = {
		StartAt: "Add",
		States: {
			Add: {
				Type: "Task",
				Resource: "arn:aws:lambda:us-east-1:123456789012:function:Add",
				End: true,
			},
		},
	} satisfies StateMachine;


	test("Data", async () => {
		const result = await runStateMachine(adderStateMachine, {
			input: {
				val1: 3,
				val2: 4,
			},
			fnForResource: {
				[ adderStateMachine.States.Add.Resource ]: (event: { val1: number; val2: number }): number => {
					return event.val1 + event.val2;
				},
			},
		});
		expect(result, "result").eq(7);
	});
	test("JSONata Expressions", async () => {
		const product: StateMachine = {
			QueryLanguage: JSONATA,
			StartAt: "Done",
			States: {
				Done: {
					Type: "Pass",
					End: true,
					Assign: {
						fiveFac: "{% ($product := function($x, $y) {$x * $y}; $reduce([1..5], $product)) %}",
					},
				} satisfies JSONataPassState,
			},
		};
		const result = await runStateMachine(product);
		expect(result, "result").eql({ fiveFac: 120 });
	});
	/**
	 * @see {@link https://states-language.net/#state-machine-variables | State Machine Variables}
	 */
	test("State Machine Variables", async () => {
		const states = {
			StartAt: "FirstState",
			States: {
				FirstState: {
					Type: "Pass",
					Assign: {
						make: "Infiniti",
						model: "G35",
						year: 2006,
					},
					Next: "SecondState",
				},
				SecondState: {
					End: true,
					Type: "Pass",
					QueryLanguage: "JSONata",
					Output: "{% $year & ' ' & $make & ' ' & $model %}",
					// Next: "ThirdState",
				},
			},
		} satisfies StateMachine;
		const result = await runStateMachine(states, {});
		// noinspection SpellCheckingInspection
		expect(result).eql("2006 Infiniti G35");
	});
	test("State Machine Variables - Assigning", async () => {
		const states = {
			StartAt: "Assigning",
			States: {
				Assigning: {
					Type: "Pass",
					QueryLanguage: "JSONata",
					Assign: {
						x: 42,
						newOrOld: "{% $x %}",
					},
					End: true,
					// Next: "Referencing",
				},
			},
		} satisfies StateMachine;
		const result = await runStateMachine(states, {
			input: {
				x: 5,
			},
		});
		expect(result).eql({
			x: 42,
			newOrOld: 5,
		});
	});
	test("Variable Scope", async () => {
		const states = {
			QueryLanguage: "JSONata",
			StartAt: "Get Greeting",
			States: {
				"Get Greeting": {
					Type: "Pass",
					Assign: {
						outer: "hello",
					},
					Next: "Greet Everyone",
				},
				"Greet Everyone": {
					Type: "Map",
					ItemProcessor: {
						StartAt: "Begin",
						States: {
							Begin: {
								Type: "Pass",
								Assign: {
									inner: "world",
									hi: "{% $outer %}",
								},
								Next: "End",
							},
							End: {
								Type: "Succeed",
								Output: "{% $hi %}",
							},
						},
					},
					Assign: {
						outer: 2,
					},
					Next: "Goodbye",
				},
				Goodbye: {
					Type: "Succeed",
					Output: "{% $outer %}",
				},
			},
		} satisfies StateMachine;
		let endOutput: unknown;
		const result = await runStateMachine(states, {
			onStateComplete({ stateName, output }) {
				if (stateName === "End") {
					endOutput = output;
				}
			},
		});
		expect(result).eql(2);
		expect(endOutput).eql("hello");
	});
	test("Error Output", async () => {
		const states = {
			StartAt: "My Task",
			States: {
				"My Task": {
					Type: "Task",
					QueryLanguage: "JSONata",
					Resource: "arn:aws:lambda:us-east-1:123456789012:function:HelloWorld",
					Output: {
						customer: "{% $states.input.customer %}",
						resultStatus: "{% $states.result.status %}",
						elapsedTime: "{% $states.context.ElapsedTime %}",
					},
					Catch: [
						{
							ErrorEquals: [ "States.ALL" ],
							Output: {
								errorDetails: "{% $states.errorOutput %}",
								input: "{% $states.input %}",
							},
							Next: "Handle Error",
						},
					],
					End: true,
				},
			},
		} satisfies StateMachine;
		const result = await runStateMachine(states, {
			fnForResource: {
				[ states.States[ "My Task" ].Resource ]: () => {
					return 123;
				},
			},
			input: "some input",
		});
		expect(result).eql({
			errorDetails: {
				Cause: "States.QueryEvaluationError",
				Error: "Query Evaluation Error: $states.input.customer",
			},
			input: "some input",
		});
	});
	/**
	 * @see {@link https://states-language.net/#jsonata-evaluation | JSONata Evaluation}
	 */
	test("JSONata Evaluation", async () => {
		let aTaskArgs: unknown;
		const states = {
			StartAt: "GetSampleData",
			States: {
				GetSampleData: {
					Type: "Pass",
					Assign: {
						student: {
							name: "Scotland",
							course: [
								{ grade: 34 },
								{ grade: 99 },
								{ grade: 76 },
								{ grade: 96 },
							],
						},
						"class": {
							teacher: "Bert",
						},
						two: "the number 2",
					},
					Next: "A Task",
				},
				"A Task": {
					Type: "Task",
					QueryLanguage: "JSONata",
					Resource: "arn:aws:lambda:us-east-1:123456789012:function:DoTheTask",
					Arguments: {
						student: "{% $student.name %}",
						classInfo: {
							teacher: "{% $class.teacher %}",
						},
						values: [ 1, "{% $two %}", "three" ],
					},
					Output: "{% { 'avg': $average($student.course.grade), 'num': $count($student.course) }  %}",
					Next: "Process the result",
				},
				"Process the result": {
					Type: "Succeed",
				},
			},
		} satisfies StateMachine;
		const result = await runStateMachine(states, {
			fnForResource: {
				[ states.States[ "A Task" ].Resource ]: (...args: []) => {
					aTaskArgs = args;
				},
			},
		});
		expect(aTaskArgs).eql([ {
			student: "Scotland",
			classInfo: {
				teacher: "Bert",
			},
			values: [ 1, "the number 2", "three" ],
		} ]);
		expect(result).eql({
			avg: 76.25,
			num: 4,
		});
	});
	/**
	 * @see {@link https://states-language.net/#payload-template | Payload Template}
	 */
	test("Payload Template - No params", async () => {
		let xArgs: unknown;
		const states = {
			StartAt: "X",
			States: {
				X: {
					Type: "Task",
					Resource: "arn:aws:states:us-east-1:123456789012:task:X",
					Next: "Y",
					Parameters: {
						first: 88,
						second: 99,
					},
				},
				Y: {
					Type: "Succeed",
				},
			},
		} satisfies StateMachine;
		const result = await runStateMachine(states, {
			fnForResource: {
				[ states.States.X.Resource ]: (...args: []) => {
					xArgs = args;
					return "some output";
				},
			},
		});
		expect(xArgs).eql([ {
			first: 88,
			second: 99,
		} ]);
		expect(result).eql("some output");
	});
	/**
	 * @see {@link https://states-language.net/#payload-template | Payload Template}
	 */
	test("Payload Template - Params", async () => {
		let xArgs: unknown;
		const states = {
			StartAt: "X",
			States: {
				X: {
					Type: "Task",
					Resource: "arn:aws:states:us-east-1:123456789012:task:X",
					Next: "Y",
					Parameters: {
						flagged: true,
						parts: {
							"first.$": "$.vals[0]",
							"last3.$": "$.vals[-3:]",
						},
						"weekday.$": "$$.DayOfWeek",
						"formattedOutput.$": "States.Format('Today is {}', $$.DayOfWeek)",
					},
				},
				Y: {
					Type: "Succeed",
				},
			},
		} satisfies StateMachine;
		const result = await runStateMachine(states, {
			contextObject: {
				DayOfWeek: "TUESDAY",
			},
			fnForResource: {
				[ states.States.X.Resource ]: (...args: []) => {
					xArgs = args;
					return "some output";
				},
			},
			input: {
				flagged: 7,
				vals: [ 0, 10, 20, 30, 40, 50 ],
			},
		});
		expect(xArgs).eql([ {
			flagged: true,
			parts: {
				first: 0,
				last3: [ 30, 40, 50 ],
			},
			weekday: "TUESDAY",
			formattedOutput: "Today is TUESDAY",
		},
		]);
		expect(result).eql("some output");
	});
	/**
	 * @see {@link https://states-language.net/#filters | Input and Output Processing with JSONPath}
	 */
	test("ResultPath - Overwrite", async () => {
		const states = {
			StartAt: "Filters",
			States: {
				Filters: {
					End: true,
					QueryLanguage: JSONPATH,
					Type: "Task",
					Resource: "filtersTask",
					ResultPath: "$.master.detail",
				},
			},
		} satisfies StateMachine;
		const result = await runStateMachine(states, {
			input: {
				master: {
					detail: [ 1, 2, 3 ],
				},
			},
			fnForResource: {
				[ states.States.Filters.Resource ]: () => 6,
			},
		});
		expect(result).eql({
			master: {
				detail: 6,
			},
		});
	});
	test("ResultPath - Combine", async () => {
		const states = {
			StartAt: "Filters",
			States: {
				Filters: {
					End: true,
					QueryLanguage: JSONPATH,
					Type: "Task",
					Resource: "filtersTask",
					ResultPath: "$.master.result.sum",
				},
			},
		} satisfies StateMachine;
		const result = await runStateMachine(states, {
			input: {
				master: {
					detail: [ 1, 2, 3 ],
				},
			},
			fnForResource: {
				[ states.States.Filters.Resource ]: () => 6,
			},
		});
		expect(result).eql({
			master: {
				detail: [ 1, 2, 3 ],
				result: {
					sum: 6,
				},
			},
		});
	});
	/**
	 * @see {@link https://states-language.net/#inputoutput-processing-examples | Input/Output Processing Examples}
	 */
	test("Input/Output Processing Examples", async () => {
		const adder2 = {
			StartAt: "Add",
			States: {
				Add: {
					InputPath: "$.numbers",
					Type: "Task",
					Resource: "arn:aws:lambda:us-east-1:123456789012:function:Add",
					ResultPath: "$.sum",
					End: true,
				},
			},
		} satisfies StateMachine;
		const result = await runStateMachine(adder2, {
			input: {
				title: "Numbers to add",
				numbers: { val1: 3, val2: 4 },
			},
			fnForResource: {
				// eslint-disable-next-line @typescript-eslint/require-await
				[ adderStateMachine.States.Add.Resource ]: async (event: { val1: number; val2: number }): Promise<number> => {
					return event.val1 + event.val2;
				},
			},
		});
		expect(result, "result").eql({
			title: "Numbers to add",
			numbers: { val1: 3, val2: 4 },
			sum: 7,
		});
	});
	test("Pass with ResultPath", async () => {
		const states = {
			StartAt: "ProvideTestData",
			States: {
				End: {
					End: true,
					Type: "Pass",
				},
				ProvideTestData: {
					Type: "Pass",
					Result: {
						"x-datum": 0.381018,
						"y-datum": 622.2269926397355,
					},
					ResultPath: "$.coords",
					Next: "End",
				},
			},
		} satisfies StateMachine;
		// noinspection SpellCheckingInspection
		const result = await runStateMachine(states, {
			input: {
				georefOf: "Home",
			},
		});
		// noinspection SpellCheckingInspection
		expect(result).eql({
			georefOf: "Home",
			coords: {
				"x-datum": 0.381018,
				"y-datum": 622.2269926397355,
			},
		});
	});
	test("timeouts", async () => {
		const states = {
			StartAt: "Timed",
			States: {
				Timed: {
					End: true,
					Resource: "timedTask",
					// Technically against the spec.  But unit tests should be fast!
					TaskTimeout: 0.1,
					Type: "Task",
				},
			},
		} satisfies StateMachine;
		let thrown: unknown;
		const result = await runStateMachine(states, {
			fnForResource: {
				async timedTask() {
					return sleep(500, "never");
				},
			},
		}).catch((err: unknown) => {
			thrown = err;
			return "caught";
		});
		expect(result).eq("caught");
		expect(thrown).instanceOf(StatesError);
		expect((thrown as StatesError).name).eq(STATES_TIMEOUT);
	});
	/**
	 * @see {@link https://states-language.net/#wait-state | Wait State}
	 */
	describe("Wait", () => {
		const now = Date.now();
		const givens: [ wait: WaitState, input: JSONSerializable, date: Date, seconds: number | undefined ][] = [
			[
				{
					Type: "Wait",
					Seconds: 10,
					Next: "NextState",
				},
				{}, new Date(now + 10_000), 10,
			],
			[
				{
					Type: "Wait",
					Timestamp: "2016-03-14T01:59:00Z",
					Next: "NextState",
				},
				{}, new Date(Date.parse("2016-03-14T01:59:00Z")), undefined,
			],
			[
				{
					Type: "Wait",
					QueryLanguage: "JSONata",
					Timestamp: "{% $states.input.expiryDate %}",
					Next: "NextState",
				},
				{ expiryDate: "2016-03-14T01:59:00Z" }, new Date(Date.parse("2016-03-14T01:59:00Z")), undefined,
			],
			[
				{
					Type: "Wait",
					QueryLanguage: "JSONata",
					Seconds: "{% $states.input.seconds %}",
					Next: "NextState",
				},
				{ seconds: 7 }, new Date(now + 7_000), 7,
			],
			[
				{
					Type: "Wait",
					TimestampPath: "$.expiryDate",
					Next: "NextState",
				},
				{ expiryDate: "2016-03-14T01:59:00Z" }, new Date(Date.parse("2016-03-14T01:59:00Z")), undefined,
			],
			[
				{
					Type: "Wait",
					SecondsPath: "$.seconds",
					Next: "NextState",
				},
				{ seconds: 5 }, new Date(now + 5_000), 5,
			],
		];
		for (const [ wait, input, expectedUntil, expectedSeconds ] of givens) {
			const name = [ "Seconds", "Timestamp", "SecondsPath", "TimestampPath" ]
				.filter((k) => k in wait)
				.map((k) => `${ k } ${ JSON.stringify(wait[ k as keyof WaitState ]) }`)[ 0 ]!;
			test(name, async () => {
				let until: Date | undefined;
				let seconds: number | undefined;
				const states = {
					StartAt: "TestWait",
					States: {
						TestWait: {
							...wait,
						},
						[ wait.Next ]: {
							Type: "Pass",
							End: true,
						},
					},
				} satisfies StateMachine;
				const result = await runStateMachine(states, {
					input,
					nowProvider: () => now,
					onWait(u, s): Promise<void> {
						until = u;
						seconds = s;
						return Promise.resolve();
					},
				});
				expect(result, "result").eql(input);
				expect(until, "until").eql(expectedUntil);
				expect(seconds, "seconds").eq(expectedSeconds);
			});
		}
	});
	/**
	 * @see {@link https://states-language.net/#fail-state | Fail State}
	 */
	describe("Fail", () => {
		const testFailure = async (fail: FailState, expectedError?: Error | undefined, input?: JSONSerializable | undefined): Promise<void> => {
			let actualError: unknown;
			const states = {
				StartAt: "TestFail",
				States: {
					TestFail: fail,
				},
			} satisfies StateMachine;
			const result = await runStateMachine(states, {
				...(input == null ? {} : { input }),
			}).catch((err: unknown) => {
				actualError = err;
				return "caught";
			});
			expect(result, "result").eq("caught");
			if (expectedError == null) {
				expect(actualError, "error").is.undefined;
			} else {
				expect(actualError, "error").eql(expectedError);
			}
		};
		test("Basic: Kaiju attack", () => testFailure({
			Type: "Fail",
			Error: "ErrorA",
			Cause: "Kaiju attack",
		}, new StatesError("ErrorA", "Kaiju attack")));
		test("JSONata Error and Cause", () => testFailure({
			Type: "Fail",
			QueryLanguage: "JSONata",
			Comment: "my error comment",
			Error: "{% $states.input.Error %}",
			Cause: "{% $states.input.Cause %}",
		}, new StatesError("ErrorB", "Another Kaiju attack"), {
			Cause: "Another Kaiju attack",
			Error: "ErrorB",
		}));
		test("JSONPath ErrorPath and CausePath", () => testFailure({
			Type: "Fail",
			Comment: "my error comment",
			ErrorPath: "$.Error",
			CausePath: "$.Cause",
		}, new StatesError("ErrorC", "Meteor"), {
			Cause: "Meteor",
			Error: "ErrorC",
		}));
	});
	/**
	 * @see {@link https://states-language.net/#parallel-state | Parallel State}
	 */
	test("Parallel - Add/Subtract", async () => {
		const states = {
			StartAt: "FunWithMath",
			States: {
				FunWithMath: {
					Type: "Parallel",
					Branches: [
						{
							StartAt: "Add",
							States: {
								Add: {
									Type: "Task",
									Resource: "arn:aws:states:::task:Add",
									End: true,
								},
							},
						},
						{
							StartAt: "Subtract",
							States: {
								Subtract: {
									Type: "Task",
									Resource: "arn:aws:states:::task:Subtract",
									End: true,
								},
							},
						},
					],
					Next: "NextState",
				},
				NextState: {
					Type: "Succeed",
				},
			},
		} satisfies StateMachine;
		const result = await runStateMachine(states, {
			input: [ 3, 2 ],
			fnForResource: {
				"arn:aws:states:::task:Add": (values: number[]) => values[ 0 ]! + values[ 1 ]!,
				"arn:aws:states:::task:Subtract": (values: number[]) => values[ 0 ]! - values[ 1 ]!,
			},
		});
		expect(result).eql([ 5, 1 ]);
	});
	describe("Map", () => {
		const inputProvider = () => ({
			"ship-date": "2016-03-14T01:59:00Z",
			detail: {
				"delivery-partner": "UQS",
				shipped: [
					{ prod: "R31", "dest-code": 9511, quantity: 1344 },
					{ prod: "S39", "dest-code": 9511, quantity: 40 },
					{ prod: "R31", "dest-code": 9833, quantity: 12 },
					{ prod: "R40", "dest-code": 9860, quantity: 887 },
					{ prod: "R40", "dest-code": 9511, quantity: 1220 },
				],
			},
		});
		test("JSONata 1", async () => {
			const states = {
				StartAt: "Validate-All",
				States: {
					"Validate-All": {
						Type: "Map",
						QueryLanguage: "JSONata",
						Items: "{% $states.input.detail.shipped %}",
						MaxConcurrency: 0,
						ItemProcessor: {
							StartAt: "Validate",
							States: {
								Validate: {
									Type: "Task",
									Resource: "arn:aws:lambda:us-east-1:123456789012:function:ship-val",
									End: true,
								},
							},
						},
						Assign: {
							shipped: "{% $states.result %}",
						},
						Output: {
							numItemsProcessed: "{% $count($states.input.detail.shipped) %}",
						},
						End: true,
					},
				},
			} satisfies StateMachine;
			const allInput = inputProvider();
			const inputs: unknown[] = [];
			const result = await runStateMachine(states, {
				input: allInput,
				fnForResource: {
					[ states.States[ "Validate-All" ].ItemProcessor.States.Validate.Resource ]: (input: unknown) => {
						inputs.push(input);
						return inputs.length;
					},
				},
			});
			expect(inputs, "inputs").eql(allInput.detail.shipped);
			expect(result, "result").eql({
				numItemsProcessed: allInput.detail.shipped.length,
			});
		});
		test("JSONata 2", async () => {
			const states = {
				StartAt: "Validate-All",
				States: {
					"Validate-All": {
						Type: "Map",
						QueryLanguage: "JSONata",
						Items: "{% $states.input.detail.shipped %}",
						MaxConcurrency: 0,
						ItemSelector: {
							parcel: "{% $states.context.Map.Item.Value %}",
							/**
							 * This is a bug in the spec.  The original (incorrect) value is:
							 * `"{% $states.input.delivery-partner %}"`
							 */
							courier: "{% $states.input.detail.`delivery-partner` %}",
						},
						ItemProcessor: {
							StartAt: "Validate",
							States: {
								Validate: {
									Type: "Task",
									Resource: "arn:aws:lambda:us-east-1:123456789012:function:ship-val",
									End: true,
								},
							},
						},
						Assign: {
							shipped: "{% $states.result %}",
						},
						Output: {
							numItemsProcessed: "{% $count($states.input.detail.shipped) %}",
						},
						End: true,
					},
				},
			} satisfies StateMachine;
			const allInput = inputProvider();
			const inputs: unknown[] = [];
			const result = await runStateMachine(states, {
				input: allInput,
				fnForResource: {
					[ states.States[ "Validate-All" ].ItemProcessor.States.Validate.Resource ]: (input: unknown) => {
						inputs.push(input);
						return inputs.length;
					},
				},
			});
			const courier = allInput.detail[ "delivery-partner" ];
			expect(inputs, "inputs").eql(allInput.detail.shipped.map((parcel) => ({ courier, parcel })));
			expect(result, "result").eql({
				numItemsProcessed: allInput.detail.shipped.length,
			});
		});
		test("JSONPath 1", async () => {
			const states = {
				StartAt: "Validate-All",
				States: {
					"Validate-All": {
						Type: "Map",
						InputPath: "$.detail",
						ItemsPath: "$.shipped",
						MaxConcurrency: 0,
						ItemProcessor: {
							StartAt: "Validate",
							States: {
								Validate: {
									Type: "Task",
									Resource: "arn:aws:lambda:us-east-1:123456789012:function:ship-val",
									End: true,
								},
							},
						},
						ResultPath: "$.detail.shipped",
						End: true,
					},
				},
			} satisfies StateMachine;
			const allInput = inputProvider();
			const inputs: unknown[] = [];
			const result = await runStateMachine(states, {
				input: allInput,
				fnForResource: {
					[ states.States[ "Validate-All" ].ItemProcessor.States.Validate.Resource ]: (input: unknown) => {
						inputs.push(input);
						return inputs.length;
					},
				},
			});
			expect(inputs).eql(allInput.detail.shipped);
			expect(result).eql({
				detail: {
					"delivery-partner": "UQS",
					shipped: [ 1, 2, 3, 4, 5 ],
				},
				"ship-date": "2016-03-14T01:59:00Z",
			});
		});
		test("JSONPath 2", async () => {
			const states = {
				StartAt: "Validate-All",
				States: {
					"Validate-All": {
						Type: "Map",
						InputPath: "$.detail",
						ItemsPath: "$.shipped",
						MaxConcurrency: 0,
						ItemSelector: {
							"parcel.$": "$$.Map.Item.Value",
							/**
							 * Another bug in the spec.  The original value here was:
							 * `$.delivery-partner`
							 */
							"courier.$": "$['delivery-partner']",
						},
						ItemProcessor: {
							StartAt: "Validate",
							States: {
								Validate: {
									Type: "Task",
									Resource: "arn:aws:lambda:us-east-1:123456789012:function:ship-val",
									End: true,
								},
							},
						},
						ResultPath: "$.detail.shipped",
						End: true,
					},
				},
			} satisfies StateMachine;
			const allInput = inputProvider();
			const inputs: unknown[] = [];
			const result = await runStateMachine(states, {
				input: allInput,
				fnForResource: {
					[ states.States[ "Validate-All" ].ItemProcessor.States.Validate.Resource ]: (input: unknown) => {
						inputs.push(input);
						return inputs.length;
					},
				},
			});
			const courier = allInput.detail[ "delivery-partner" ];
			expect(inputs).eql(allInput.detail.shipped.map((parcel) => ({ courier, parcel })));
			/**
			 * the ResultPath results in the output being the same as the input, with the
			 * "detail.shipped" field being overwritten by an array in which each element
			 * is the output of the "ship-val" Lambda function as applied to the corresponding
			 * input element.
			 */
			expect(result).eql({
				detail: {
					"delivery-partner": "UQS",
					shipped: [ 1, 2, 3, 4, 5 ],
				},
				"ship-date": "2016-03-14T01:59:00Z",
			});
		});
	});
});
