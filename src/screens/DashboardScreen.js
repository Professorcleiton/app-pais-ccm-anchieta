import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import APIService from '../api/apiService';
import Colors from '../styles/colors';
import Card from '../components/Card';
import Loading from '../components/Loading';

export default function DashboardScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState(null);

  const loadData = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('@user_data');
      if (userDataStr) {
        const data = JSON.parse(userDataStr);
        setUserData(data);
        
        const alunosData = [];
        for (const nome of data.alunos || []) {
          const info = await APIService.getAlunoInfo(nome);
          alunosData.push(info);
        }
        setAlunos(alunosData);
        if (alunosData.length > 0) setSelectedAluno(alunosData[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => {
        await AsyncStorage.multiRemove(['@is_logged_in', '@user_data', '@alunos_data']);
        navigation.replace('Login');
      }}
    ]);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  if (loading) return <Loading message="Carregando seus dados..." />;

  if (!userData || alunos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyTitle}>Nenhum aluno vinculado</Text>
        <Text style={styles.emptyText}>Entre em contato com a secretaria para vincular seus filhos.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {userData.nome} 👋</Text>
          <Text style={styles.subGreeting}>Acompanhe a vida escolar dos seus filhos</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {alunos.length > 1 && (
        <ScrollView horizontal style={styles.alunosScroll} showsHorizontalScrollIndicator={false}>
          {alunos.map((aluno, index) => (
            <TouchableOpacity key={index} style={[styles.alunoTab, selectedAluno?.nome === aluno.nome && styles.alunoTabActive]} onPress={() => setSelectedAluno(aluno)}>
              <Text style={[styles.alunoTabText, selectedAluno?.nome === aluno.nome && styles.alunoTabTextActive]}>
                {aluno.nome.split(' ').slice(0, 2).join(' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {selectedAluno && (
        <>
          <Card style={styles.alunoCard}>
            <View style={styles.alunoHeader}>
              <View>
                <Text style={styles.alunoNome}>{selectedAluno.nome}</Text>
                <Text style={styles.alunoTurma}>Turma: {selectedAluno.turma}</Text>
              </View>
              <View style={styles.alunoStatus}><Text style={styles.alunoStatusText}>Ativo</Text></View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{selectedAluno.totalOcorrencias}</Text>
                <Text style={styles.statLabel}>Ocorrências</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{selectedAluno.pendentesDocumentos}</Text>
                <Text style={styles.statLabel}>Docs. Pendentes</Text>
              </View>
            </View>
          </Card>

          <View style={styles.menuGrid}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Ocorrencias', { aluno: selectedAluno.nome })}>
              <Text style={styles.menuIcon}>📋</Text>
              <Text style={styles.menuLabel}>Ocorrências</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Documentos', { aluno: selectedAluno.nome })}>
              <Text style={styles.menuIcon}>📄</Text>
              <Text style={styles.menuLabel}>Documentos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}>
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={styles.menuLabel}>Boletim</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}>
              <Text style={styles.menuIcon}>📅</Text>
              <Text style={styles.menuLabel}>Calendário</Text>
            </TouchableOpacity>
          </View>

          {selectedAluno.ocorrencias && selectedAluno.ocorrencias.length > 0 && (
            <Card style={styles.ocorrenciasCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>📋 Últimas Ocorrências</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Ocorrencias', { aluno: selectedAluno.nome })}>
                  <Text style={styles.seeAll}>Ver todas</Text>
                </TouchableOpacity>
              </View>
              {selectedAluno.ocorrencias.slice(0, 3).map((ocorrencia, index) => (
                <View key={index} style={styles.ocorrenciaItem}>
                  <View style={styles.ocorrenciaHeader}>
                    <Text style={styles.ocorrenciaTipo}>{ocorrencia.tipo}</Text>
                    <Text style={styles.ocorrenciaData}>{ocorrencia.data}</Text>
                  </View>
                  <Text style={styles.ocorrenciaDesc} numberOfLines={2}>{ocorrencia.descricao}</Text>
                  <View style={styles.ocorrenciaStatus}>
                    <Text style={[styles.statusBadge, ocorrencia.status === 'Emitido' ? styles.statusEmitido : ocorrencia.status === 'Pendente' ? styles.statusPendente : styles.statusArquivado]}>
                      {ocorrencia.status || 'Pendente'}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#f5f5f5' },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  logoutButton: { backgroundColor: Colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  subGreeting: { fontSize: 14, color: '#666', marginTop: 2 },
  logoutIcon: { fontSize: 24 },
  alunosScroll: { paddingHorizontal: 16, marginBottom: 12 },
  alunoTab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: '#e8ecf1' },
  alunoTabActive: { backgroundColor: Colors.primary },
  alunoTabText: { fontSize: 14, fontWeight: '500', color: '#555' },
  alunoTabTextActive: { color: '#fff' },
  alunoCard: { marginHorizontal: 16, marginBottom: 16 },
  alunoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  alunoNome: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  alunoTurma: { fontSize: 14, color: '#666', marginTop: 2 },
  alunoStatus: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  alunoStatusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },
  statLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#eee' },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 16 },
  menuItem: { width: '25%', alignItems: 'center', paddingVertical: 12 },
  menuIcon: { fontSize: 28, marginBottom: 4 },
  menuLabel: { fontSize: 11, color: '#555', textAlign: 'center' },
  ocorrenciasCard: { marginHorizontal: 16, marginBottom: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  ocorrenciaItem: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingVertical: 10 },
  ocorrenciaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  ocorrenciaTipo: { fontSize: 14, fontWeight: '600', color: '#333' },
  ocorrenciaData: { fontSize: 12, color: '#999' },
  ocorrenciaDesc: { fontSize: 13, color: '#555', marginBottom: 4 },
  ocorrenciaStatus: { flexDirection: 'row', justifyContent: 'flex-end' },
  statusBadge: { fontSize: 11, fontWeight: '500', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12, overflow: 'hidden' },
  statusEmitido: { backgroundColor: '#4CAF50', color: '#fff' },
  statusPendente: { backgroundColor: '#FF9800', color: '#fff' },
  statusArquivado: { backgroundColor: '#9E9E9E', color: '#fff' },
});