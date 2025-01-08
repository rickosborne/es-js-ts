/**
 * Combine two types such that properties with matching keys are
 * overwritten entirely by the Winner.
 */
export type Overwrite<Loser extends object, Winner extends object> = Omit<Loser, keyof Winner & keyof Loser> & Winner;
