export enum RankClass {
    KYU = "kyu",
    DAN = "dan",
}

export class Rank {
    public rank: number;
    public rankClass: RankClass;
    public rating: number;

    constructor(rating: number) {
        this.rating = rating;
        if (rating < 2100) {
            this.rank = Math.round((2000 - rating) / 100 + 1);
            this.rankClass = RankClass.KYU;
        } else {
            this.rank = Math.round((rating - 2000) / 100);
            this.rankClass = RankClass.DAN;
        }
    }

    public format() {
        if (this.rankClass === RankClass.KYU) {
            return `${this.rank} Kyu`;
        }
        return `${this.rank} Dan`;
    }

    public formatShort() {
        if (this.rankClass === RankClass.KYU) {
            return `${this.rank}k`;
        }
        return `${this.rank}d`;
    }

    public equals(other: Rank) {
        return this.rank === other.rank && this.rankClass === other.rankClass;
    }

    public greaterThan(other: Rank) {
        if (this.rankClass === other.rankClass) {
            return this.rankClass === RankClass.KYU ? this.rank < other.rank : this.rank > other.rank;
        }
        if (this.rankClass === RankClass.DAN) {
            return true;
        }
        return false;
    }
}

export function formatRank(rating: number) {
    const rank = new Rank(rating);
    return rank.format();
}

export function formatRankShort(rating: number) {
    const rank = new Rank(rating);
    return rank.formatShort();
}
