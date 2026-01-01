/**
 * Sidebar configuration for Docusaurus
 * Factory Organizational System Documentation
 * 
 * Total: 46 pages
 */

module.exports = {
  docs: [
    // 1. Home / Getting Started (2 páginas)
    'index',
    'getting-started',
    
    // 2. Estrutura Organizacional (7 páginas)
    {
      type: 'category',
      label: '🏛️ Estrutura Organizacional',
      items: [
        'org/overview',
        'org/hierarchy',
        {
          type: 'category',
          label: 'Papéis e Responsabilidades',
          items: [
            'org/roles/factory-manager',
            'org/roles/product-manager',
            'org/roles/impl-agent',
            'org/roles/test-agent',
            'org/roles/doc-analyst',
          ],
        },
      ],
    },
    
    // 3. Departamentos (15 páginas)
    {
      type: 'category',
      label: '🏢 Departamentos',
      items: [
        'departments/overview',
        'departments/categories',
        'departments/architecture',
        'departments/code-quality',
        'departments/testing',
        'departments/documentation',
        'departments/performance',
        'departments/security',
        'departments/reliability',
        'departments/product',
        'departments/implementation',
        'departments/ai-agents',
        'departments/review',
        'departments/operations',
        'departments/governance',
      ],
    },
    
    // 4. Processos Organizacionais (10 páginas)
    {
      type: 'category',
      label: '🔁 Processos Organizacionais',
      items: [
        'processes/overview',
        'processes/full-flow',
        'processes/inputs',
        'processes/outputs',
        'processes/raci',
        'processes/checklists',
        'processes/criteria',
        {
          type: 'category',
          label: 'Fases do Processo',
          items: [
            'processes/phases/phase-1',
            'processes/phases/phase-2',
            'processes/phases/phase-3',
            'processes/phases/phase-4',
          ],
        },
      ],
    },
    
    // 5. Infraestrutura (7 páginas)
    {
      type: 'category',
      label: '🧩 Infraestrutura',
      items: [
        'infra/overview',
        'infra/tech-stack',
        'infra/repo-structure',
        'infra/branching',
        'infra/naming-conventions',
        'infra/documentation-standard',
        'infra/ci-cd',
      ],
    },
    
    // 6. Governança (5 páginas)
    {
      type: 'category',
      label: '🧭 Governança',
      items: [
        'governance/overview',
        'governance/decision-rights',
        'governance/cerimonies',
        'governance/quality-gates',
        'governance/review-cycles',
      ],
    },
    
    // 7. Cultura (5 páginas)
    {
      type: 'category',
      label: '🌱 Cultura',
      items: [
        'culture/principles',
        'culture/how-we-work',
        'culture/behavioral',
        'culture/anti-patterns',
        'culture/communication',
      ],
    },
    
    // 8. Glossário e Referências (4 páginas)
    {
      type: 'category',
      label: '📚 Glossário',
      items: [
        'glossary/terms',
        'glossary/acronyms',
        'glossary/templates',
        'glossary/references',
      ],
    },
  ],
};

