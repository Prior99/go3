import { observable, computed, action } from "mobx";
import { bindAll } from "lodash-decorators";
import { component, inject, initialize } from "tsdi";

interface ApiError {
    message: string;
}

@bindAll()
@component
export class ErrorStore {
    @observable public errors: ApiError[] = [];

    @action public report(error: ApiError) {
        if (this.errors.find(other => other.message === error.message)) {
            return;
        }
        this.errors.push(error);
    }

    @action public dismiss() {
        this.errors.pop();
    }

    @computed
    public get latestError() {
        return this.errors[this.errors.length - 1];
    }
}
