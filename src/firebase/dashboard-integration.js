/**
 * Dashboard Integration with Firestore
 * Integra o dashboard web com Firestore para atualizações em tempo real
 */

import { db } from './connection.js';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  limit,
  where,
  Timestamp
} from 'firebase/firestore';

/**
 * Classe para gerenciar atualizações em tempo real do dashboard
 */
export class DashboardFirestoreIntegration {
  constructor() {
    this.unsubscribes = [];
    this.listeners = new Map();
  }

  /**
   * Escuta atualizações do backlog em tempo real
   */
  subscribeToBacklog(callback) {
    const backlogRef = doc(collection(db, 'backlog'), 'current');
    
    const unsubscribe = onSnapshot(backlogRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Erro ao escutar backlog:', error);
      callback(null);
    });
    
    this.unsubscribes.push(unsubscribe);
    this.listeners.set('backlog', unsubscribe);
    
    return unsubscribe;
  }

  /**
   * Escuta resultados de agentes em tempo real
   */
  subscribeToAgentResults(agentName, callback, maxResults = 10) {
    const resultsRef = collection(db, 'results');
    const q = query(
      resultsRef,
      where('agent', '==', agentName),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(results);
    }, (error) => {
      console.error(`Erro ao escutar resultados do ${agentName}:`, error);
      callback([]);
    });
    
    this.unsubscribes.push(unsubscribe);
    this.listeners.set(`results-${agentName}`, unsubscribe);
    
    return unsubscribe;
  }

  /**
   * Escuta todas as avaliações em tempo real
   */
  subscribeToEvaluations(callback, maxResults = 20) {
    const evaluationsRef = collection(db, 'evaluations');
    const q = query(
      evaluationsRef,
      orderBy('migratedAt', 'desc'),
      limit(maxResults)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const evaluations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(evaluations);
    }, (error) => {
      console.error('Erro ao escutar avaliações:', error);
      callback([]);
    });
    
    this.unsubscribes.push(unsubscribe);
    this.listeners.set('evaluations', unsubscribe);
    
    return unsubscribe;
  }

  /**
   * Escuta decisões Go/No-go em tempo real
   */
  subscribeToDecisions(callback, maxResults = 10) {
    const decisionsRef = collection(db, 'decisions');
    const q = query(
      decisionsRef,
      orderBy('migratedAt', 'desc'),
      limit(maxResults)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const decisions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(decisions);
    }, (error) => {
      console.error('Erro ao escutar decisões:', error);
      callback([]);
    });
    
    this.unsubscribes.push(unsubscribe);
    this.listeners.set('decisions', unsubscribe);
    
    return unsubscribe;
  }

  /**
   * Escuta histórico de execuções do workflow
   */
  subscribeToWorkflowHistory(callback, maxResults = 50) {
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('type', '==', 'workflow-execution'),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(events);
    }, (error) => {
      console.error('Erro ao escutar histórico:', error);
      callback([]);
    });
    
    this.unsubscribes.push(unsubscribe);
    this.listeners.set('workflow-history', unsubscribe);
    
    return unsubscribe;
  }

  /**
   * Para todas as escutas
   */
  unsubscribeAll() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
    this.unsubscribes = [];
    this.listeners.clear();
  }

  /**
   * Para uma escuta específica
   */
  unsubscribe(listenerKey) {
    const unsubscribe = this.listeners.get(listenerKey);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerKey);
      const index = this.unsubscribes.indexOf(unsubscribe);
      if (index > -1) {
        this.unsubscribes.splice(index, 1);
      }
    }
  }
}

/**
 * Helper para inicializar integração do dashboard
 */
export function initDashboardIntegration() {
  const integration = new DashboardFirestoreIntegration();
  
  console.log('✅ Dashboard Firestore Integration inicializado');
  console.log('   - Atualizações em tempo real ativadas');
  console.log('   - Sincronização entre sessões habilitada');
  
  return integration;
}

/**
 * Helper para salvar evento de execução do workflow
 */
export async function saveWorkflowEvent(eventType, data) {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  
  try {
    const eventsRef = collection(db, 'events');
    await addDoc(eventsRef, {
      type: eventType,
      ...data,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    console.log(`✅ Evento ${eventType} salvo no Firestore`);
  } catch (error) {
    console.error(`❌ Erro ao salvar evento ${eventType}:`, error);
  }
}

