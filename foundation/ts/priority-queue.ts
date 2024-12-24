import type { Queue } from "./queue.js";
import { PriorityArray } from "./priority-array.js";
import { PriorityLinkedList } from "./priority-linked-list.js";
import type { Comparator } from "@rickosborne/typical";

export const priorityArray = <T>(
	comparator: Comparator<T>,
): Queue<T> => {
	return new PriorityArray(comparator);
};

export const priorityLinkedList = <T>(
	comparator: Comparator<T>,
): Queue<T> => {
	return new PriorityLinkedList<T>(comparator);
};
