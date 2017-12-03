import { inject, component } from "tsdi";
import { Validation } from "controllers";

@component
export class Context {
    @inject public validation: Validation;
}
