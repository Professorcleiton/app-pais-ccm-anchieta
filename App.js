import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import OcorrenciasScreen from './src/screens/OcorrenciasScreen';
import DocumentosScreen from './src/screens/DocumentosScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen 
          name="Ocorrencias" 
          component={OcorrenciasScreen} 
          options={{ 
            headerShown: true, 
            headerTitle: 'Ocorrências', 
            headerBackTitle: 'Voltar', 
            headerTintColor: '#005088' 
          }} 
        />
        <Stack.Screen 
          name="Documentos" 
          component={DocumentosScreen} 
          options={{ 
            headerShown: true, 
            headerTitle: 'Documentos', 
            headerBackTitle: 'Voltar', 
            headerTintColor: '#005088' 
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}