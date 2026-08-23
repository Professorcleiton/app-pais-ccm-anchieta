import React from 'react'; 
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'; 
import Colors from '../styles/colors'; 
 
export default function Loading({ message = 'Carregando...' }) { 
  return ( 
    <View style={styles.container}> 
      <ActivityIndicator size="large" color={Colors.primary} /> 
      <Text style={styles.text}>{message}</Text> 
    </View> 
  ); 
} 
 
const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5', 
  }, 
  text: { 
    marginTop: 12, 
    fontSize: 14, 
    color: '#666', 
  }, 
}); 
