import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';

import APIService from '../api/apiService';
import Colors from '../styles/colors';
import Card from '../components/Card';

export default function OcorrenciasScreen() {
  const route = useRoute();
  const { aluno } = route.params || {};
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('todos');

  const loadOcorrencias = async () => {
    if (!aluno) { setLoading(false); return; }
    try {
      const data = await APIService.getOcorrencias(aluno);
      setOcorrencias(data || []);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as ocorrências.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadOcorrencias(); }, [aluno]);

  const filteredOcorrencias = filter === 'todos' ? ocorrencias : ocorrencias.filter(o => o.status === filter);

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.loadingText}>Carregando ocorrências...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Ocorrências</Text>
        <Text style={styles.subtitle}>{aluno}</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterButton, filter === 'todos' && styles.filterActive]} onPress={() => setFilter('todos')}>
          <Text style={[styles.filterText, filter === 'todos' && styles.filterTextActive]}>Todos ({ocorrencias.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, filter === 'Pendente' && styles.filterActive]} onPress={() => setFilter('Pendente')}>
          <Text style={[styles.filterText, filter === 'Pendente' && styles.filterTextActive]}>Pendentes ({ocorrencias.filter(o => o.status === 'Pendente').length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, filter === 'Emitido' && styles.filterActive]} onPress={() => setFilter('Emitido')}>
          <Text style={[styles.filterText, filter === 'Emitido' && styles.filterTextActive]}>Emitidos ({ocorrencias.filter(o => o.status === 'Emitido').length})</Text>
        </TouchableOpacity>
      </View>

      {filteredOcorrencias.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Nenhuma ocorrência encontrada</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOcorrencias}
          keyExtractor={(item) => item.id || Math.random().toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadOcorrencias} />}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTipo}>{item.tipo || 'Ocorrência'}</Text>
                <Text style={styles.cardData}>{item.data || 'Data não informada'}</Text>
              </View>
              <Text style={styles.cardDesc}>{item.descricao || 'Sem descrição'}</Text>
              <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Emitido' ? '#4CAF50' : item.status === 'Pendente' ? '#FF9800' : '#9E9E9E' }]}>
                  <Text style={styles.statusText}>{item.status || 'Pendente'}</Text>
                </View>
                {item.protocolo && <Text style={styles.protocolo}>Protocolo: {item.protocolo}</Text>}
              </View>
            </Card>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  header: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  filterContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterButton: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginRight: 8, backgroundColor: '#f0f0f0' },
  filterActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 12, color: '#666', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  listContent: { padding: 16 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTipo: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardData: { fontSize: 12, color: '#999' },
  cardDesc: { fontSize: 14, color: '#555', marginBottom: 8, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '500' },
  protocolo: { fontSize: 11, color: '#999' },
});