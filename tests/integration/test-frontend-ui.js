#i!/usr/bin/env node
/**
 * Teste de Integração: Frontend UI
 * Testa a interface web do Maestro
 */

import fetch from 'node-fetch';

const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const TIMEOUT = 10000; // 10 segundos

console.log('🧪 Teste de Integração: Frontend UI\n');
console.log(`🌐 Base URL: ${API_BASE}\n`);

let passedTests = 0;
let failedTests = 0;

function runTest(name, testFunction) {
    return new Promise(async (resolve) => {
        try {
            console.log(`📋 Executando: ${name}`);
            await testFunction();
            console.log(`  ✅ ${name} passou\n`);
            passedTests++;
            resolve(true);
        } catch (error) {
            console.error(`  ❌ ${name} falhou: ${error.message}\n`);
            failedTests++;
            resolve(false);
        }
    });
}

// Helper para fazer requisições com timeout
async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`Timeout após ${TIMEOUT}ms`);
        }
        throw error;
    }
}

(async () => {
    // Teste 1: Servidor está respondendo
    await runTest('Teste 1: Servidor está respondendo', async () => {
        const response = await fetchWithTimeout(`${API_BASE}/api/status`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || typeof data !== 'object') {
            throw new Error('Resposta inválida do servidor');
        }
        
        console.log(`    Status: ${response.status} ${response.statusText}`);
        console.log(`    Dados recebidos: ${JSON.stringify(data).substring(0, 100)}...`);
    });

    // Teste 2: Página principal (index.html) está sendo servida
    await runTest('Teste 2: Página principal está sendo servida', async () => {
        const response = await fetchWithTimeout(`${API_BASE}/`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        
        if (!html || html.length === 0) {
            throw new Error('HTML vazio');
        }
        
        if (!html.includes('<!DOCTYPE html') && !html.includes('<html')) {
            throw new Error('Resposta não é HTML válido');
        }
        
        console.log(`    Tamanho do HTML: ${html.length} bytes`);
        console.log(`    Contém título: ${html.includes('<title>') ? 'Sim' : 'Não'}`);
    });

    // Teste 3: API de status retorna dados válidos
    await runTest('Teste 3: API de status retorna dados válidos', async () => {
        const response = await fetchWithTimeout(`${API_BASE}/api/status`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || typeof data !== 'object') {
            throw new Error('Resposta inválida do servidor');
        }
        
        // Verificar estrutura esperada
        if (data.scores === undefined) {
            throw new Error('Campo "scores" não encontrado na resposta');
        }
        
        console.log(`    Scores: ${JSON.stringify(data.scores)}`);
    });

    // Teste 4: API de aprovações pendentes
    await runTest('Teste 4: API de aprovações pendentes', async () => {
        const response = await fetchWithTimeout(`${API_BASE}/api/approvals/pending`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || typeof data !== 'object') {
            throw new Error('Resposta inválida do servidor');
        }
        
        if (!Array.isArray(data.approvals)) {
            throw new Error('Campo "approvals" não é um array');
        }
        
        console.log(`    Aprovações pendentes: ${data.approvals.length}`);
    });

    // Teste 5: API de backlog
    await runTest('Teste 5: API de backlog', async () => {
        const response = await fetchWithTimeout(`${API_BASE}/api/approvals/backlog`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || typeof data !== 'object') {
            throw new Error('Resposta inválida do servidor');
        }
        
        if (!Array.isArray(data.backlog)) {
            throw new Error('Campo "backlog" não é um array');
        }
        
        console.log(`    Itens no backlog: ${data.backlog.length}`);
    });

    // Teste 6: API de background jobs
    await runTest('Teste 6: API de background jobs', async () => {
        const response = await fetchWithTimeout(`${API_BASE}/api/jobs`);
        
        // Aceitar 404 ou 503 se o módulo não estiver disponível
        if (response.status === 404 || response.status === 503) {
            console.log(`    Background jobs não disponível (status: ${response.status})`);
            return; // Não falhar o teste se o módulo não estiver disponível
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || typeof data !== 'object') {
            throw new Error('Resposta inválida do servidor');
        }
        
        if (!Array.isArray(data.jobs)) {
            throw new Error('Campo "jobs" não é um array');
        }
        
        console.log(`    Jobs em background: ${data.jobs.length}`);
    });

    // Teste 7: CORS está habilitado
    await runTest('Teste 7: CORS está habilitado', async () => {
        const response = await fetchWithTimeout(`${API_BASE}/api/status`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET'
            }
        });
        
        const corsHeader = response.headers.get('access-control-allow-origin');
        
        if (!corsHeader) {
            throw new Error('CORS não está habilitado (header access-control-allow-origin ausente)');
        }
        
        console.log(`    CORS header: ${corsHeader}`);
    });

    // Teste 8: Headers de resposta corretos
    await runTest('Teste 8: Headers de resposta corretos', async () => {
        const response = await fetchWithTimeout(`${API_BASE}/api/status`);
        
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Content-Type incorreto: ${contentType} (esperado: application/json)`);
        }
        
        console.log(`    Content-Type: ${contentType}`);
    });

    // Teste 9: Tratamento de erro 404
    await runTest('Teste 9: Tratamento de erro 404', async () => {
        const response = await fetchWithTimeout(`${API_BASE}/api/endpoint-inexistente`);
        
        if (response.status !== 404) {
            throw new Error(`Esperado 404, recebido ${response.status}`);
        }
        
        console.log(`    Status 404 retornado corretamente`);
    });

    // Teste 10: Validação de JSON em respostas
    await runTest('Teste 10: Validação de JSON em respostas', async () => {
        const response = await fetchWithTimeout(`${API_BASE}/api/status`);
        
        let data;
        try {
            data = await response.json();
        } catch (error) {
            throw new Error(`Erro ao parsear JSON: ${error.message}`);
        }
        
        if (!data || typeof data !== 'object') {
            throw new Error('JSON inválido ou não é um objeto');
        }
        
        console.log(`    JSON válido: ${JSON.stringify(data).substring(0, 50)}...`);
    });

    console.log('='.repeat(50));
    console.log(`📊 Resumo: ${passedTests} passaram, ${failedTests} falharam`);
    console.log('='.repeat(50));

    if (failedTests === 0) {
        console.log('\n✅ Todos os testes de frontend UI passaram!');
        process.exit(0);
    } else {
        console.log(`\n❌ ${failedTests} teste(s) falharam`);
        process.exit(1);
    }
})();

