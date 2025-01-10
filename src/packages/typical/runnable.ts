/**
 * A function which can be run without any input or output.
 */
export type Runnable = () => (void | undefined);

/**
 * An async function which can be run without any input or output.
 */
export type AsyncRunnable = () => Promise<void | undefined>;
