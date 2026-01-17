import type { BunFile } from "bun";

type TDeck = Record<string, number>
type TCardName = string

interface IDeckEntry {
    quantity: number,
    cardName: TCardName,
    setCode?: string,
    collectorCode?: number,
    finish?: string,
}

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

    async saveToDisk(path: string) {
        await Bun.write(Bun.file(path),
            Object.entries(this.#deck)
                .map(entry => {
                    const [cardName, quantity] = entry;
                    return `${quantity} ${cardName}`
                })
                .join("\n")
        );
    }

    static async loadFromFile(file: BunFile): Promise<Deck> {
        const resultDeck = new Deck();
        const fileText = await file.text();
        for (const line of fileText.split("\n")) {
            if (!line) break;
            const entry = this.parseString(line);
            resultDeck.addCard(entry.cardName, entry.quantity);
        }

        return resultDeck;
    }

    static parseString(deckEntry: string): IDeckEntry {
        let splitDeck = deckEntry.split(" ");
        if (splitDeck.length < 2) throw new Error("Invalid string");

        const parsedQuantity = parseInt(splitDeck.at(0)!);
        const lastParsedFragment = splitDeck.at(-1)!;
        if (lastParsedFragment.startsWith("*")) { // Handle finishes
            const parsedFinish = lastParsedFragment;
            const parsedCollectorCode = parseInt(splitDeck.at(-2)!);
            const parsedSetCode = splitDeck.at(-3)!.slice(1, -1);
            const parsedCardName = splitDeck.slice(1, -3).join(" ");
            return {
                quantity: parsedQuantity,
                cardName: parsedCardName,
                setCode: parsedSetCode,
                collectorCode: parsedCollectorCode,
                finish: parsedFinish,
            }
        }

        if (!Number.isNaN(parseInt(lastParsedFragment))) { // Handle with set/collector number
            const parsedCollectorCode = parseInt(lastParsedFragment);
            const parsedSetCode = splitDeck.at(-2)!.slice(1, -1);
            const parsedCardName = splitDeck.slice(1, -2).join(" ");

            return {
                quantity: parsedQuantity,
                cardName: parsedCardName,
                setCode: parsedSetCode,
                collectorCode: parsedCollectorCode,
            }
        }

        const parsedCardName = splitDeck.slice(1).join(" ");
        return {
            quantity: parsedQuantity,
            cardName: parsedCardName,
        }
    }
}