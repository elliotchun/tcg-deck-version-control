import type { Transaction } from "./transaction";

export class TransactionManager {
    #transactions: Transaction[];

    constructor() {
        this.#transactions = [];
    }

    getTransactions() {
        return [...this.#transactions];
    }

    applyTransaction(transaction: Transaction) {
        this.#transactions.push(transaction);
    }

    getStateIndex() {
        return this.#transactions.length;
    }

    toString() {
        return JSON.stringify(this.#transactions);
    }
}