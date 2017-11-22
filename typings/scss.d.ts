declare module "*.scss" {
    // Content cannot be typed as this is a pseudo module declared for every
    // *.scss file in the whole project. It would be a much cleaner solution
    // to write explicit typings for every stylesheet, but this seems a bit
    // overkill for the time being and can easily be added later on, so for
    // now there will be no typings for CSS classes.
    const content: any;
    export = content;
}
