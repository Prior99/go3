import * as React from "react";
import { requireLogin } from "..";
import { createRenderer, ShallowRenderer } from "react-test-renderer/shallow";
import { LoginStore } from "store";
import { Provider } from "mobx-react";

class SomeComponent extends React.PureComponent<{}> {
    public render() {
        return (
            <div>Some Component</div>
        );
    }
}

let DecoratedComponent: React.ComponentClass<{}>;
let renderer: ShallowRenderer;

beforeEach(() => {
    renderer = createRenderer();
    DecoratedComponent = requireLogin(SomeComponent);
});

test("`requireLogin()` redirects to the `login()` route if not logged in", () => {
    const current = renderer.render(<DecoratedComponent />);
    expect(current).toMatchSnapshot();
});

test("`requireLogin()` does not redirect if logged in", () => {
    const apiStore = tsdi.get(LoginStore);
    apiStore.authToken = "some-auth-token";
    const current = renderer.render(<DecoratedComponent />);
    expect(current).toMatchSnapshot();
});
