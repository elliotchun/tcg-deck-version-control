import { describe, beforeEach, expect, test } from "bun:test";
import Deck from "./src/deck";

describe("DeckState", () => {
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