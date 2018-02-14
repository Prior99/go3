import { testBoard } from "./utils";
import { Board } from "../";
import { Color } from "../../../utils";

[
    {
        board: testBoard(
            "WBB " +
            "WW B" +
            "WB  " +
            "WB  ",
        ),
        pos: { col: 1, row: 1 },
    },
    {
        board: testBoard(
            "  W " +
            " BWW" +
            " BW " +
            "  W ",
        ),
        pos: { col: 2, row: 0 },
    },
    {
        board: testBoard(
            "    " +
            "W W " +
            " W  " +
            "W W ",
        ),
        pos: { col: 1, row: 2 },
    },
    {
        board: testBoard(
            "WWWW" +
            "W  W" +
            "W  W" +
            "WWWW",
        ),
        pos: { col: 0, row: 0 },
    },
].forEach(({ board, pos }) => {
    test("detects the groups correctly", () => {
        expect(board.groupAt(board.toIndex(pos)).indices.map(board.toPos)).toMatchSnapshot();
    });
});

test("constructing a board from an old one", () => {
    debugger
    const board = testBoard(
        "WWWB " +
        "W WB " +
        "WWWB " +
        "BBBB " +
        "     ",
    );
    (board as any).id = "some-id";
    board.prisonersBlack = 10;
    board.prisonersWhite = 10;
    board.created = new Date("2017-11-15 12:00:00");
    board.updated = new Date("2017-11-15 12:00:00");
    board.turn = 6;

    const newBoard = new Board(board, board.toIndex({ col: 1, row: 1 }));
    expect(newBoard).toMatchSnapshot();
});

[
    { turn: 0, color: Color.BLACK },
    { turn: 1, color: Color.WHITE },
    { turn: 2, color: Color.BLACK },
].forEach(({ turn, color }) => {
    test(`color ${color} is to play at turn ${turn}`, () => {
        const board = testBoard("    ");
        board.turn = turn;
        expect(board.currentColor).toEqual(color);
    });
});

[
    {
        board: testBoard(
            "B " +
            "  ",
        ),
        equal: testBoard(
            "B " +
            "  ",
        ),
        other: testBoard(
            "  " +
            "  ",
        ),
    },
    {
        board: testBoard(
            "WWW" +
            "W  " +
            "W  ",
        ),
        equal: testBoard(
            "WWW" +
            "W  " +
            "W  ",
        ),
        other: testBoard(
            "WWW" +
            "   " +
            "W  ",
        ),
    },
].forEach(({ board, equal, other }) => {
    test(`boards compared for equality`, () => {
        expect(board.equals(equal)).toBe(true);
        expect(board.equals(other)).toBe(false);
    });
});

test("converting indices to positions and back", () => {
    const board = testBoard(
        "   " +
        "   " +
        "   ",
    );
    expect(board.toPos(0)).toEqual({ col: 0, row: 0 });
    expect(board.toPos(4)).toEqual({ col: 1, row: 1 });
    expect(board.toPos(6)).toEqual({ col: 0, row: 2 });
    expect(board.toIndex({ col: 0, row: 0 })).toEqual(0);
    expect(board.toIndex({ col: 1, row: 1 })).toEqual(4);
    expect(board.toIndex({ col: 0, row: 2 })).toEqual(6);
});

test("getting the neighbours of position", () => {
    const board = testBoard(
        "   " +
        " W " +
        "   ",
    );
    expect(board.neighbours(board.toIndex({ col: 1, row: 1 })).map(board.toPos)).toMatchSnapshot();
    expect(board.neighbours(board.toIndex({ col: 0, row: 0 })).map(board.toPos)).toMatchSnapshot();
    expect(board.neighbours(board.toIndex({ col: 1, row: 0 })).map(board.toPos)).toMatchSnapshot();
    expect(board.neighbours(board.toIndex({ col: 2, row: 2 })).map(board.toPos)).toMatchSnapshot();
    expect(board.neighbours(board.toIndex({ col: 1, row: 2 })).map(board.toPos)).toMatchSnapshot();
});

test("getting the neighbours of position with specified color", () => {
    const board = testBoard(
        " B " +
        "W W" +
        " B ",
    );
    expect(board.neighboursOfColor(board.toIndex({ col: 1, row: 1 }), Color.BLACK).map(board.toPos))
        .toMatchSnapshot();
    expect(board.neighboursOfColor(board.toIndex({ col: 0, row: 0 }), Color.BLACK).map(board.toPos))
        .toMatchSnapshot();
    expect(board.neighboursOfColor(board.toIndex({ col: 1, row: 0 }), Color.BLACK).map(board.toPos))
        .toMatchSnapshot();
    expect(board.neighboursOfColor(board.toIndex({ col: 2, row: 2 }), Color.WHITE).map(board.toPos))
        .toMatchSnapshot();
    expect(board.neighboursOfColor(board.toIndex({ col: 1, row: 2 }), Color.BLACK).map(board.toPos))
        .toMatchSnapshot();
});

test("getting the neighbours of position with the same color", () => {
    const board = testBoard(
        " B " +
        "WWW" +
        " B ",
    );
    expect(board.neighboursOfSameColor(board.toIndex({ col: 1, row: 1 })).map(board.toPos)).toMatchSnapshot();
});

test("placing a token", () => {
    const board = testBoard(
        "BW   " +
        "BWWW " +
        "BW W " +
        "BWWW " +
        "B    ",
    );
    (board as any).id = "some-id";
    board.prisonersBlack = 0;
    board.prisonersWhite = 0;
    board.created = new Date("2017-11-15 12:00:00");
    board.updated = new Date("2017-11-15 12:00:00");
    board.turn = 5;

    const newBoard = board.place(board.toIndex({ col: 1, row: 4 }));
    expect(newBoard).toMatchSnapshot();
});

test("passing", () => {
    const board = testBoard(
        "BW " +
        "BWW" +
        " W ",
    );
    (board as any).id = "some-id";
    board.created = new Date("2017-11-15 12:00:00");
    board.updated = new Date("2017-11-15 12:00:00");
    board.turn = 5;

    const newBoard = board.pass();
    expect(newBoard).toMatchSnapshot();
});

test("resigning", () => {
    const board = testBoard(
        " W " +
        "WWW" +
        " W ",
    );
    (board as any).id = "some-id";
    board.created = new Date("2017-11-15 12:00:00");
    board.updated = new Date("2017-11-15 12:00:00");
    board.turn = 5;

    const newBoard = board.resign();
    expect(newBoard).toMatchSnapshot();
});

test("placing a token without triggering game logics", () => {
    const board = testBoard(
        "BW   " +
        "BWWW " +
        "BW W " +
        "BWWW " +
        "B    ",
    );
    (board as any).id = "some-id";
    board.prisonersBlack = 0;
    board.prisonersWhite = 0;
    board.created = new Date("2017-11-15 12:00:00");
    board.updated = new Date("2017-11-15 12:00:00");
    board.turn = 5;

    const newBoard = board.mockPlace(board.toIndex({ col: 1, row: 4 }));
    expect(newBoard).toMatchSnapshot();
});

test("getting the prisoners by color", () => {
    const board = testBoard("    ");
    board.prisonersBlack = 1;
    board.prisonersWhite = 2;
    expect(board.prisoners(Color.BLACK)).toEqual(1);
    expect(board.prisoners(Color.WHITE)).toEqual(2);
});
