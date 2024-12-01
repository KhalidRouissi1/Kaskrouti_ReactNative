import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber/native";
import { StatusBar } from "expo-status-bar";
import { Suspense } from "react";
import { BottomUI } from "../components/BottomUI";
import { Sandwich } from "../components/Sandwich";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSandwich } from "../hooks/useSandwich";

export const MainScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const order = route.params?.order;
  const resetToBread = useSandwich((state) => state.resetToBread);
  const addIngredient = useSandwich((state) => state.addIngredient);

  useEffect(() => {
    resetToBread();

    if (order?.items?.length) {
      // Add ingredients from the order
      order.items.forEach((ingredient) => {
        if (ingredient !== "bread") {
          addIngredient(ingredient);
        }
      });
    }
  }, [order, addIngredient, resetToBread]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Canvas
        style={styles.canvas}
        camera={{ position: [-2, 2.5, 5], fov: 30 }}
      >
        <color attach="background" args={["#512DA8"]} />
        <Suspense fallback={<Text style={styles.loadingText}>Loading...</Text>}>
          <Sandwich ingredients={order?.items || []} />
        </Suspense>
      </Canvas>

      <BottomUI />
      <StatusBar style="auto" />

      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    width: "100%",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#512DA8",
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
});
