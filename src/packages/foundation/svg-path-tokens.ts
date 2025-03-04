export type SvgAbsolutePathCommand = "M" | "L" | "H" | "V" | "Z" | "C" | "S" | "Q" | "T" | "A";
export type SvgRelativePathCommand = Lowercase<SvgAbsolutePathCommand>;
export type SvgPathCommand = SvgAbsolutePathCommand | SvgRelativePathCommand;

export const SVG_ABSOLUTE_PATH_COMMANDS: readonly SvgAbsolutePathCommand[] = Object.freeze([
	"M", "L", "H", "V", "Z", "C", "S", "Q", "T", "A",
]);

export const isSvgAbsolutePathCommand = (value: unknown): value is SvgAbsolutePathCommand => typeof value === "string" && SVG_ABSOLUTE_PATH_COMMANDS.includes(value as SvgAbsolutePathCommand);

export const SVG_RELATIVE_PATH_COMMANDS: readonly SvgRelativePathCommand[] = Object.freeze([
	"m", "l", "h", "v", "z", "c", "s", "q", "t", "a",
]);

export const isSvgRelativePathCommand = (value: unknown): value is SvgRelativePathCommand => typeof value === "string" && SVG_RELATIVE_PATH_COMMANDS.includes(value as SvgRelativePathCommand);

export const SVG_PATH_COMMANDS: readonly SvgPathCommand[] = Object.freeze([
	...SVG_ABSOLUTE_PATH_COMMANDS,
	...SVG_RELATIVE_PATH_COMMANDS,
]);

export const isSvgPathCommand = (value: unknown): value is SvgPathCommand => typeof value === "string" && SVG_PATH_COMMANDS.includes(value as SvgPathCommand);

export interface SvgPathTokenByType {
	arc: ArcSvgPathToken;
	close: CloseSvgPathToken;
	cubic: CubicCurveSvgPathToken;
	line: LineSvgPathToken;
	move: MoveSvgPathToken;
	quad: QuadraticCurveSvgPathToken;
}

export type SvgPathToken = SvgPathTokenByType[keyof SvgPathTokenByType];

export interface SvgPathTokenBase<T extends keyof SvgPathTokenByType> {
	type: T;
}

export interface MoveSvgPathToken extends SvgPathTokenBase<"move"> {
	delta: boolean;
	x: number;
	y: number;
}

export interface LineSvgPathToken extends SvgPathTokenBase<"line"> {
	delta: boolean;
	x: number;
	y: number;
}

export interface CloseSvgPathToken extends SvgPathTokenBase<"close"> {
}

export interface CubicCurveSvgPathToken extends SvgPathTokenBase<"cubic"> {
	delta: boolean;
	x: number;
	x1: number;
	x2: number;
	y: number;
	y1: number;
	y2: number;
}

export interface QuadraticCurveSvgPathToken extends SvgPathTokenBase<"quad"> {
	delta: boolean;
	x: number;
	x1: number;
	y: number;
	y1: number;
}

export interface ArcSvgPathToken extends SvgPathTokenBase<"arc"> {
	delta: boolean;
	large: boolean;
	rx: number;
	ry: number;
	sweep: boolean;
	x: number;
	xar: number;
	y: number;
}

export interface SvgPathValueByType {
	command: CommandSvgPathValue;
	number: NumberSvgPathValue;
	space: SpaceSvgPathValue;
}

export type SvgPathValueType = keyof SvgPathValueByType;

export interface SvgPathValueBase<T extends SvgPathValueType> {
	at: number;
	length: number;
	type: T;
}

export type SvgPathValue = SvgPathValueByType[SvgPathValueType];

export interface CommandSvgPathValue extends SvgPathValueBase<"command"> {
	value: SvgPathCommand;
}

export interface SpaceSvgPathValue extends SvgPathValueBase<"space"> {
	value: string;
}

export interface NumberSvgPathValue extends SvgPathValueBase<"number"> {
	value: number;
}
