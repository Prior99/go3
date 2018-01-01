import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { bind } from "bind-decorator";

import { Board, Color } from "../../../common";
import { GamesStore, drawBoard } from "../../../common-ui";
import * as css from "./preview-board.scss";

export interface PreviewBoardProps {
    readonly board: Board;
}

@external @observer
export class PreviewBoard extends React.Component<PreviewBoardProps> {
    private canvas: HTMLCanvasElement;

    @bind private handleCanvasRef(element: HTMLCanvasElement) {
        this.canvas = element;
    }

    public componentDidMount() {
        this.renderBoard();
    }

    public componentWillUpdate() {
        this.renderBoard();
    }

    @bind private renderBoard() {
        if (!this.canvas) {
            return;
        }
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        drawBoard(this.canvas, this.props.board);
    }

    public render() {
        const { board } = this.props;
        return (
            <canvas className={css.canvas} ref={this.handleCanvasRef} />
        );
    }
}
