import { AppRegistry } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { name as appName } from "./app.json";
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterScreen } from "./screens/RegisterScreen";
import { MainScreen } from "./screens/MainScreen";
import { OrdersScreen } from "./screens/OrderScreen";
import { LogBox } from "react-native";

// Suppress specific warnings
LogBox.ignoreLogs([
  "WeakMap key must be an Object",
  "Cannot read property 'trim' of undefined", // Add the trim error here
]);

// Suppress specific errors in the console
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      args[0].includes("WeakMap key must be an Object") ||
      args[0].includes("Cannot read property 'trim' of undefined")
    ) {
      return; // Ignore these specific errors
    }
    originalConsoleError(...args); // Otherwise, log it
  };
}

const Stack = createNativeStackNavigator();

AppRegistry.registerComponent(appName, () => App);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Orders"
          component={OrdersScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
