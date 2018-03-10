import { observable, computed, action } from "mobx";
import { bindAll } from "lodash-decorators";
import { component, initialize } from "tsdi";

import { breakpointL } from "../breakpoints";

@component
@bindAll()
export class SidebarStore {
    @observable public visibilityToggled = false;
    @observable public alwaysOpen = this.calculateAlwaysOpen();

    private calculateAlwaysOpen() {
        return window.innerWidth >= breakpointL;
    }

    private onWindowResize() {
        this.alwaysOpen = this.calculateAlwaysOpen();
    }

    @initialize public init() {
        window.addEventListener("resize", this.onWindowResize);
    }

    @computed public get visible() {
        return this.visibilityToggled || this.alwaysOpen;
    }

    @action public toggleVisibility() {
        this.visibilityToggled = ! this.visibilityToggled;
    }
}
