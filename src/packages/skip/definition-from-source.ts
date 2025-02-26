import { deepSort } from "@rickosborne/foundation";
import type { JSONArray, JSONSerializable } from "@rickosborne/typical";
import { type ArrowFunction, type Block, type CallExpression, canHaveModifiers, createProgram, type Expression, forEachChild, type FunctionDeclaration, type FunctionExpression, type Identifier, type IfStatement, type ImportClause, isArrowFunction, isBinaryExpression, isBlock, isCallExpression, isExportDeclaration, isExpression, isFunctionDeclaration, isFunctionExpression, isIdentifier, isIfStatement, isImportClause, isNamedImports, isNewExpression, isOptionalTypeNode, isReturnStatement, isStringLiteral, isThrowStatement, isVariableDeclaration, isVariableStatement, type Node, type ParameterDeclaration, type Program, type ReturnStatement, type SourceFile, type Statement, SyntaxKind, type ThrowStatement, type TypeChecker, type VariableStatement } from "typescript";

import type { ChoiceRule, ChoiceState, EndState, FailState, JSONataChoiceRule, JSONataChoiceState, JSONataPassState, JSONataString, JSONataTaskState, NonTerminalState, ParallelState, PassState, State, StateIdentifier, StateMachine, SucceedState } from "./sfn-types.js";

type StateMachineFunction = FunctionDeclaration | FunctionExpression | ArrowFunction;

let program: Program;
let typeChecker: TypeChecker;

const findMatches = <N extends Node>(node: Node, predicate: (node: Node) => node is N): N[] => {
	const nodes: N[] = [];
	const recurse = (n: Node): void => {
		if (predicate(n)) {
			nodes.push(n);
		}
		forEachChild(n, (child) => recurse(child));
	};
	recurse(node);
	return nodes;
};

const functionName = (fn: StateMachineFunction): string => {
	const fromName = fn.name?.getText();
	if (fromName != null) {
		return fromName;
	}
	if (isBinaryExpression(fn.parent) && fn.parent.operatorToken.kind === SyntaxKind.EqualsToken && isIdentifier(fn.parent.left)) {
		return fn.parent.left.text;
	}
	if (isVariableDeclaration(fn.parent) && isIdentifier(fn.parent.name)) {
		return fn.parent.name.text;
	}
	throw new Error(`Could not find name for ${ SyntaxKind[ fn.kind ] }`);
};

const isExported = (node: Node): boolean => {
	const seen = new Set<Node>();
	let p = node;
	while (p != null) {
		if (seen.has(p)) return false;
		seen.add(p);
		if (canHaveModifiers(p) && p.modifiers?.some((m) => m.kind === SyntaxKind.ExportKeyword)) {
			return true;
		}
		const kindName = SyntaxKind[ p.kind ];
		if (isExportDeclaration(p) || kindName === "export") {
			return true;
		}
		p = p.parent;
	}
	return false;
};

const findTargetFunction = (sourceFile: SourceFile, fnName: string | undefined): { exported: boolean; fn: FunctionDeclaration | FunctionExpression | ArrowFunction; name: string } => {
	const functions = findMatches(sourceFile, (n) => isArrowFunction(n) || isFunctionDeclaration(n) || isFunctionExpression(n));
	if (functions.length === 0) {
		throw new Error(`No functions found in ${ sourceFile.fileName }`);
	}
	let targetFn: FunctionDeclaration | FunctionExpression | ArrowFunction;
	let targetName: string;
	if (fnName != null) {
		const found = functions.map((fn) => ({ fn, name: functionName(fn) })).filter(({ name }) => name === fnName);
		if (found.length !== 1) {
			throw new Error(`Expected 1 function named ${ fnName }, found ${ found.length }`);
		}
		targetFn = found[ 0 ]!.fn;
		targetName = found[ 0 ]!.name;
	} else if (functions.length === 1) {
		targetFn = functions[ 0 ]!;
		targetName = functionName(targetFn);
	} else {
		const exported = functions.filter((f) => isExported(f));
		if (exported.length === 1) {
			targetFn = exported[ 0 ]!;
			targetName = functionName(targetFn);
		} else {
			throw new Error(`No function name specified and ${ exported.length } exported found.`);
		}
	}
	const exported = isExported(targetFn);
	return { exported, fn: targetFn, name: targetName };
};

interface NamedState {
	name: StateIdentifier;
	state: State;
}

type NextStateIdSetter = (nextStateName: string) => void;

interface AndNextSetter {
	setNext: NextStateIdSetter;
}

interface StatesAndNextSetter extends AndNextSetter {
	startAt: StateIdentifier | undefined;
	states: NamedState[];
}

