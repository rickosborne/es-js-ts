// noinspection JSUnusedGlobalSymbols,SpellCheckingInspection

import { hasArray, hasNumber, hasObject, hasOptional, hasOwn, hasPlainObject, hasString, isInt, isJSONObject, isJSONSerializable, isObject } from "@rickosborne/guard";
import type { ExactlyOneOf, ItemType, JSONArray, JSONObject, JSONSerializable } from "@rickosborne/typical";

export const VERSION_1 = "1.0";
export const JSONATA = "JSONata";
export const JSONPATH = "JSONPath";
export const TYPE_CHOICE = "Choice";
export const TYPE_FAIL = "Fail";
export const TYPE_MAP = "Map";
export const TYPE_PARALLEL = "Parallel";
export const TYPE_PASS = "Pass";
export const TYPE_SUCCEED = "Succeed";
export const TYPE_TASK = "Task";
export const TYPE_WAIT = "Wait";
export const STATES_ALL = "States.ALL";
export const STATES_ARRAY = "States.Array";
export const STATES_ARRAY_CONTAINS = "States.ArrayContains";
export const STATES_ARRAY_GET_ITEM = "States.ArrayGetItem";
export const STATES_ARRAY_LENGTH = "States.ArrayLength";
export const STATES_ARRAY_PARTITION = "States.ArrayPartition";
export const STATES_ARRAY_RANGE = "States.ArrayRange";
export const STATES_ARRAY_UNIQUE = "States.ArrayUnique";
export const STATES_BASE64_DECODE = "States.Base64Decode";
export const STATES_BASE64_ENCODE = "States.Base64Encode";
export const STATES_BRANCH_FAILED = "States.BranchFailed";
export const STATES_EXCEED_TOLERATED_FAILURE_THRESHOLD = "States.ExceedToleratedFailureThreshold";
export const STATES_FORMAT = "States.Format";
export const STATES_HASH = "States.Hash";
export const STATES_HASH_MD5 = "MD5";
export const STATES_HASH_SHA1 = "SHA-1";
export const STATES_HASH_SHA256 = "SHA-256";
export const STATES_HASH_SHA384 = "SHA-384";
export const STATES_HASH_SHA512 = "SHA-512";
export const STATES_HASH_ALGORITHMS = Object.freeze([
	STATES_HASH_MD5, STATES_HASH_SHA1, STATES_HASH_SHA256,
	STATES_HASH_SHA384, STATES_HASH_SHA512,
] as const);
export type StatesHashAlgorithm = ItemType<typeof STATES_HASH_ALGORITHMS>;
export const STATES_HEARTBEAT_TIMEOUT = "States.HeartbeatTimeout";
export const STATES_INTRINSIC_FAILURE = "States.IntrinsicFailure";
export const STATES_ITEM_READER_FAILED = "States.ItemReaderFailed";
export const STATES_JSON_MERGE = "States.JsonMerge";
export const STATES_JSON_TO_STRING = "States.JsonToString";
export const STATES_MATH_ADD = "States.MathAdd";
export const STATES_MATH_RANDOM = "States.MathRandom";
export const STATES_NO_CHOICE_MATCHED = "States.NoChoiceMatched";
export const STATES_PARAMETER_PATH_FAILURE = "States.ParameterPathFailure";
export const STATES_PERMISSIONS = "States.Permissions";
export const STATES_QUERY_EVALUATION_ERROR = "States.QueryEvaluationError";
export const STATES_RESULT_PATH_MATCH_FAILURE = "States.ResultPathMatchFailure";
export const STATES_RESULT_WRITER_FAILED = "States.ResultWriterFailed";
export const STATES_STRING_SPLIT = "States.StringSplit";
export const STATES_STRING_TO_JSON = "States.StringToJson";
export const STATES_TASK_FAILED = "States.TaskFailed";
export const STATES_TIMEOUT = "States.Timeout";
export const STATES_UUID = "States.UUID";

export type IntrinsicFunctionName = typeof STATES_ARRAY | typeof STATES_ARRAY_CONTAINS | typeof STATES_ARRAY_GET_ITEM | typeof STATES_ARRAY_LENGTH | typeof STATES_ARRAY_PARTITION | typeof STATES_ARRAY_RANGE | typeof STATES_ARRAY_UNIQUE | typeof STATES_BASE64_DECODE | typeof STATES_BASE64_ENCODE | typeof STATES_FORMAT | typeof STATES_HASH | typeof STATES_JSON_MERGE | typeof STATES_JSON_TO_STRING | typeof STATES_MATH_ADD | typeof STATES_MATH_RANDOM | typeof STATES_STRING_SPLIT | typeof STATES_STRING_TO_JSON | typeof STATES_UUID;

