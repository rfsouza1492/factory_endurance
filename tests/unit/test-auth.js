#!/usr/bin/env node
/**
 * Teste Unitário: Authentication Middleware
 * Testa middleware de autenticação
 */

import { requireAuth, requireAdmin, optionalAuth } from '../../src/middleware/auth.js';

console.log('🧪 Teste Unitário: Authentication Middleware\n');

// Configurar API keys para teste ANTES de importar o módulo
// O módulo lê as variáveis de ambiente na inicialização
process.env.API_KEYS = 'test-key-1,test-key-2,admin-key';
process.env.ADMIN_USERS = 'admin-key';

let passedTests = 0;
let failedTests = 0;

function runTest(name, testFunction) {
  try {
    console.log(`📋 Executando: ${name}`);
    testFunction();
    console.log(`  ✅ ${name} passou\n`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ ${name} falhou: ${error.message}\n`);
    failedTests++;
  }
}

// Mock de request/response
function createMockReqRes(headers = {}) {
  const req = {
    headers,
    user: null
  };

  const res = {
    statusCode: 200,
    json: function(data) {
      this.body = data;
      return this;
    },
    status: function(code) {
      this.statusCode = code;
      return this;
    }
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, getNextCalled: () => nextCalled };
}

// Teste 1: requireAuth bloqueia sem API key quando configurado
runTest('Teste 1: requireAuth bloqueia requisição sem API key', () => {
  const mock = createMockReqRes();
  requireAuth(mock.req, mock.res, mock.next);

  if (mock.res.statusCode !== 401) {
    throw new Error('Requisição sem API key não foi bloqueada');
  }

  if (mock.getNextCalled()) {
    throw new Error('next() foi chamado mesmo com erro');
  }
});

// Teste 2: requireAuth permite com API key válida
runTest('Teste 2: requireAuth permite requisição com API key válida', () => {
  const mock = createMockReqRes({
    'x-api-key': 'test-key-1'
  });

  requireAuth(mock.req, mock.res, mock.next);

  if (mock.res.statusCode === 401 || mock.res.statusCode === 403) {
    throw new Error('Requisição com API key válida foi bloqueada');
  }

  if (!mock.getNextCalled()) {
    throw new Error('next() não foi chamado');
  }

  if (!mock.req.user) {
    throw new Error('req.user não foi definido');
  }

  if (mock.req.user.apiKey !== 'test-key-1') {
    throw new Error('apiKey no req.user incorreto');
  }
});

// Teste 3: requireAuth aceita Authorization header
runTest('Teste 3: requireAuth aceita Authorization Bearer header', () => {
  const mock = createMockReqRes({
    'authorization': 'Bearer test-key-2'
  });

  requireAuth(mock.req, mock.res, mock.next);

  if (mock.res.statusCode === 401 || mock.res.statusCode === 403) {
    throw new Error('Requisição com Authorization header foi bloqueada');
  }

  if (!mock.req.user || mock.req.user.apiKey !== 'test-key-2') {
    throw new Error('API key do Authorization header não foi processada');
  }
});

// Teste 4: requireAuth bloqueia API key inválida
runTest('Teste 4: requireAuth bloqueia API key inválida', () => {
  const mock = createMockReqRes({
    'x-api-key': 'invalid-key'
  });

  requireAuth(mock.req, mock.res, mock.next);

  if (mock.res.statusCode !== 403) {
    throw new Error('API key inválida não foi bloqueada');
  }

  if (mock.getNextCalled()) {
    throw new Error('next() foi chamado mesmo com API key inválida');
  }
});

// Teste 5: requireAdmin bloqueia usuário não-admin
runTest('Teste 5: requireAdmin bloqueia usuário não-admin', () => {
  const mock = createMockReqRes({
    'x-api-key': 'test-key-1'
  });

  // Primeiro autenticar
  requireAuth(mock.req, mock.res, mock.next);

  // Depois verificar admin
  requireAdmin(mock.req, mock.res, mock.next);

  if (mock.res.statusCode !== 403) {
    throw new Error('Usuário não-admin não foi bloqueado');
  }
});

// Teste 6: requireAdmin permite usuário admin
runTest('Teste 6: requireAdmin permite usuário admin', () => {
  const mock = createMockReqRes({
    'x-api-key': 'admin-key'
  });

  // Primeiro autenticar
  requireAuth(mock.req, mock.res, mock.next);

  // Depois verificar admin
  requireAdmin(mock.req, mock.res, mock.next);

  if (mock.res.statusCode === 403) {
    throw new Error('Usuário admin foi bloqueado');
  }

  if (!mock.req.user.isAdmin) {
    throw new Error('isAdmin não foi definido como true');
  }
});

// Teste 7: optionalAuth não bloqueia se não autenticado
runTest('Teste 7: optionalAuth não bloqueia se não autenticado', () => {
  const mock = createMockReqRes();
  optionalAuth(mock.req, mock.res, mock.next);

  if (mock.res.statusCode === 401 || mock.res.statusCode === 403) {
    throw new Error('optionalAuth bloqueou requisição não autenticada');
  }

  if (!mock.getNextCalled()) {
    throw new Error('next() não foi chamado');
  }
});

// Teste 8: optionalAuth define req.user se autenticado
runTest('Teste 8: optionalAuth define req.user se autenticado', () => {
  const mock = createMockReqRes({
    'x-api-key': 'test-key-1'
  });

  optionalAuth(mock.req, mock.res, mock.next);

  if (!mock.req.user) {
    throw new Error('req.user não foi definido com optionalAuth');
  }

  if (mock.req.user.apiKey !== 'test-key-1') {
    throw new Error('apiKey no req.user incorreto');
  }
});

console.log('='.repeat(50));
console.log(`📊 Resumo: ${passedTests} passaram, ${failedTests} falharam`);
console.log('='.repeat(50));

if (failedTests === 0) {
  console.log('✅ Todos os testes passaram!');
  process.exit(0);
} else {
  console.error('❌ Alguns testes falharam.');
  process.exit(1);
}

