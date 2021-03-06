export enum GameResult {
    WIN = "win",
    LOSS = "loss",
    TIE = "tie",
}

/**
 * Implementation of the official EGF rating system.
 * http://www.europeangodatabase.eu/EGD/EGF_rating_system.php
 */
const epsilon = 0.016;

function winningExpectancy(ratingDifference: number) {
    // SE(A) = 1 / (e ^ (D / a) + 1) - epsilon / 2
    return 1 / (Math.exp(ratingDifference / adjustment(ratingDifference)) + 1) - epsilon / 2;
}

function adjustment(rating: number) {
    return 205 - Math.floor(rating / 20);
}

function magnitude(rating: number) {
    return Math.round(122 - 6 * (rating / 100) + Math.pow(rating / 100, 2) / 15);
}

function scoreFromResult(result: GameResult) {
    switch (result) {
        case GameResult.WIN: return 1;
        case GameResult.TIE: return 0.5;
        case GameResult.LOSS: return 0;
        default: return;
    }
}

export function newRating(oldRating: number, otherRating: number, result: GameResult) {
    const actualScore = scoreFromResult(result);
    const expectedScore = winningExpectancy(otherRating - oldRating);
    let difference = actualScore - expectedScore;
    return Math.round(oldRating + magnitude(oldRating) * (actualScore - expectedScore));
}