/**
 * @see {@link https://states-language.net/ | States Language}
 */
export interface StateMachine extends CanComment {
	QueryLanguage?: QueryLanguageIdentifier;
	StartAt: StateIdentifier;
	States: Record<StateIdentifier, State>;
	TimeoutSeconds?: number;
	Version?: typeof VERSION_1;
}

export type QueryLanguageJSONata = typeof JSONATA;
export type QueryLanguageJSONPath = typeof JSONPATH;
export type QueryLanguageIdentifier = QueryLanguageJSONata | QueryLanguageJSONPath;

export interface StateMachineOf<S extends StateIdentifier, Q extends QueryLanguageIdentifier = QueryLanguageJSONPath> extends StateMachine {
	QueryLanguage?: Q;
	StartAt: NoInfer<S>;
	States: Record<S, State>;
}

export type ChoiceType = typeof TYPE_CHOICE;
export type FailType = typeof TYPE_FAIL;
export type MapType = typeof TYPE_MAP;
export type ParallelType = typeof TYPE_PARALLEL;
export type PassType = typeof TYPE_PASS;
export type SucceedType = typeof TYPE_SUCCEED;
export type TaskType = typeof TYPE_TASK;
export type WaitType = typeof TYPE_WAIT;
export type StateType = TaskType | SucceedType | FailType | ParallelType | MapType | ChoiceType | PassType | WaitType;

export interface StateForType {
	[ TYPE_CHOICE ]: ChoiceState;
	[ TYPE_FAIL ]: FailState;
	[ TYPE_MAP ]: MapState;
	[ TYPE_PARALLEL ]: ParallelState;
	[ TYPE_PASS ]: PassState;
	[ TYPE_SUCCEED ]: SucceedState;
	[ TYPE_TASK ]: TaskState;
	[ TYPE_WAIT ]: WaitState;
}

export interface CommentState {
	Comment: string;
}

export interface CanComment extends Partial<CommentState> {
}

export interface QueryLanguageJSONataState {
	QueryLanguage: QueryLanguageJSONata;
}

export interface QueryLanguageJSONPathState {
	QueryLanguage: QueryLanguageJSONPath;
}

export interface CanQueryLanguage {
	QueryLanguage?: QueryLanguageIdentifier;
}

export const hasQueryLanguage = (value: unknown): value is Required<CanQueryLanguage> => hasString(value, "QueryLanguage") && (value.QueryLanguage === JSONPATH || value.QueryLanguage === JSONATA);

export type State = ChoiceState | FailState | MapState | ParallelState | PassState | SucceedState | TaskState | WaitState;

