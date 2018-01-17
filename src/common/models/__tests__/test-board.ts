import { Board } from "..";
import { Color } from "../../utils";

function testBoard(test: string): Board {
    const state = [];
    for (let i = 0; i < test.length; ++i) {
        const character = test.charAt(i);
        const color =
            character === "W" ? Color.WHITE :
            character === "B" ? Color.BLACK :
            Color.EMPTY;
        state.push(color);
    }
    const board = new Board();
    board.state = state;
    return board;
}

test("Detects a hole", () => {
    const board = testBoard(
        "WWWW" +
        "W  W" +
        "W  W" +
        "WWWW",
    );
    expect(board.getEyeGroups(board.groupAt(0))).toMatchSnapshot();
});
