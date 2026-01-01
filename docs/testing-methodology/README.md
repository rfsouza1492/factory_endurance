# 📚 Documentação de Metodologia de Testes

**Documentação completa para construção e execução de testes**

---

## 📖 Documentos Disponíveis

### Metodologia
- [`TEST_CONSTRUCTION_METHODOLOGY.md`](./TEST_CONSTRUCTION_METHODOLOGY.md) - Metodologia completa em 6 fases
- [`TEST_QUICK_REFERENCE.md`](./TEST_QUICK_REFERENCE.md) - Guia rápido de referência
- [`TEST_PROCESS_VISUAL.md`](./TEST_PROCESS_VISUAL.md) - Visão visual do processo
- [`TEST_DOCUMENTATION_INDEX.md`](./TEST_DOCUMENTATION_INDEX.md) - Índice da documentação

### Framework
- [`FRAMEWORK_GUIDE.md`](./FRAMEWORK_GUIDE.md) - Guia completo do framework
- [`FRAMEWORK_SUMMARY.md`](./FRAMEWORK_SUMMARY.md) - Resumo executivo
- [`FRAMEWORK_COMPLETE.md`](./FRAMEWORK_COMPLETE.md) - Visão geral completa

### Execução
- [`TEST_EXECUTION_GUIDE.md`](./TEST_EXECUTION_GUIDE.md) - Guia de execução
- [`FINAL_TEST_PLAN.md`](./FINAL_TEST_PLAN.md) - Plano de testes final

---

## 🎯 Uso pelo Test Execution Agent

Esta documentação é utilizada automaticamente pelo **Test Execution Agent** durante o workflow para:

1. **Validar estrutura** - Verificar se testes seguem metodologia
2. **Executar testes** - Rodar suíte completa antes de produção
3. **Gerar relatórios** - Documentar resultados
4. **Bloquear produção** - Impedir deploy se testes falharem

---

## 🚀 Início Rápido

### Para Desenvolvedores
1. Leia [`TEST_QUICK_REFERENCE.md`](./TEST_QUICK_REFERENCE.md) para começar
2. Use o framework: `npm run test:create unit meu-teste`
3. Execute: `npm run test:unit`

### Para o Agent
O Test Execution Agent carrega automaticamente esta documentação durante o workflow.

---

## 📁 Estrutura

```
testing-methodology/
  ├── README.md (este arquivo)
  ├── TEST_CONSTRUCTION_METHODOLOGY.md
  ├── TEST_QUICK_REFERENCE.md
  ├── TEST_PROCESS_VISUAL.md
  ├── TEST_DOCUMENTATION_INDEX.md
  ├── FRAMEWORK_GUIDE.md
  ├── FRAMEWORK_SUMMARY.md
  ├── FRAMEWORK_COMPLETE.md
  ├── TEST_EXECUTION_GUIDE.md
  └── FINAL_TEST_PLAN.md
```

---

**Última atualização:** 31 de Dezembro de 2025

