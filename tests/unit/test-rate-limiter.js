#!/usr/bin/env node
/**
 * Teste Unitário: Rate Limiter
 * Testa middleware de rate limiting
 */

import { rateLimiter, criticalRateLimiter, workflowRateLimiter } from '../../src/middleware/rate-limiter.js';

console.log('🧪 Teste Unitário: Rate Limiter\n');

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
function createMockReqRes(ip = '127.0.0.1', path = '/api/test') {
  const req = {
    ip,
    path,
    connection: { remoteAddress: ip },
    headers: {}
  };

  const res = {
    statusCode: 200,
    headers: {},
    setHeader: function(key, value) {
      this.headers[key] = value;
    },
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

// Teste 1: Rate limiter básico
runTest('Teste 1: Rate limiter permite requisições dentro do limite', () => {
  const middleware = rateLimiter({ max: 5, window: 60000 });
  const { req, res, next } = createMockReqRes();

  // Primeiras 5 requisições devem passar
  for (let i = 0; i < 5; i++) {
    const mock = createMockReqRes();
    middleware(mock.req, mock.res, mock.next);
    
    if (mock.res.statusCode === 429) {
      throw new Error(`Requisição ${i + 1} foi bloqueada incorretamente`);
    }
    
    if (!mock.getNextCalled()) {
      throw new Error(`next() não foi chamado na requisição ${i + 1}`);
    }
  }
});

// Teste 2: Rate limiter bloqueia após limite
runTest('Teste 2: Rate limiter bloqueia após exceder limite', () => {
  const middleware = rateLimiter({ max: 3, window: 60000 });
  const { req, res, next } = createMockReqRes();

  // Primeiras 3 requisições devem passar
  for (let i = 0; i < 3; i++) {
    const mock = createMockReqRes();
    middleware(mock.req, mock.res, mock.next);
  }

  // 4ª requisição deve ser bloqueada
  const mock4 = createMockReqRes();
  middleware(mock4.req, mock4.res, mock4.next);

  if (mock4.res.statusCode !== 429) {
    throw new Error('Requisição não foi bloqueada após exceder limite');
  }

  if (!mock4.res.body || !mock4.res.body.error) {
    throw new Error('Resposta de erro não contém mensagem');
  }
});

// Teste 3: Headers informativos
runTest('Teste 3: Rate limiter adiciona headers informativos', () => {
  const middleware = rateLimiter({ max: 10, window: 60000 });
  const mock = createMockReqRes();
  
  middleware(mock.req, mock.res, mock.next);

  if (!mock.res.headers['X-RateLimit-Limit']) {
    throw new Error('Header X-RateLimit-Limit não foi adicionado');
  }

  if (!mock.res.headers['X-RateLimit-Remaining']) {
    throw new Error('Header X-RateLimit-Remaining não foi adicionado');
  }

  if (!mock.res.headers['X-RateLimit-Reset']) {
    throw new Error('Header X-RateLimit-Reset não foi adicionado');
  }

  if (parseInt(mock.res.headers['X-RateLimit-Limit']) !== 10) {
    throw new Error('X-RateLimit-Limit incorreto');
  }
});

// Teste 4: Rate limiter por IP
runTest('Teste 4: Rate limiter isola contadores por IP', () => {
  const middleware = rateLimiter({ max: 2, window: 60000 });

  // IP 1: 2 requisições (deve passar)
  const mock1 = createMockReqRes('192.168.1.1');
  middleware(mock1.req, mock1.res, mock1.next);
  
  const mock2 = createMockReqRes('192.168.1.1');
  middleware(mock2.req, mock2.res, mock2.next);

  // IP 2: 2 requisições (deve passar, isolado do IP 1)
  const mock3 = createMockReqRes('192.168.1.2');
  middleware(mock3.req, mock3.res, mock3.next);
  
  const mock4 = createMockReqRes('192.168.1.2');
  middleware(mock4.req, mock4.res, mock4.next);

  if (mock1.res.statusCode === 429 || mock2.res.statusCode === 429) {
    throw new Error('IP 1 foi bloqueado incorretamente');
  }

  if (mock3.res.statusCode === 429 || mock4.res.statusCode === 429) {
    throw new Error('IP 2 foi bloqueado incorretamente');
  }
});

// Teste 5: Critical rate limiter
runTest('Teste 5: Critical rate limiter tem limite menor', () => {
  const middleware = criticalRateLimiter;
  const mock = createMockReqRes();

  // Critical rate limiter deve ter max: 10
  middleware(mock.req, mock.res, mock.next);

  const limitStr = mock.res.headers['X-RateLimit-Limit'];
  if (!limitStr) {
    throw new Error('Header X-RateLimit-Limit não foi adicionado');
  }
  
  const limit = parseInt(limitStr);
  if (isNaN(limit) || limit !== 10) {
    throw new Error(`Critical rate limiter tem limite incorreto: ${limit} (esperado: 10)`);
  }
});

// Teste 6: Workflow rate limiter
runTest('Teste 6: Workflow rate limiter tem limite menor', () => {
  const middleware = workflowRateLimiter;
  const mock = createMockReqRes();

  middleware(mock.req, mock.res, mock.next);

  const limitStr = mock.res.headers['X-RateLimit-Limit'];
  if (!limitStr) {
    throw new Error('Header X-RateLimit-Limit não foi adicionado');
  }
  
  const limit = parseInt(limitStr);
  if (isNaN(limit) || limit !== 5) {
    throw new Error(`Workflow rate limiter tem limite incorreto: ${limit} (esperado: 5)`);
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

