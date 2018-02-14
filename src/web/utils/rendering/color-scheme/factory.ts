import { component, factory } from "tsdi";

import { ColorScheme } from "./color-scheme";
import { defaultColorScheme } from "./default";

@component
export class ColorSchemeFactory {
    @factory
    public getColorScheme(): ColorScheme {
        return defaultColorScheme;
    }
}
