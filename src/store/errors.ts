import { observable, computed, action } from "mobx";
import { bind } from "bind-decorator";
import { component, inject, initialize } from "tsdi";

interface ApiError {
    message: string;
}

@component
export class ErrorStore {
    @observable public errors: ApiError[] = [];

    @bind @action
    public dismiss() {
        this.errors.pop();
    }

    @computed
    public get latestError() {
        return this.errors[this.errors.length - 1];
    }
}