const setAllNext = (onNext: NextStateIdSetter[]): NextStateIdSetter => (next: StateIdentifier) => onNext.forEach((handler) => handler(next));
const setNextOf = (state: NonTerminalState): NextStateIdSetter => (next: StateIdentifier) => {
	state.Next = next;
};

const validatorForParam = (param: ParameterDeclaration, fnName: string, path: string): StatesAndNextSetter => {
	const paramName = param.name.getText();
	const paramType = param.type;
	const choiceStateName = stateId("Validate".concat(paramName));
	const failStateName = stateId("Invalid".concat(paramName));
	const choices = [] as unknown as [ JSONataChoiceRule, ...JSONataChoiceRule[] ];
	const nextPath = `${ path }/param:${ paramName }`;
	const choice: JSONataChoiceState = {
		Choices: choices,
		Comment: commentForNode(param, nextPath, paramName.concat(` of ${ fnName }`)),
		Default: failStateName,
		QueryLanguage: "JSONata",
		Type: "Choice",
	};
	const states: NamedState[] = [];
	states.push({ name: choiceStateName, state: choice });
	const onNext: NextStateIdSetter[] = [];
	if (paramType == null) {
		const present: JSONataChoiceRule = {
			Condition: "{% $exists($states.input) %}",
			Next: "TODO",
		};
		onNext.push(setNextOf(present));
		choices.push(present);
	} else {
		if (isOptionalTypeNode(paramType)) {
			const notPresent: JSONataChoiceRule = {
				Condition: "{% $not($exists($states.input)) %}",
				Next: "TODO",
			};
			onNext.push(setNextOf(notPresent));
			choices.push(notPresent);
		}
		if (paramType.kind === SyntaxKind.UnknownKeyword || paramType.kind === SyntaxKind.AnyKeyword) {
			const present: JSONataChoiceRule = {
				Condition: "{% $exists($states.input) %}",
				Next: "TODO",
			};
			onNext.push(setNextOf(present));
			choices.push(present);
		} else {
			throw new Error(`Not implemented: ${ SyntaxKind[ paramType.kind ] }`);
		}
	}
	const fail: FailState = {
		Error: "ValidationFailure",
		Cause: `Invalid input for param ${ paramName } of ${ fnName }`,
		Type: "Fail",
	};
	states.push({ name: failStateName, state: fail });
	return { startAt: choiceStateName, states, setNext: setAllNext(onNext) };
};

const stateId = (() => {
	let nextId = 1;
	return (name: string): StateIdentifier => {
		const suffix = `\$${ nextId }`;
		nextId++;
		return name.substring(0, 80 - suffix.length).concat(suffix);
	};
})();

const commentForNode = (node: Node, path: string, name?: string | undefined): string => {
	const sourceFile = node.getSourceFile();
	const sourceFileName = sourceFile.fileName;
	const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
	return `${ SyntaxKind[ node.kind ] }${ name == null ? "" : ` ${ name }` } at (${ sourceFileName }:${ line + 1 }:${ character + 1 }) ${ path }`;
};

const statesFromExpression = (expr: Expression, path: string): StatesAndNextSetter => {
	const nextPath = `${ path }/${ SyntaxKind[ expr.kind ] }`;
	const pass = {
		Comment: commentForNode(expr, nextPath),
		Next: "TODO",
		Type: "Pass",
	} satisfies PassState;
	const passId = stateId(SyntaxKind[ expr.kind ]);
	return {
		startAt: passId,
		states: [ {
			name: passId,
			state: pass,
		} ],
		setNext: setNextOf(pass),
	};
};

interface ChoiceRulesAndNextSetter extends Partial<StatesAndNextSetter> {
	choiceRules: [ ChoiceRule, ...ChoiceRule[] ];

	// setElse(next: StateIdentifier | undefined): void;
	setThen(this: void, next: StateIdentifier): void;
}

const jsonataFromExpression = (expr: Expression): JSONataString => {
	return `{% $states.input ... ${ expr.getText() } %}`;
};

const choiceRuleFromExpression = (expr: Expression, path: string): ChoiceRulesAndNextSetter => {
	const states: NamedState[] = [];
	const onNext: NextStateIdSetter[] = [];
	let startAt: StateIdentifier | undefined;
	const rule: JSONataChoiceRule = {
		Condition: false,
		Next: "TODO",
	};
	if (isCallExpression(expr)) {
		const varName = `callResult${ expr.pos }`;
		const callStates = statesFromCall(expr, varName, path);
		states.push(...callStates.states);
		onNext.push(callStates.setNext);
		startAt = callStates.startAt;
		rule.Condition = `{% $.${ varName } = true %}`;
	} else if (isBinaryExpression(expr)) {

	} else {
		rule.Condition = jsonataFromExpression(expr);
	}
	onNext.push(setNextOf(rule));
	return {
		choiceRules: [ rule ],
		setThen: setAllNext(onNext),
		startAt,
		states,
	};
};

