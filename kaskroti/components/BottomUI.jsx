import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { INGREDIENTS, useSandwich } from "../hooks/useSandwich";
import { AwesomeButton } from "./AwesomeButton";
import { useNavigation } from "@react-navigation/native";

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const BottomUI = () => {
  const navigation = useNavigation();

  const addIngredient = useSandwich((state) => state.addIngredient);
  const [addedToCart, setAddedToCart] = useSandwich((state) => [
    state.addedToCart,
    state.setAddedToCart,
  ]);
  const total = useSandwich((state) => state.total);
  const ingredients = useSandwich((state) => state.ingredients);
  const clearIngredients = useSandwich((state) => state.clearIngredients); // Assuming you have a function to clear ingredients

  const handleAddToCart = async () => {
    // Filter out the bread slices and log the middle ingredients
    const middleIngredients = ingredients.slice(1, -1); // Assuming you want to exclude bread or outer ingredients
    const orderItems = middleIngredients.map((ing) => ing.name); // Just get the names of the ingredients

    const orderData = {
      items: orderItems, // The items list that you want to send
      total: total, // Total price of the sandwich
      status: "Created", // Default status of the order (you can update it later)
    };

    console.log("Order data to be sent:", orderData);

    // Send the order data to the server
    try {
      const response = await fetch("http://192.168.128.1:5000/api/sandwich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        console.log("Order sent successfully!");
        setAddedToCart(true);
        clearIngredients();
        navigation.navigate("Orders");
      } else {
        console.error("Failed to send order.");
      }
    } catch (error) {
      console.error("Error sending order:", error);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]}>
      <View
        style={{
          padding: 20,
        }}
      >
        {addedToCart ? (
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "900",
              }}
            >
              Total - ${total.toFixed(2)}
            </Text>
            <Text
              style={{
                color: "#666",
                marginTop: 4,
                marginBottom: 16,
              }}
            >
              Order sent successfully, it will be ready in 5 minutes! Wawa
              Sensei will directly deliver it to your home 🛵
            </Text>
            <AwesomeButton
              title="Start a New Order"
              color="#fff"
              backgroundColor="#7C4DFF"
              bold
              onPress={() => setAddedToCart(false)} // Reset addedToCart to false for a new order
            />
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  flexShrink: 1,
                  fontSize: 22,
                  fontWeight: "900",
                }}
              >
                Kaskrout
              </Text>
              <Text>⭐️⭐️⭐️⭐️⭐️</Text>
            </View>
            <Text
              style={{
                color: "#666",
              }}
            >
              Fresh and delicious sandwiches made with love
            </Text>
            <View
              style={{
                height: 1,
                backgroundColor: "#ececec",
                marginVertical: 20,
              }}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "900",
                textAlign: "center",
              }}
            >
              Your Creation ($5.00)
            </Text>
            <Text
              style={{
                textAlign: "center",
                color: "#666",
              }}
            >
              Compose your sandwich by adding ingredients
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{
                marginTop: 8,
                marginBottom: 8,
                marginLeft: -20,
                marginRight: -20,
              }}
            >
              {Object.keys(INGREDIENTS).map((ingredient) => (
                <View
                  key={ingredient}
                  style={{
                    padding: 10,
                  }}
                >
                  <AwesomeButton
                    title={
                      `${INGREDIENTS[ingredient]?.icon || ""} ` +
                      `${capitalizeFirstLetter(ingredient)} (+$${
                        INGREDIENTS[ingredient]?.total?.toFixed(2) || "0.00"
                      })`
                    }
                    onPress={() => addIngredient(ingredient)}
                  />
                </View>
              ))}
            </ScrollView>
            <AwesomeButton
              title={`Add to cart ($${total.toFixed(2)})`}
              color="#fff"
              backgroundColor="#7C4DFF"
              bold
              onPress={handleAddToCart}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};
