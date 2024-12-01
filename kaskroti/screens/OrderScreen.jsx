import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native"; // Add useRoute hook
import axios from "axios"; // Import Axios

export const OrdersScreen = () => {
  const [orders, setOrders] = useState([]); // Initial state is an empty array
  const navigation = useNavigation();
  const route = useRoute(); // Destructure route to get params

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://192.168.128.1:5000/api/sandwiches"
        );
        setOrders(response.data); // Set the orders state with the fetched data
      } catch (error) {
        console.error("Error fetching orders:", error);
        Alert.alert("Error", "Failed to fetch orders");
      }
    };

    // Fetch orders again if the 'refresh' param is set to true
    if (route.params?.refresh) {
      fetchOrders();
    } else {
      fetchOrders(); // Initial fetch when component mounts
    }
  }, [route.params?.refresh]); // Dependency on route.params.refresh

  const handleNewOrder = () => {
    navigation.navigate("Main");
  };

  const handleOrderClick = (order) => {
    navigation.navigate("Main", { order });
  };

  const handleCancel = (orderId, event) => {
    event.stopPropagation();
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => {
          setOrders(
            orders.map((order) =>
              order.id === orderId ? { ...order, status: "Cancelled" } : order
            )
          );
        },
      },
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#4CAF50";
      case "In Progress":
        return "#2196F3";
      case "Cancelled":
        return "#F44336";
      case "Created":
        return "#FF9800"; // New status color for "Created"
      default:
        return "#757575";
    }
  };

  const OrderCard = ({ order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderClick(order)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderDate}>{order.date}</Text>
        <Text
          style={[styles.orderStatus, { color: getStatusColor(order.status) }]}
        >
          {order.status}
        </Text>
      </View>
      <Text style={styles.orderItems}>{order.items.join(", ")}</Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: ${order.total.toFixed(2)}</Text>
        {order.status === "In Progress" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={(e) => handleCancel(order.id, e)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <ScrollView style={styles.ordersContainer}>
        {orders.length > 0 ? (
          orders.map((order, index) => <OrderCard key={index} order={order} />)
        ) : (
          <Text>No orders found.</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleNewOrder}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    padding: 20,
    backgroundColor: "#512DA8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  ordersContainer: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: "600",
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  orderItems: {
    color: "#666",
    marginBottom: 8,
    flexWrap: "wrap", // Ensure wrapping for long item names
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#F44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7C4DFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
});
