type TDeck = Record<string, number>
type TCardName = string

interface IDeckEntry {
    quantity: number,
    cardName: TCardName,
}

interface IDeckEntryWithSet extends IDeckEntry {
    setCode: string,
    collectorCode: number,
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

    saveToDisk(fileName: string) {
        Object.entries(this.#deck).forEach(entry => {
            const [cardName, quantity] = entry;

        });


    }

    static async loadFromFile(path: string): Promise<Deck> {
        const resultDeck = new Deck();
        const file = Bun.file(path);
        const fileText = await file.text();
        for (const line of fileText.split("\n")) {
            const entry = this.parseString(line);
            resultDeck.addCard(entry.cardName, entry.quantity);
        }

        return resultDeck;
    }

    static parseString(deckEntry: string): IDeckEntry {
        let splitDeck = deckEntry.split(" ");
        if (splitDeck.length < 2) throw new Error("Invalid string");
        const parsedQuantity = parseInt(splitDeck.at(0)!);
        const parsedCardName = splitDeck.slice(1).join(" ");

        return {
            quantity: parsedQuantity,
            cardName: parsedCardName,
        }
    }

    static parseStringWithSet(deckEntry: string): IDeckEntryWithSet {
        let splitDeck = deckEntry.split(" ");
        if (splitDeck.length < 4) throw new Error("Invalid string");
        const parsedQuantity = parseInt(splitDeck.at(0)!);

        if (splitDeck.at(-1)!.startsWith("*")) { // Handle finishes
            const parsedFinish = splitDeck.at(-1);
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

        const parsedCollectorCode = parseInt(splitDeck.at(-1)!);
        const parsedSetCode = splitDeck.at(-2)!.slice(1, -1);
        const parsedCardName = splitDeck.slice(1, -2).join(" ");

        return {
            quantity: parsedQuantity,
            cardName: parsedCardName,
            setCode: parsedSetCode,
            collectorCode: parsedCollectorCode,
        }
    }
}