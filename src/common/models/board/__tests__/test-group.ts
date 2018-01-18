import { testBoard } from "./utils";

test("Detects a hole", () => {
    const board = testBoard(
        "WWWW" +
        "W  W" +
        "W  W" +
        "WWWW",
    );
    expect(board.groupAt(0).eyes).toMatchSnapshot();
});
