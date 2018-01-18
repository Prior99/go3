import { testBoard } from "./utils";
import { Group } from "..";

test("calculating the freedoms", () => {
    const board = testBoard(
        " B  " +
        " BWB" +
        " WWB" +
        "    ",
    );
    expect(board.groupAt(board.toIndex({ col: 2, row: 1 })).freedoms).toEqual(4);
});

test("calculating the neighbours", () => {
    const board = testBoard(
        " B  " +
        " BWB" +
        " WWB" +
        "    ",
    );
    expect(board.groupAt(board.toIndex({ col: 2, row: 1 })).neighbours.map(board.toPos)).toMatchSnapshot();
});

test("calculating the neighbouring groups", () => {
    const board = testBoard(
        " B  " +
        " BWB" +
        " WWB" +
        "    ",
    );
    expect(
        board
            .groupAt(board.toIndex({ col: 2, row: 1 }))
            .neighbouringGroups.map(group => group.indices.map(board.toPos)),
    ).toMatchSnapshot();
});

test("the size of a group", () => {
    const board = testBoard(
        " B  " +
        " BWB" +
        " WWB" +
        "    ",
    );
    expect(board.groupAt(board.toIndex({ col: 2, row: 1 })).size).toEqual(3);
});

test("checking if a group is the eye of another group", () => {
    const board = testBoard(
        " B B" +
        " BBB" +
        " W  " +
        "    ",
    );
    const group = board.groupAt(board.toIndex({ col: 1, row: 0 }));
    const eye = board.groupAt(board.toIndex({ col: 2, row: 0 }));
    expect(eye.isEyeOf(group)).toBe(true);
});

test("checking if a group is equal to another group", () => {
    const board = testBoard(
        " B B" +
        " BBB" +
        " W  " +
        " WW ",
    );
    const group1a = board.groupAt(board.toIndex({ col: 1, row: 0 }));
    const group1b = board.groupAt(board.toIndex({ col: 3, row: 0 }));
    const group1c = board.groupAt(board.toIndex({ col: 1, row: 1 }));
    const group2 = board.groupAt(board.toIndex({ col: 1, row: 3 }));
    expect(group1a.equals(group1b)).toBe(true);
    expect(group1b.equals(group1c)).toBe(true);
    expect(group1c.equals(group1a)).toBe(true);
    expect(group1a.equals(group2)).toBe(false);
    expect(group1b.equals(group2)).toBe(false);
    expect(group1c.equals(group2)).toBe(false);
});

test("getting the eyes of a group", () => {
    const board = testBoard(
        "WWWW" +
        "W W " +
        "WWWW" +
        "  W ",
    );
    expect(
        board
            .groupAt(board.toIndex({ col: 0, row: 0 })).eyes
            .map(group => group.indices.map(board.toPos)),
    ).toMatchSnapshot();
});
