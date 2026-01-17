import { describe, beforeEach, afterEach, expect, test } from "bun:test";
import { Deck, TransactionalDeck } from "./src/deck";
import { tmpdir } from "node:os"
import { mkdtempSync, rmSync } from "node:fs"
import path from "node:path";

describe("Atomic operations on deck", () => {
    let deck: Deck;

    beforeEach(() => {
        deck = new Deck();
    });

    test("Add a card to the deck", () => {
        deck.addCard("Mountain");
        expect(deck.numberOfCards()).toBe(1);

        deck.addCard("Mountain", 2);
        expect(deck.numberOfCards()).toBe(3);

        deck.addCard("Island", 3);
        expect(deck.numberOfCards()).toBe(6);
        expect(deck.numberOf("Island")).toBe(3);
    });

    test("Remove cards from the deck", () => {
        deck.addCard("Mountain", 5);
        deck.removeCard("Mountain");
        expect(deck.numberOfCards()).toBe(4);

        deck.removeCard("Mountain", 2);
        expect(deck.numberOfCards()).toBe(2);

        deck.removeCard("Mountain", 3);
        expect(deck.numberOfCards()).toBe(0);

        deck.addCard("Island", 3);
        expect(deck.numberOfCards()).toBe(3);

        deck.removeCard("Island", 3);
        expect(deck.numberOfCards()).toBe(0);
    });

    test("Remove should not remove more cards than are in the deck", () => {
        deck.addCard("Mountain", 1);
        deck.removeCard("Mountain", 2);
        expect(deck.numberOfCards()).toBe(0);
    });
});

describe("Deck disk operations", () => {
    const deckFileName = "deck.txt";
    let testDirName = "";
    let deck: Deck;

    const tempDeckPath = () => path.join(testDirName, deckFileName);

    beforeEach(() => {
        testDirName = mkdtempSync(path.join(tmpdir(), "deck-test-"));
        deck = new Deck();
    });

    afterEach(() => {
        rmSync(testDirName, { recursive: true, force: true });
    })

    test("Save and load deck", async () => {
        await deck.saveToDisk(tempDeckPath());
        const deckFile = Bun.file(tempDeckPath());
        expect(await Deck.loadFromFile(deckFile)).toBeTypeOf("object");

        
    });

    test("Save and load an empty deck", async () => {
        deck.addCard("Island", 10);
        deck.addCard("Mountain", 10);
        await deck.saveToDisk(tempDeckPath());
        const loadedDeck: Deck = await Deck.loadFromFile(Bun.file(tempDeckPath()));
        expect(loadedDeck.numberOf("Island")).toBe(10);
        expect(loadedDeck.numberOf("Mountain")).toBe(10);
    })
});

describe("Deck list parsing", () => {
    test("Simple parse", () => {
        const testString = "1 And They Shall Know No Fear";

        const parsedString = Deck.parseString(testString);
        expect(parsedString.quantity).toBe(1);
        expect(parsedString.cardName).toBe("And They Shall Know No Fear");
    });

    test("Parse with set, without finish", () => {
        const testString = "1 Reaver Titan (40K) 163";

        const parsedString = Deck.parseString(testString);
        expect(parsedString.quantity).toBe(1);
        expect(parsedString.cardName).toBe("Reaver Titan");
        expect(parsedString.setCode).toBe("40K");
        expect(parsedString.collectorCode).toBe(163);
        expect(parsedString.finish).toBeUndefined();
    });

    test("Parse with set, with finish", () => {
        const testString = "1 Marneus Calgar (40K) 8 *F*";

        const parsedString = Deck.parseString(testString);
        expect(parsedString.quantity).toBe(1);
        expect(parsedString.cardName).toBe("Marneus Calgar");
        expect(parsedString.setCode).toBe("40K");
        expect(parsedString.collectorCode).toBe(8);
        expect(parsedString.finish).toBe("*F*")
    });
});

describe("Transactional deck tests", () => {
    let deck: TransactionalDeck;

    beforeEach(() => {
        deck = new TransactionalDeck();
    });

    test("Able to get state of previous deck iterations", () => {
        deck.addCard("Mountain", 4);
        const previousState = deck.getStateIndex();
        deck.removeCard("Mountain", 4);

        expect(deck.numberOf("Mountain")).toBe(0);

        expect(deck.getStateIndex()).toBe(previousState + 1);
        expect(deck.getState(previousState).numberOf("Mountain")).toBe(4);
    });

    test("Edge case: OOB state index", () => {
        deck.addCard("Mountain", 4);
        expect(() => deck.getState(2)).toThrow();
    });
});