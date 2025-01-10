import type { Comparator } from "@rickosborne/typical";
import { PriorityArray } from "./priority-array.js";
import { PriorityLinkedList } from "./priority-linked-list.js";
import type { Queue } from "./queue.js";

/**
 * Build a priority queue which uses an array as a backing store.
 */
export const priorityArray = <T>(
	comparator: Comparator<T>,
): Queue<T> => {
	return new PriorityArray(comparator);
};

/**
 * Build a priority queue which uses a linked list as a backing store.
 */
export const priorityLinkedList = <T>(
	comparator: Comparator<T>,
): Queue<T> => {
	return new PriorityLinkedList<T>(comparator);
};
