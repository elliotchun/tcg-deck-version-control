type TDeck = Record<string, number>
type TCardName = string

export default class Deck {
    #deck: TDeck;

    constructor() {
        this.#deck = {};
    }

    addCard(name: TCardName, quantity = 1) {
        this.#deck[name] = this.numberOf(name) + quantity;
    }
    removeCard(name: TCardName, quantity = 1) {
        if (this.#deck[name]) {
            this.#deck[name] -= quantity;
            if (this.#deck[name] <= 0) {
                delete this.#deck[name];
            }
        }
    }
    numberOfCards(): number {
        return Object.values(this.#deck).reduce((total, quantity) => total + quantity, 0);
    }
    numberOf(name: TCardName): number {
        return this.#deck[name] || 0
    }
}