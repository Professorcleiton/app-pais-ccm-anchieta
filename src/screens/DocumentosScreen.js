import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';

import APIService from '../api/apiService';
import Colors from '../styles/colors';
import Card from '../components/Card';

export default function DocumentosScreen() {
  const route = useRoute();
  const { aluno } = route.params || {};
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [novoDocumento, setNovoDocumento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [solicitando, setSolicitando] = useState(false);

  const loadDocumentos = async () => {
    if (!aluno) { setLoading(false); return; }
    try {
      const data = await APIService.getDocumentos(aluno);
      setDocumentos(data || []);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os documentos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadDocumentos(); }, [aluno]);

  const handleSolicitarDocumento = async () => {
    if (!novoDocumento.trim()) { Alert.alert('Atenção', 'Digite o nome do documento.'); return; }
    setSolicitando(true);
    try {
      const result = await APIService.solicitarDocumento(aluno, novoDocumento.trim(), observacoes.trim());
      if (result.status === 'success') {
        Alert.alert('✅ Sucesso', 'Documento solicitado com sucesso!');
        setModalVisible(false);
        setNovoDocumento('');
        setObservacoes('');
        loadDocumentos();
      } else {
        Alert.alert('Erro', result.message || 'Não foi possível solicitar o documento.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao solicitar o documento.');
    } finally {
      setSolicitando(false);
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.loadingText}>Carregando documentos...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📄 Documentos</Text>
        <Text style={styles.subtitle}>{aluno}</Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.solicitarButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.solicitarButtonText}>+ Solicitar Documento</Text>
        </TouchableOpacity>
      </View>

      {documentos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Nenhum documento encontrado</Text>
          <Text style={styles.emptySubtext}>Solicite um documento clicando no botão acima.</Text>
        </View>
      ) : (
        <FlatList
          data={documentos}
          keyExtractor={(item) => item.id || Math.random().toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadDocumentos} />}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTipo}>{item.tipo || 'Documento'}</Text>
                <Text style={styles.cardData}>{item.data || 'Data não informada'}</Text>
              </View>
              <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Enviado' ? '#4CAF50' : item.status === 'Solicitado' ? '#FF9800' : '#9E9E9E' }]}>
                  <Text style={styles.statusText}>{item.status || 'Pendente'}</Text>
                </View>
              </View>
              {item.observacoes && <Text style={styles.observacoes}>📝 {item.observacoes}</Text>}
            </Card>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal de Solicitação */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📄 Solicitar Documento</Text>
            <Text style={styles.modalSubtitle}>Preencha os dados para solicitar um documento para {aluno}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Documento</Text>
              <TextInput style={styles.input} placeholder="Ex: Histórico Escolar, Declaração..." placeholderTextColor="#999" value={novoDocumento} onChangeText={setNovoDocumento} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Observações (opcional)</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Informações adicionais..." placeholderTextColor="#999" value={observacoes} onChangeText={setObservacoes} multiline numberOfLines={3} textAlignVertical="top" />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalButtonText, { color: '#333' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={handleSolicitarDocumento} disabled={solicitando}>
                {solicitando ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalButtonText}>Solicitar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  actionContainer: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  solicitarButton: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  solicitarButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
  listContent: { padding: 16 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTipo: { fontSize: 15, fontWeight: '600', color: '#333' },
  cardData: { fontSize: 12, color: '#999' },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-start', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '500' },
  observacoes: { fontSize: 12, color: '#666', marginTop: 6, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#333' },
  textArea: { minHeight: 80 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 8 },
  modalButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' },
  modalButtonCancel: { backgroundColor: '#e0e0e0' },
  modalButtonConfirm: { backgroundColor: Colors.primary },
  modalButtonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});