const statesFromIf = (ifStatement: IfStatement, path: string): StatesAndNextSetter => {
	const nextPath = `${ path }/if`;
	const onNext: NextStateIdSetter[] = [];
	const thenStates = statesFromStatement(ifStatement.thenStatement, nextPath.concat("/then"));
	const choiceRules = choiceRuleFromExpression(ifStatement.expression, nextPath.concat("/condition"));
	if (thenStates.startAt != null) {
		choiceRules.setThen(thenStates.startAt);
	} else {
		onNext.push(choiceRules.setThen);
	}
	const elseStates = ifStatement.elseStatement == null ? undefined : statesFromStatement(ifStatement.elseStatement, nextPath.concat("/else"));
	onNext.push(thenStates.setNext);
	const choice: ChoiceState = {
		Choices: choiceRules.choiceRules,
		Comment: commentForNode(ifStatement, nextPath),
		Type: "Choice",
	};
	if (elseStates != null) {
		onNext.push(elseStates.setNext);
		if (elseStates.startAt != null) {
			choice.Default = elseStates.startAt;
		}
	} else {
		onNext.push((next) => {
			choice.Default = next;
		});
	}
	const choiceId = stateId("if");
	return {
		startAt: choiceId,
		states: [
			{ name: choiceId, state: choice },
			...(choiceRules.states ?? []),
			...thenStates.states,
			...(elseStates?.states ?? []),
		],
		setNext: setAllNext(onNext),
	};
};

const jsonFromExpression = (expr: Expression): JSONSerializable | undefined => {
	if (isIdentifier(expr)) {
		return `{% $['${ expr.text }'] %}`;
	}
	return {
		notImplemented: SyntaxKind[ expr.kind ],
	};
};

const statesFromReturn = (statement: ReturnStatement, path: string): StatesAndNextSetter => {
	const json = statement.expression == null ? undefined : jsonFromExpression(statement.expression);
	const nextPath = path.concat("/return");
	const pass: JSONataPassState & Partial<EndState> = {
		Comment: commentForNode(statement, nextPath),
		End: true,
		Next: "TODO",
		Type: "Pass",
	};
	if (json !== undefined) {
		pass.Output = json;
	}
	const passId = stateId("return");
	return {
		startAt: passId,
		states: [
			{ name: passId, state: pass },
		],
		setNext(next: string) {
			delete pass.End;
			pass.Next = next;
		},
	};
};

const statesFromThrow = (statement: ThrowStatement, path: string): StatesAndNextSetter => {
	const nextPath = path.concat("/throw");
	let errorName: string | undefined;
	let cause: string | undefined;
	if (isNewExpression(statement.expression)) {
		errorName = statement.expression.expression.getText();
		const texts = statement.expression.arguments?.filter((arg) => isStringLiteral(arg)).map((arg) => arg.text) ?? [];
		if (texts.length > 0) {
			cause = texts.join("; ");
		}
	}
	const fail: FailState = {
		Comment: commentForNode(statement, nextPath),
		Type: "Fail",
	};
	if (errorName != null) {
		fail.Error = errorName;
	}
	if (cause != null) {
		fail.Cause = cause;
	}
	const failId = stateId("throw");
	return {
		startAt: failId,
		states: [ { name: failId, state: fail } ],
		setNext() {
			// do nothing
		},
	};
};

const isImported = (id: Identifier): ImportClause | undefined => {
	const sym = typeChecker.getSymbolAtLocation(id);
	if (sym == null) {
		return undefined;
	}
	const sourceFile = id.getSourceFile();
	const importClauses = findMatches(sourceFile, (n) => isImportClause(n));
	for (const clause of importClauses) {
		if (clause.namedBindings == null) continue;
		if (!isNamedImports(clause.namedBindings)) continue;
		for (const element of clause.namedBindings.elements) {
			const elemSym = typeChecker.getSymbolAtLocation(element.name);
			if (sym === elemSym) {
				return clause;
			}
		}
	}
	return undefined;
};

