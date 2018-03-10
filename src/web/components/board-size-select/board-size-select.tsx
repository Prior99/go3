import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed, action } from "mobx";
import { inject, external } from "tsdi";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import { bindAll } from "lodash-decorators";

import { boardSizes, formatBoardSize, User } from "../../../common";

export interface BoardSizeSelectProps {
    readonly size?: number;
    readonly onChange?: (boardSize: number) => void;
}

@external @observer
@bindAll()
export class BoardSizeSelect extends React.Component<BoardSizeSelectProps> {
    @action private handleSizeChange(_, { value }: DropdownProps) {
        const { onChange } = this.props;
        if (!onChange) { return; }
        onChange(value as number);
    }

    private get boardSizeOptions() {
        return boardSizes.map(size => ({
            text: formatBoardSize(size),
            value: size,
        }));
    }

    public render() {
        return (
            <Dropdown
                placeholder="Board size"
                value={this.props.size}
                onChange={this.handleSizeChange}
                selection
                options={this.boardSizeOptions}
            />
        );
    }
}
