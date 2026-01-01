/**
 * Testes para Connection Status Module
 */

import { describe, it, before, after } from './test-framework.js';
import { getDetailedStatus, healthCheck } from '../../src/firebase/connection-status.js';

describe('Connection Status Module', () => {
  
  it('deve retornar status detalhado', async () => {
    const status = await getDetailedStatus();
    
    assert(status !== null, 'Status não deve ser null');
    assert(typeof status === 'object', 'Status deve ser um objeto');
    assert('connected' in status, 'Status deve ter campo connected');
    assert('mode' in status, 'Status deve ter campo mode');
    assert('services' in status, 'Status deve ter campo services');
    assert('timestamp' in status, 'Status deve ter campo timestamp');
  });

  it('deve ter estrutura de services correta', async () => {
    const status = await getDetailedStatus();
    
    assert('firestore' in status.services, 'Deve ter serviço firestore');
    assert('auth' in status.services, 'Deve ter serviço auth');
    assert('storage' in status.services, 'Deve ter serviço storage');
    assert('functions' in status.services, 'Deve ter serviço functions');
    
    // Cada serviço deve ter available e error
    Object.values(status.services).forEach(service => {
      assert('available' in service, 'Serviço deve ter campo available');
      assert('error' in service, 'Serviço deve ter campo error');
    });
  });

  it('deve retornar health check', async () => {
    const isHealthy = await healthCheck();
    
    assert(typeof isHealthy === 'boolean', 'Health check deve retornar boolean');
  });

  it('deve ter timestamp válido', async () => {
    const status = await getDetailedStatus();
    
    assert(status.timestamp !== null, 'Timestamp não deve ser null');
    assert(typeof status.timestamp === 'string', 'Timestamp deve ser string');
    
    // Verificar se é uma data válida
    const date = new Date(status.timestamp);
    assert(!isNaN(date.getTime()), 'Timestamp deve ser uma data válida');
  });

  it('deve ter modo correto (emulators ou production)', async () => {
    const status = await getDetailedStatus();
    
    assert(status.mode === 'emulators' || status.mode === 'production', 
           'Modo deve ser emulators ou production');
  });

});

// Helper functions
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

