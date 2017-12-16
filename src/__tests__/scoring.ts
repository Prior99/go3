import { newRating, GameResult, rankFromRating, RankClass } from "../scoring";

[
    {
        own: 320,
        other: 400,
        result: GameResult.WIN,
        expected: 383,
    },
    {
        own: 400,
        other: 320,
        result: GameResult.LOSS,
        expected: 340,
    },
    {
        own: 2400,
        other: 2400,
        result: GameResult.WIN,
        expected: 2407.5,
    },
    {
        own: 2400,
        other: 2400,
        result: GameResult.LOSS,
        expected: 2392.5,
    },
].forEach(({ own, other, result, expected }) => {
    test(`Rating ${own} vs ${other} with a ${result} adjusts the rating to ${expected}`, () => {
        expect(Math.abs(newRating(own, other, result) - expected)).toBeLessThan(2);
    });
});

describe("Calculating ranks from the rating", () => {
    test("0 is equal to 21kyu", () => expect(rankFromRating(0)).toEqual({ rank: 21, rankClass: RankClass.KYU }));
    test("50 is equal to 21kyu", () => expect(rankFromRating(50)).toEqual({ rank: 21, rankClass: RankClass.KYU }));
    test("100 is equal to 20kyu", () => expect(rankFromRating(100)).toEqual({ rank: 20, rankClass: RankClass.KYU }));
    test("500 is equal to 16kyu", () => expect(rankFromRating(500)).toEqual({ rank: 16, rankClass: RankClass.KYU }));
    test("800 is equal to 13kyu", () => expect(rankFromRating(800)).toEqual({ rank: 13, rankClass: RankClass.KYU }));
    test("1000 is equal to 11kyu", () => expect(rankFromRating(1000)).toEqual({ rank: 11, rankClass: RankClass.KYU }));
    test("1900 is equal to 2kyu", () => expect(rankFromRating(1900)).toEqual({ rank: 2, rankClass: RankClass.KYU }));
    test("2000 is equal to 1kyu", () => expect(rankFromRating(2000)).toEqual({ rank: 1, rankClass: RankClass.KYU }));
    test("2100 is equal to 1dan", () => expect(rankFromRating(2100)).toEqual({ rank: 1, rankClass: RankClass.DAN }));
    test("2700 is equal to 7dan", () => expect(rankFromRating(2700)).toEqual({ rank: 7, rankClass: RankClass.DAN }));
    test("2800 is equal to 8dan", () => expect(rankFromRating(2800)).toEqual({ rank: 8, rankClass: RankClass.DAN }));
});