const statesFromCall = (call: CallExpression, assignTo: string | undefined, path: string): StatesAndNextSetter => {
	const nextPath = path.concat("/call:", call.expression.getText());
	const onNext: NextStateIdSetter[] = [];
	const states: NamedState[] = [];
	let startAt: StateIdentifier | undefined;
	if (isIdentifier(call.expression)) {
		const fnName = call.expression.text;
		const importClause = isImported(call.expression);
		if (importClause != null) {
			let prefix: string;
			if (isStringLiteral(importClause.parent.moduleSpecifier)) {
				prefix = importClause.parent.moduleSpecifier.text;
			} else {
				prefix = importClause.parent.moduleSpecifier.getText();
			}
			const task: JSONataTaskState = {
				Comment: commentForNode(call, nextPath, fnName),
				Next: "TODO",
				QueryLanguage: "JSONata",
				Resource: `${ prefix }:${ fnName }`,
				Type: "Task",
			};
			if (call.arguments.length > 0) {
				const args: JSONArray = [];
				for (const arg of call.arguments) {
					if (isIdentifier(arg)) {
						args.push(`{% $states.input['${ arg.text }'] %}`);
					} else {
						args.push({
							notImplemented: SyntaxKind[ arg.kind ],
						});
					}
				}
				task.Arguments = args.length === 1 ? args[ 0 ]! : args;
			}
			onNext.push((next) => {
				task.Next = next;
			});
			startAt = stateId(`call:${ fnName }`);
			states.push({
				name: startAt,
				state: task,
			});
		} else {
			const signature = typeChecker.getResolvedSignature(call);
			if (signature == null) {
				throw new Error(`Could not find signature for: ${ call.expression.text }`);
			}
			const decl = signature.getDeclaration();
			startAt = stateId(`call:${ call.expression.getText() }:${ SyntaxKind[ decl.kind ] }:${ assignTo }`);
			if (isArrowFunction(decl) || isFunctionExpression(decl) || isFunctionDeclaration(decl)) {
				const subStates = stateMachineFromFunction(decl, call.expression.getText(), nextPath);
				const parallel: ParallelState = {
					Branches: [
						subStates,
					],
					Next: "TODO",
					Type: "Parallel",
				};
				states.push({
					name: startAt,
					state: parallel,
				});
				onNext.push(setNextOf(parallel));
			} else {
				states.push({
					name: startAt,
					state: {
						Comment: commentForNode(call.expression, nextPath),
						Type: "Fail",
					} satisfies FailState,
				});
			}
		}
	} else {
		startAt = stateId(`call(not implemented: ${ SyntaxKind[ call.expression.kind ] }) ${ assignTo }`);
		states.push({
			name: startAt,
			state: {
				Comment: commentForNode(call.expression, nextPath),
				Type: "Fail",
			} satisfies FailState,
		});
	}
	return {
		startAt,
		states,
		setNext(next) {
			onNext.forEach((handler) => handler(next));
		},
	};
};

const statesFromVar = (statement: VariableStatement, path: string): StatesAndNextSetter => {
	const nextPath = path.concat("/var");
	const states: NamedState[] = [];
	const onNext: NextStateIdSetter[] = [];
	let startAt: StateIdentifier | undefined;
	for (const decl of statement.declarationList.declarations) {
		const { name: declName, initializer } = decl;
		if (!isIdentifier(declName)) {
			console.error(`Not implemented: var ${ SyntaxKind[ decl.kind ] }`);
			continue;
		}
		if (initializer == null) {
			continue;
		}
		const varName = declName.text;
		if (isCallExpression(initializer)) {
			const callStates = statesFromCall(initializer, varName, nextPath.concat(":", varName));
			onNext.push(callStates.setNext);
			callStates.states.forEach((s) => {
				startAt ??= s.name;
				states.push(s);
			});
		} else {
			console.error(`Not implemented: var ${ SyntaxKind[ initializer.kind ] }`);
		}
	}
	return {
		startAt,
		states,
		setNext(next) {
			onNext.forEach((handler) => handler(next));
		},
	};
};

const statesFromStatement = (statement: Statement, path: string): StatesAndNextSetter => {
	if (isIfStatement(statement)) {
		return statesFromIf(statement, path);
	}
	if (isBlock(statement)) {
		return statesFromBlock(statement, path);
	}
	if (isThrowStatement(statement)) {
		return statesFromThrow(statement, path);
	}
	if (isReturnStatement(statement)) {
		return statesFromReturn(statement, path);
	}
	if (isVariableStatement(statement)) {
		return statesFromVar(statement, path);
	}
	const nextPath = path.concat(`/(unimplemented)${ SyntaxKind[ statement.kind ] }`);
	const pass = {
		Comment: commentForNode(statement, nextPath),
		Next: "TODO",
		Type: "Pass",
	} satisfies PassState;
	const passId = stateId(SyntaxKind[ statement.kind ]);
	return {
		startAt: passId,
		states: [ {
			name: passId,
			state: pass,
		} ],
		setNext: (next: string) => {
			pass.Next = next;
		},
	};
};

