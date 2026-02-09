import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext.js';
import OrdersScreen from '../screens/OrdersScreen.js';
import OrderDetailsScreen from '../screens/OrderDetailsScreen.js';

const Stack = createNativeStackNavigator();

const OrderStackNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: theme.text,
        },
        headerTintColor: theme.primary,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'Orders',
        }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{
          title: 'Order Details',
        }}
      />
    </Stack.Navigator>
  );
};

export default OrderStackNavigator;
