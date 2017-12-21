import * as React from "react";
import { View, Text, AppRegistry } from "react-native";

export default class Go3 extends React.Component { // tslint:disable-line
    public render() {
        return (
            <View>
                <Text>Go3 hello world.</Text>
            </View>
        );
    }
}

AppRegistry.registerComponent("main", () => Go3);
