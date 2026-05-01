import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { LayoutDashboard, Users, UserPlus, Settings } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { useColorScheme } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import ClientListScreen from '../screens/ClientListScreen';
import AddClientScreen from '../screens/AddClientScreen';
import ExportScreen from '../screens/ExportScreen';
import LoginScreen from '../screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? colors.slate[900] : '#fff';
  const activeColor = colors.primary;
  const inactiveColor = colors.slate[400];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 20,
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="Clients" 
        component={ClientListScreen} 
        options={{
          tabBarIcon: ({ color }) => <Users color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="Add" 
        component={AddClientScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <View style={{ 
              backgroundColor: colors.primary, 
              width: 50, 
              height: 50, 
              borderRadius: 15, 
              justifyContent: 'center', 
              alignItems: 'center',
              marginTop: -20,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4
            }}>
              <UserPlus color="#fff" size={26} />
            </View>
          ),
          tabBarLabel: () => null
        }}
      />
      <Tab.Screen 
        name="Export" 
        component={ExportScreen} 
        options={{
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
          tabBarLabel: 'Settings'
        }}
      />
    </Tab.Navigator>
  );
};

// Custom View for the "Add" button in tabs
import { View } from 'react-native';

const AppNavigator = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
