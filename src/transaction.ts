import type { IDeckEntry } from "./deck";

interface TransactionTypeAdd {
    type: "Add";
    entry: IDeckEntry;
    timestamp: number;
};

interface TransactionTypeRemove {
    type: "Remove";
    entry: IDeckEntry;
    timestamp: number;
};


export type Transaction = TransactionTypeAdd | TransactionTypeRemove;