const statesFromBlock = (block: Block, path: string): StatesAndNextSetter => {
	const states: NamedState[] = [];
	let startAt: StateIdentifier | undefined;
	const onNext: NextStateIdSetter[] = [];
	let index = 0;
	for (const statement of block.statements) {
		const statesAnd = statesFromStatement(statement, path.concat("/", String(index)));
		statesAnd.states.forEach((namedState) => {
			startAt ??= namedState.name;
			states.push(namedState);
		});
		onNext.push(statesAnd.setNext);
		index++;
	}
	return { startAt, states, setNext: (next) => onNext.forEach((handler) => handler(next)) };
};

const statesFromFunction = (fn: FunctionDeclaration | FunctionExpression | ArrowFunction, path: string): StatesAndNextSetter => {
	const fnName = functionName(fn);
	const nextPath = path.concat("/", fnName);
	const states: NamedState[] = [];
	const onNext: NextStateIdSetter[] = [];
	let previousParam: StatesAndNextSetter | undefined;
	let startAt: StateIdentifier | undefined;
	for (const param of fn.parameters) {
		const paramStates = validatorForParam(param, fnName, nextPath);
		paramStates.states.forEach((namedState) => {
			startAt ??= namedState.name;
			states.push(namedState);
			if (previousParam != null) {
				previousParam.setNext(namedState.name);
				previousParam = undefined;
			}
		});
		onNext.push(paramStates.setNext);
		previousParam ??= paramStates;
	}
	const body = fn.body;
	if (body != null) {
		const bodyKind = body.kind;
		let bodyStates: StatesAndNextSetter;
		if (isBlock(body)) {
			bodyStates = statesFromBlock(body, nextPath.concat("/body"));
		} else if (isExpression(body)) {
			bodyStates = statesFromExpression(body, nextPath.concat("/expression"));
		} else {
			throw new SyntaxError(`Expected function body to be Block or Expression.  Found ${ SyntaxKind[ bodyKind ] }`);
		}
		bodyStates.states.forEach((bodyState) => {
			startAt ??= bodyState.name;
			if (previousParam != null) {
				previousParam.setNext(bodyState.name);
				previousParam = undefined;
			}
			states.push(bodyState);
		});
		onNext.push(bodyStates.setNext);
	} else {
		onNext.push((next) => {
			previousParam?.setNext(next);
			previousParam = undefined;
		});
	}
	return {
		startAt,
		states,
		setNext(next) {
			onNext.forEach((handler) => handler(next));
		},
	};
};

const stateMachineFromFunction = (targetFn: StateMachineFunction, targetName: string, path: string): StateMachine => {
	if (targetFn.parameters.length > 1) {
		throw new SyntaxError(`Function ${ targetName } should not have more than 1 parameter: (${ targetFn.parameters.map((p) => p.name.getText()).join(", ") })`);
	}
	const succeedState: SucceedState = {
		Comment: commentForNode(targetFn, path, targetName),
		Type: "Succeed",
	};
	const succeedId = stateId(`${ targetName }:succeed`);
	const fnStates = statesFromFunction(targetFn, path);
	const startAt = fnStates.startAt ?? succeedId;
	const stateMachine: StateMachine = {
		StartAt: startAt,
		States: {
			[ succeedId ]: succeedState,
		},
	};
	for (const fnState of fnStates.states) {
		stateMachine.States[ fnState.name ] = fnState.state;
	}
	fnStates.setNext(succeedId);
	return deepSort(stateMachine);
};

export const definitionFromSource = (
	sourcePath: string,
	fnName?: string | undefined,
): StateMachine => {
	// const sourceText = await readFile(sourcePath, { encoding: "utf-8" });
	// const sourceFile = createSourceFile(sourcePath, sourceText, {
	// 	languageVersion: ScriptTarget.Latest,
	// }, true);
	program = createProgram({
		rootNames: [ sourcePath ],
		options: {},
	});
	typeChecker = program.getTypeChecker();
	const sourceFile = program.getSourceFile(sourcePath)!;
	const { exported: targetExported, fn: targetFn, name: targetName } = findTargetFunction(sourceFile, fnName);
	console.log(`Target:${ targetExported ? " export" : "" } ${ SyntaxKind[ targetFn.kind ] } ${ targetName }`);
	return stateMachineFromFunction(targetFn, targetName, "");
};