export interface StateOf<T extends StateType, Q extends QueryLanguageIdentifier> {
	QueryLanguage?: Q;
	Type: T;
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type JSONPathPayloadTemplate = Record<VariableName | JSONPathInterpolated, JSONSerializable | JSONPathPath>;

export const isJSONPathPayloadTemplate = (value: unknown): value is JSONPathPayloadTemplate => isJSONObject(value);

export interface EndState {
	End: true;
}

export const isEndState = <S extends State>(state: S): state is S & EndState => hasOwn(state, "End", (v): v is true => v === true);

/**
 * Excluded from: Choice State, Succeed State, Fail State.
 */
export interface CanEnd {
	End?: boolean;
}

export interface AssignedState {
	Assign: JSONObject;
}

export const isAssignedState = (state: unknown): state is AssignedState => hasPlainObject(state, "Assign");

/**
 * Included in: Choice Rule, Catcher, Map, Parallel.
 */
export interface CanAssign extends Partial<AssignedState> {
}

export interface OutputState {
	Output: JSONSerializable;
}

export const isOutputState = (state: unknown): state is OutputState => hasOwn(state, "Output", isJSONSerializable);

/**
 * Excluded from: Fail.
 */
export interface CanOutput extends Partial<OutputState> {
}

export interface InputPathState {
	InputPath: JSONPathPath | null;
}

export const isInputPathState = (value: unknown): value is InputPathState => hasOwn(value, "InputPath");

export interface OutputPathState {
	OutputPath: JSONPathPath | null;
}

export const isOutputPathState = (value: unknown): value is OutputPathState => hasOwn(value, "OutputPath");

/**
 * Excluded from: Succeed, Fail
 */
export interface CanInputOutputPath extends Partial<InputPathState>, Partial<OutputPathState> {
}

export interface ResultPathState {
	ResultPath: JSONPathPath | null;
}

export const isResultPathState = (value: unknown): value is ResultPathState => hasOwn(value, "ResultPath");

/**
 * Included in: Task, Parallel, Map, Pass
 */
export interface CanResultPath extends Partial<ResultPathState> {
}

export interface ResultSelectorState {
	ResultSelector: JSONSerializable;
}

export const isResultSelectorState = (value: unknown): value is ResultSelectorState => hasOwn(value, "ResultSelector", isJSONSerializable);

/**
 * Included in: Task, Parallel, Map
 */
export interface CanResultSelector extends Partial<ResultSelectorState> {
}

export interface ParametersState {
	Parameters: JSONObject;
}

export const isParametersState = (value: unknown): value is ParametersState => hasOwn(value, "Parameters", isJSONObject);

/**
 * Included in: Task, Parallel, Map, Pass
 */
export interface CanParameters extends Partial<ParametersState> {
}

export interface ArgumentsState {
	Arguments: JSONSerializable;
}

export const isArgumentsState = (value: unknown): value is ArgumentsState => hasOwn(value, "Arguments", isJSONSerializable);

/**
 * Included in: Task, Parallel.
 */
export interface CanArguments extends Partial<ArgumentsState> {
}

export type StatesAll = typeof STATES_ALL;
export type ErrorName = string; // `States.${string}`;

export interface Retrier {
	BackoffRate?: number;
	ErrorEquals: ErrorName[] | [ StatesAll ];
	IntervalSeconds?: number;
	JitterStrategy?: string;
	MaxAttempts?: number;
	MaxDelaySeconds?: number;
}

export interface RetryState {
	Retry: Retrier[];
}

export const isRetryState = (value: unknown): value is RetryState => hasArray(value, "Retry");

/**
 * Included in: Task, Parallel, Map
 */
export interface CanRetry extends Partial<RetryState> {
}

export interface Catcher extends CanAssign, NonTerminalState {
	ErrorEquals: ErrorName[] | [ StatesAll ];
}

export interface JSONataCatcher extends Catcher, CanOutput {
}

export interface JSONPathCatcher extends Catcher, CanResultPath {
}

export interface CatcherOf {
	[ JSONATA ]: JSONataCatcher;
	[ JSONPATH ]: JSONPathCatcher;
}

export interface CatchStateOf<Q extends QueryLanguageIdentifier> {
	Catch: CatcherOf[Q][];
}

export interface CatchState {
	Catch: (JSONataCatcher | JSONPathCatcher)[];
}

export const isCatchState = (state: unknown): state is CatchState => hasArray(state, "Catch");

/**
 * Included in: Task, Parallel, Map
 */
// export interface CanCatch extends Partial<CatchState> {
// }

export interface CanCatchOf<Q extends QueryLanguageIdentifier> extends Partial<CatchStateOf<Q>> {
}

export interface JSONataChoiceRule extends CanAssign, CanOutput, NonTerminalState {
	Condition: boolean | JSONataString;
}

export const isJSONataChoiceRule = (value: unknown): value is JSONataChoiceRule => hasOwn(value, "Condition") && (typeof value.Condition === "boolean" || isJSONataString(value.Condition));

export interface AndExpression {
	And: JSONPathChoiceRule[];
	Not?: never;
	Or?: never;
}

export const isAndExpression = (value: unknown): value is AndExpression => hasArray(value, "And");

export interface OrExpression {
	And?: never;
	Not?: never;
	Or: JSONPathChoiceRule[];
}

export const isOrExpression = (value: unknown): value is OrExpression => hasArray(value, "Or");

export interface NotExpression {
	And?: never;
	Not: JSONPathChoiceRule;
	Or?: never;
}

export const isNotExpression = (value: unknown): value is NotExpression => hasObject(value, "Not");

export interface DataTestLiteralExpressions {
	BooleanEquals: boolean;
	IsBoolean: boolean;
	IsNull: boolean;
	IsNumeric: boolean;
	IsPresent: boolean;
	IsString: boolean;
	IsTimestamp: boolean;
	NumericEquals: boolean;
	NumericGreaterThan: boolean;
	NumericGreaterThanEquals: boolean;
	NumericLessThan: boolean;
	NumericLessThanEquals: boolean;
	StringEquals: boolean;
	StringGreaterThan: boolean;
	StringGreaterThanEquals: boolean;
	StringLessThan: boolean;
	StringLessThanEquals: boolean;
	StringMatches: boolean;
	TimestampEquals: boolean;
	TimestampGreaterThan: boolean;
	TimestampGreaterThanEquals: boolean;
	TimestampLessThan: boolean;
	TimestampLessThanEquals: boolean;
}

export interface DataTestExpressions extends DataTestLiteralExpressions {
	BooleanEqualsPath: JSONPathPath;
	NumericEqualsPath: JSONPathPath;
	NumericGreaterThanEqualsPath: JSONPathPath;
	NumericGreaterThanPath: JSONPathPath;
	NumericLessThanEqualsPath: JSONPathPath;
	NumericLessThanPath: JSONPathPath;
	StringEqualsPath: JSONPathPath;
	StringGreaterThanEqualsPath: JSONPathPath;
	StringGreaterThanPath: JSONPathPath;
	StringLessThanEqualsPath: JSONPathPath;
	StringLessThanPath: JSONPathPath;
	TimestampEqualsPath: JSONPathPath;
	TimestampGreaterThanEqualsPath: JSONPathPath;
	TimestampGreaterThanPath: JSONPathPath;
	TimestampLessThanEqualsPath: JSONPathPath;
	TimestampLessThanPath: JSONPathPath;
}

export type DataTestExpression = ExactlyOneOf<DataTestExpressions> & {
	Variable: JSONPathPath;
};

export const isDataTestExpression = (value: unknown): value is DataTestExpression => hasOwn(value, "Variable");

export const isDataTestLiteralExpressionKey = (key: keyof DataTestExpressions): key is keyof DataTestLiteralExpressions => !key.endsWith("Path");

export const toDataTestLiteralExpressionKey = (key: Exclude<keyof DataTestExpressions, keyof DataTestLiteralExpressions>): keyof DataTestLiteralExpressions => key.replace("Path", "") as keyof DataTestLiteralExpressions;

export type JSONPathChoiceRule = AndExpression | OrExpression | NotExpression | DataTestExpression;

export type ChoiceRule = JSONataChoiceRule | (JSONPathChoiceRule & NonTerminalState);

export interface ErrorOutput {
	/**
	 * The human-readable message.
	 */
	Cause?: string;
	/**
	 * The machine-readable name.
	 */
	Error: string;
}

export interface NonTerminalState {
	Next: StateIdentifier;
}

export const isNonTerminalState = (value: unknown): value is NonTerminalState => hasString(value, "Next");

export interface NonTerminalStateOf<S extends StateIdentifier> {
	Next: S;
}

export type EndOrNext = EndState | NonTerminalState;
export type EndOrNextOf<S extends StateIdentifier> = EndState | NonTerminalStateOf<S>;

export interface ChoiceStateCommon extends CanAssign {
	Choices: [ ChoiceRule, ...ChoiceRule[] ];
	Default?: StateIdentifier;
	End?: never;
}

export interface JSONataChoiceState extends StateOf<ChoiceType, QueryLanguageJSONata>, ChoiceStateCommon, CanOutput, CanComment {
}

export interface JSONPathChoiceState extends StateOf<ChoiceType, QueryLanguageJSONPath>, ChoiceStateCommon, CanInputOutputPath, CanComment {
}

export type ChoiceState = JSONataChoiceState | JSONPathChoiceState;

export interface ItemProcessor {
	ProcessorConfig?: JSONObject;
	StartAt: StateIdentifier;
	States: Record<StateIdentifier, State>;
}

export interface JSONataItemProcessor extends ItemProcessor {
	ToleratedFailureCount?: number | JSONataString;
	ToleratedFailurePercentage?: number | JSONataString;
}

export type JSONPathItemProcessor = ItemProcessor & Partial<ExactlyOneOf<{
	ToleratedFailureCount: number;
	ToleratedFailureCountPath: JSONPathPath;
}>> & Partial<ExactlyOneOf<{
	ToleratedFailurePercentage: number;
	ToleratedFailurePercentagePath: JSONPathPath;
}>>;

export interface ItemReader {
	Resource: ResourceURI;
}

export interface JSONataItemReader extends ItemReader {
	Arguments?: JSONObject | JSONataString;
	ReaderConfig?: {
		MaxItems?: number | JSONataString;
	};
}

export const isJSONataItemReader = (value: unknown): value is JSONataItemReader => {
	return hasString(value, "Resource")
		&& hasOptional(value, "Arguments", (v) => isJSONataString(v) || isJSONObject(v))
		&& hasOptional(value, "ReaderConfig", (v) => isObject(v) && hasOwn(v, "MaxItems", (m) => isInt(m) || isJSONataString(m)));
};

export interface JSONPathItemReader extends ItemReader {
	Parameters?: JSONPathPayloadTemplate;
	ReaderConfig?: ExactlyOneOf<{
		MaxItems: number;
		MaxItemsPath: JSONPathPath;
	}>;
}

export const isJSONPathItemReader = (value: unknown): value is JSONPathItemReader => {
	return hasString(value, "Resource")
		&& hasOptional(value, "Parameters", isJSONPathPayloadTemplate)
		&& hasOptional(value, "ReaderConfig", (v) => isJSONObject(v) && (hasNumber(v, "MaxItems") || hasOwn(v, "MaxItemsPath", isJSONPathPath)));
};

export interface JSONataItemBatcher {
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	BatchInput?: JSONSerializable | JSONataString;
	MaxInputBytesPerBatch?: number | JSONataString;
	MaxItemsPerBatch?: number | JSONataString;
}

export const isJSONataItemBatcher = (value: unknown): value is JSONataItemBatcher =>
	hasOptional(value, "BatchInput", (v) => isJSONataString(v) || isJSONSerializable(v))
	&& hasOptional(value, "MaxInputBytesPerBatch", (v): v is JSONataString | number => isJSONataString(v) || (typeof v === "number" && Number.isSafeInteger(v)))
	&& hasOptional(value, "MaxItemsPerBatch", (v): v is JSONataString | number => isJSONataString(v) || (typeof v === "number" && Number.isSafeInteger(v)));

export type JSONPathItemBatcher = {
	BatchInput?: JSONPathPayloadTemplate;
} & Partial<ExactlyOneOf<{
	MaxItemsPerBatch: number;
	MaxItemsPerBatchPath: JSONPathPath;
}>> & Partial<ExactlyOneOf<{
	MaxInputBytesPerBatch: number;
	MaxInputBytesPerBatchPath: JSONPathPath;
}>>;

export const isJSONPathItemBatcher = (value: unknown): value is JSONPathItemBatcher =>
	hasOptional(value, "BatchInput", isJSONPathPayloadTemplate)
	&& hasOptional(value, "MaxItemsPerBatch", isInt)
	&& hasOptional(value, "MaxItemsPerBatchPath", isJSONPathPath)
	&& hasOptional(value, "MaxInputBytesPerBatch", isInt)
	&& hasOptional(value, "MaxInputBytesPerBatchPath", isJSONPathPath)
	&& (value.MaxItemsPerBatch == null || value.MaxItemsPerBatchPath == null)
	&& (value.MaxInputBytesPerBatch == null || value.MaxInputBytesPerBatchPath == null);

export interface ResultWriter {
	Resource: ResourceURI;
}

export interface JSONataResultWriter extends ResultWriter {
	Arguments?: JSONObject | JSONataString;
}

export interface JSONPathResultWriter extends ResultWriter {
	Parameters?: JSONPathPayloadTemplate;
}

export interface MapStateCommon extends CanRetry, CanAssign {
}

export interface JSONataMapStateCommon extends MapStateCommon, CanCatchOf<QueryLanguageJSONata> {
	ItemBatcher?: JSONataItemBatcher;
	ItemProcessor: JSONataItemProcessor;
	ItemReader?: JSONataItemReader;
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	ItemSelector?: Record<VariableName, JSONSerializable | JSONataString>;
	Items?: JSONataString | JSONArray;
	MaxConcurrency?: number | JSONataString;
	ResultWriter?: JSONataResultWriter;
	ToleratedFailureCount?: number | JSONataString;
	ToleratedFailurePercentage?: number | JSONataString;
}

export type JSONPathMapMaxConcurrency = Partial<ExactlyOneOf<{
	MaxConcurrency: number;
	MaxConcurrencyPath: JSONPathPath;
}>>;

export interface JSONPathMapStateCommon extends MapStateCommon, CanCatchOf<QueryLanguageJSONPath> {
	ItemBatcher?: JSONPathItemBatcher;
	ItemProcessor: JSONPathItemProcessor;
	ItemReader?: JSONPathItemReader;
	ItemSelector?: JSONPathPayloadTemplate;
	ItemsPath?: JSONPathPath;
	ResultWriter?: JSONPathResultWriter;
	ToleratedFailureCount?: number;
	ToleratedFailureCountPath?: JSONPathPath;
	ToleratedFailurePercentage?: number;
	ToleratedFailurePercentagePath?: JSONPathPath;
}

export interface JSONataMapStateWithoutEndOrNext extends StateOf<MapType, QueryLanguageJSONata>, JSONataMapStateCommon, CanOutput, CanArguments {
}

export type JSONataMapState = JSONataMapStateWithoutEndOrNext & EndOrNext & CanComment;
export type JSONataMapStateOf<S extends StateIdentifier> = JSONataMapStateWithoutEndOrNext & EndOrNextOf<S>;

export interface JSONPathMapStateWithoutEndOrNext extends StateOf<MapType, QueryLanguageJSONPath>, JSONPathMapStateCommon, CanInputOutputPath, CanResultPath, CanParameters, CanResultSelector {
}

export type JSONPathMapState = JSONPathMapStateWithoutEndOrNext & JSONPathMapMaxConcurrency & EndOrNext & CanComment;
export type JSONPathMapStateOf<S extends StateIdentifier> = JSONPathMapStateWithoutEndOrNext & JSONPathMapMaxConcurrency & EndOrNextOf<S>;
export type MapState = JSONataMapState | JSONPathMapState;
export type MapStateOf<S extends StateIdentifier> = JSONataMapStateOf<S> | JSONPathMapStateOf<S>;

export interface ParallelBranch {
	StartAt: StateIdentifier;
	States: Record<StateIdentifier, State>;
}

export interface ParallelBranchOf<S extends StateIdentifier> {
	StartAt: NoInfer<S>;
	States: Record<S, State>;
}

export interface ParallelStateCommon extends CanRetry, CanAssign {
	Branches: ParallelBranch[];
}

export interface JSONataParallelStateWithoutEndOrNext extends StateOf<ParallelType, QueryLanguageJSONata>, ParallelStateCommon, CanOutput, CanArguments, CanCatchOf<QueryLanguageJSONata> {
}

export type JSONataParallelState = JSONataParallelStateWithoutEndOrNext & EndOrNext & CanComment;
export type JSONataParallelStateOf<S extends StateIdentifier> = JSONataParallelStateWithoutEndOrNext & EndOrNextOf<S>;

export interface JSONPathParallelStateWithoutEndOrNext extends StateOf<ParallelType, QueryLanguageJSONPath>, ParallelStateCommon, CanInputOutputPath, CanResultPath, CanParameters, CanResultSelector, CanCatchOf<QueryLanguageJSONPath> {
}

export type JSONPathParallelState = JSONPathParallelStateWithoutEndOrNext & EndOrNext & CanComment;
export type JSONPathParallelStateOf<S extends StateIdentifier> = JSONPathParallelStateWithoutEndOrNext & EndOrNextOf<S>;
export type ParallelState = JSONataParallelState | JSONPathParallelState;
export type ParallelStateOf<S extends StateIdentifier> = JSONataParallelStateOf<S> | JSONPathParallelStateOf<S>;

export interface PassStateCommon extends CanAssign {
	Result?: JSONSerializable | undefined;
}

export interface JSONataPassStateWithoutEndOrNext extends StateOf<PassType, QueryLanguageJSONata>, PassStateCommon, CanOutput {
}

export type JSONataPassState = JSONataPassStateWithoutEndOrNext & EndOrNext & CanComment;
export type JSONataPassStateOf<S extends StateIdentifier> = JSONataPassStateWithoutEndOrNext & EndOrNextOf<S>;

export interface JSONPathPassStateWithoutEndOrNext extends StateOf<PassType, QueryLanguageJSONPath>, PassStateCommon, CanInputOutputPath, CanResultPath, CanParameters {
}

export type JSONPathPassState = JSONPathPassStateWithoutEndOrNext & EndOrNext & CanComment;
export type JSONPathPassStateOf<S extends StateIdentifier> = JSONPathPassStateWithoutEndOrNext & EndOrNextOf<S>;
export type PassState = JSONataPassState | JSONPathPassState;
export type PassStateOf<S extends StateIdentifier> = JSONataPassStateOf<S> | JSONPathPassStateOf<S>;

export type ResourceURI = string;
export type ARN = `arn:aws:${ string }`;

export interface JSONataTaskTimeout {
	HeartbeatSeconds?: JSONataString | number;
	TaskTimeout?: JSONataString | number;
}

export interface JSONPathTaskTimeoutNumber {
	TaskTimeout?: number;
	TaskTimeoutPath?: never;
}

export interface JSONPathTaskHeartbeatNumber {
	HeartbeatSeconds?: number;
	HeartbeatSecondsPath?: never;
}

export interface JSONPathTaskTimeoutPath {
	TaskTimeout?: never;
	TaskTimeoutPath?: JSONPathPath;
}

export interface JSONPathTaskHeartbeatPath {
	HeartbeatSeconds?: never;
	HeartbeatSecondsPath?: JSONPathPath;
}

export type JSONPathTaskTimeout = (JSONPathTaskTimeoutNumber | JSONPathTaskHeartbeatNumber) & (JSONPathTaskTimeoutPath | JSONPathTaskHeartbeatPath);

export interface HasTimeoutsState {
	HeartbeatSeconds?: number | JSONataString;
	HeartbeatSecondsPath?: JSONPathPath;
	TaskTimeout?: number | JSONataString;
	TaskTimeoutPath?: JSONPathPath;
}

export const hasTimeouts = (value: unknown): value is HasTimeoutsState => {
	return isJSONObject(value) &&
		([ "HeartbeatSecondsPath", "TaskTimeoutPath", "TaskTimeout", "HeartbeatSeconds" ].some((k) => hasString(value, k))
			|| [ "HeartbeatSeconds", "TaskTimeout" ].some((k) => hasNumber(value, k)));
};

export interface TaskStateCommon extends CanRetry, CanAssign {
	Credentials?: JSONObject;
	Resource: ResourceURI;
}

export interface JSONataTaskStateWithoutEndOrNext extends StateOf<TaskType, QueryLanguageJSONata>, TaskStateCommon, CanOutput, CanArguments, CanCatchOf<QueryLanguageJSONata> {
}

export type JSONataTaskState = JSONataTaskStateWithoutEndOrNext & JSONataTaskTimeout & EndOrNext & CanComment;
export type JSONataTaskStateOf<S extends StateIdentifier> = JSONataTaskStateWithoutEndOrNext & JSONataTaskTimeout & EndOrNextOf<S>;

export interface JSONPathTaskStateWithoutEndOrNext extends StateOf<TaskType, QueryLanguageJSONPath>, TaskStateCommon, CanInputOutputPath, CanResultPath, CanParameters, CanCatchOf<QueryLanguageJSONPath> {
}

export type JSONPathTaskState = JSONPathTaskStateWithoutEndOrNext & JSONPathTaskTimeout & EndOrNext & CanComment;
export type JSONPathTaskStateOf<S extends StateIdentifier> = JSONPathTaskStateWithoutEndOrNext & JSONPathTaskTimeout & EndOrNextOf<S>;
export type TaskState = JSONataTaskState | JSONPathTaskState;
export type TaskStateOf<S extends StateIdentifier> = JSONataTaskStateOf<S> | JSONPathTaskStateOf<S>;

export interface WaitSeconds {
	Seconds: number;
	Timestamp?: never;
}

export interface WaitTimestamp {
	Seconds?: never;
	Timestamp: IsoDateTime;
}

export type WaitTime = WaitSeconds | WaitTimestamp;

export interface JSONPathWaitFields {
	Seconds: number;
	SecondsPath: JSONPathPath;
	Timestamp: IsoDateTime;
	TimestampPath: JSONPathPath;
}

export type JSONPathWaitTime = ExactlyOneOf<JSONPathWaitFields>;

export interface JSONataWaitTimes {
	Seconds: number | JSONataString;
	Timestamp: IsoDateTime | JSONataString;
}

export type JSONataWaitTime = ExactlyOneOf<JSONataWaitTimes>;

export interface WaitStateCommon extends CanAssign, NonTerminalState {
}

export interface JSONataWaitStateWithoutEndOrNext extends StateOf<WaitType, QueryLanguageJSONata>, WaitStateCommon, CanOutput {
}

export type JSONataWaitState = JSONataWaitStateWithoutEndOrNext & JSONataWaitTime & EndOrNext & CanComment;
export type JSONataWaitStateOf<S extends StateIdentifier> = JSONataWaitStateWithoutEndOrNext & JSONataWaitTime & EndOrNextOf<S>;

export interface JSONPathWaitStateWithoutEndOrNext extends StateOf<WaitType, QueryLanguageJSONPath>, WaitStateCommon, CanInputOutputPath {
}

export type JSONPathWaitState = JSONPathWaitStateWithoutEndOrNext & JSONPathWaitTime & EndOrNext & CanComment;
export type JSONPathWaitStateOf<S extends StateIdentifier> = JSONPathWaitStateWithoutEndOrNext & JSONPathWaitTime & EndOrNextOf<S>;
export type WaitState = JSONataWaitState | JSONPathWaitState;
export type WaitStateOf<S extends StateIdentifier> = JSONataWaitStateOf<S> | JSONPathWaitStateOf<S>;

export interface FailStateCommon {
	Cause?: string;
	Error?: ErrorName;
	Next?: never;
}

export interface JSONataFailStateCommon extends FailStateCommon {
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	Cause?: JSONataString | string;
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	Error?: ErrorName | JSONataString;
}

export interface JSONPathFailStateCauses {
	Cause: string;
	CausePath: JSONPathPath;
}

export interface JSONPathFailStateErrors {
	Error: ErrorName;
	ErrorPath: JSONPathPath;
}

export type JSONPathFailStateCommon = {
	Next?: never;
} & Partial<ExactlyOneOf<JSONPathFailStateCauses>> & Partial<ExactlyOneOf<JSONPathFailStateErrors>>;

export interface JSONataFailState extends StateOf<FailType, QueryLanguageJSONata>, JSONataFailStateCommon, CanOutput, CanComment {
}

export type JSONPathFailState = StateOf<FailType, QueryLanguageJSONPath> & JSONPathFailStateCommon & CanInputOutputPath & CanComment;
export type FailState = JSONataFailState | JSONPathFailState;

export interface SucceedStateCommon {
	Next?: never;
}

export interface JSONataSucceedState extends StateOf<SucceedType, QueryLanguageJSONata>, SucceedStateCommon, CanOutput, CanComment {
}

export interface JSONPathSucceedState extends StateOf<SucceedType, QueryLanguageJSONPath>, SucceedStateCommon, CanInputOutputPath, CanComment {
}

export type SucceedState = JSONataSucceedState | JSONPathSucceedState;

export const isSucceedState = <S extends State>(state: S): state is S & SucceedState => state.Type === "Succeed";

export type TerminalState = EndState | SucceedState | FailState;

export type VariableName = string;

export type StateIdentifier = string;

export type JSONataString = `{%${ string }%}`;

export const isJSONataString = (value: unknown): value is JSONataString => value != null && typeof value === "string" && value.startsWith("{%") && value.endsWith("%}");

export type JSONPathPath = `$${ string }`;

export const isJSONPathPath = (value: unknown): value is JSONPathPath => typeof value === "string" && value.startsWith("$");

export type JSONPathInterpolated = `${ string }.$`;

export const isJSONPathInterpolated = (value: unknown): value is JSONPathInterpolated => value != null && typeof value === "string" && value.endsWith(".$");

export type IntrinsicFunctionExpression = `${ IntrinsicFunctionName }(${ string })`;

// @see {@link https://www.ietf.org/rfc/rfc3339.txt}
// export type Digit19 = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
// export type Digit = Digit19 | "0";
// export type IsoDateMonth = `0${Digit19}` | `1${"0"|"1"|"2"}`;
// export type IsoDateDay28 = `0${Digit19}` | `${"1"|"2"}${Digit}`;
// export type IsoDateDay30 = IsoDateDay28 | "30";
// export type IsoDateDay31 = IsoDateDay30 | "31";
// export type IsoDateMonthDay28 = `02-${IsoDateDay28}`;
// export type IsoDateMonthDay30 = `${"04"|"06"|"09"|"11"}-${IsoDateDay30}`;
// export type IsoDateMonthDay31 = `${"01"|"03"|"05"|"07"|"08"|"10"|"12"}-${IsoDateDay31}`;
// export type IsoDateMonthDay = IsoDateMonthDay28 | IsoDateMonthDay30 | IsoDateMonthDay31;
// export type IsoDate = `${number}${number}${number}${number}-${IsoDateMonthDay}`;
// export type IsoTimeHour = "00" | "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23";
// export type IsoTimeMinute = `${"0"|"1"|"2"|"3"|"4"|"5"}${number}`;
// export type IsoTimeSecond = `${"0"|"1"|"2"|"3"|"4"|"5"|"6"}${number}`;
// export type IsoTime = `${IsoTimeHour}:${IsoTimeMinute}:${IsoTimeSecond}` | `${IsoTimeHour}:${IsoTimeMinute}:${IsoTimeSecond}.${number}`;
// export type UtcIsoDateTime = `${IsoDate}T${IsoTime}Z`;
// export type IsoTimeZoneOffset = `${"+"|"-"}${IsoTimeHour}:${IsoTimeMinute}`;
// export type ZonedIsoDateTime = `${IsoDate}T${IsoTime}${IsoTimeZoneOffset}`;
// export type IsoDateTime = UtcIsoDateTime | ZonedIsoDateTime;

export type SimpleIsoDate = `${ number }${ number }${ number }${ number }-${ number }${ number }-${ number }${ number }`;
export type SimpleIsoTime = `${ number }${ number }:${ number }${ number }:${ number }${ number }${ "" | `.${ number }` }`;
export type SimpleIsoTimeZone = "Z" | `${ "+" | "-" }${ number }${ number }:${ number }${ number }`;
export type IsoDateTime = `${ SimpleIsoDate }T${ SimpleIsoTime }${ SimpleIsoTimeZone }`;
