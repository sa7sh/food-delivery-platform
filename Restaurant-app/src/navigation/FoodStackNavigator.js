import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext.js';
import FoodItemsScreen from '../screens/FoodItemsScreen.js';
import AddFoodScreen from '../screens/AddFoodScreen.js';
import EditFoodScreen from '../screens/EditFoodScreen.js';

const Stack = createNativeStackNavigator();

const FoodStackNavigator = () => {
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
        name="FoodItems"
        component={FoodItemsScreen}
        options={{
          title: 'Food Items',
        }}
      />
      <Stack.Screen
        name="AddFood"
        component={AddFoodScreen}
        options={{
          title: 'Add Food Item',
        }}
      />
      <Stack.Screen
        name="EditFood"
        component={EditFoodScreen}
        options={{
          title: 'Edit Food Item',
        }}
      />
    </Stack.Navigator>
  );
};

export default FoodStackNavigator;
