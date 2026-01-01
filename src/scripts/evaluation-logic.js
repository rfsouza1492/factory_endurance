/**
 * Lógica de Avaliação Cruzada
 * Implementa a avaliação de resultados entre agentes
 */

/**
 * Architecture Review avalia Code Quality
 */
export function architectureEvaluatesCode(codeQualityResult) {
  const concerns = {
    critical: [],
    high: [],
    medium: []
  };

  if (!codeQualityResult || !codeQualityResult.data) {
    return concerns;
  }

  const { issues, score } = codeQualityResult.data;

  // Issues críticos de código que afetam arquitetura
  issues.critical.forEach(issue => {
    if (issue.type.includes('Code Organization') || issue.type.includes('CRITICAL')) {
      concerns.critical.push({
        type: 'Architectural Impact',
        message: `Issue crítico de código afeta arquitetura: ${issue.message}`,
        source: issue,
        severity: 'P0'
      });
    }
  });

  // Issues de alta prioridade que podem impactar arquitetura
  issues.high.forEach(issue => {
    if (issue.type.includes('Business Logic') || issue.type.includes('Security')) {
      concerns.high.push({
        type: 'Architectural Impact',
        message: `Issue de alta prioridade pode requerer mudança arquitetural: ${issue.message}`,
        source: issue,
        severity: 'P1'
      });
    }
  });

  // Score baixo indica problemas arquiteturais
  if (score < 60) {
    concerns.critical.push({
      type: 'Architectural Quality',
      message: `Score de qualidade muito baixo (${score}/100) indica problemas arquiteturais sérios`,
      severity: 'P0'
    });
  } else if (score < 75) {
    concerns.high.push({
      type: 'Architectural Quality',
      message: `Score de qualidade baixo (${score}/100) sugere melhorias arquiteturais necessárias`,
      severity: 'P1'
    });
  }

  return concerns;
}

/**
 * Architecture Review avalia Document Analysis
 */
export function architectureEvaluatesDocs(documentAnalysisResult) {
  const concerns = {
    critical: [],
    high: [],
    medium: []
  };

  if (!documentAnalysisResult || !documentAnalysisResult.data) {
    return concerns;
  }

  const { documents, issues } = documentAnalysisResult.data;

  // Documentos críticos faltando
  documents.missing.forEach(doc => {
    if (doc.critical) {
      concerns.critical.push({
        type: 'Documentation Gap',
        message: `Documento crítico faltando: ${doc.name} - necessário para arquitetura`,
        source: doc,
        severity: 'P0'
      });
    }
  });

  // Issues críticos de documentação
  issues.critical.forEach(issue => {
    concerns.high.push({
      type: 'Documentation Quality',
      message: `Issue crítico de documentação: ${issue.message}`,
      source: issue,
      severity: 'P1'
    });
  });

  return concerns;
}

/**
 * Code Quality avalia Architecture Review
 */
export function codeEvaluatesArchitecture(architectureResult) {
  const concerns = {
    critical: [],
    high: [],
    medium: []
  };

  if (!architectureResult || !architectureResult.data) {
    return concerns;
  }

  const { issues, score } = architectureResult.data;

  // Issues críticos de arquitetura afetam qualidade de código
  issues.critical.forEach(issue => {
    if (issue.type === 'Code Organization' || issue.type === 'Security') {
      concerns.critical.push({
        type: 'Code Quality Impact',
        message: `Issue crítico de arquitetura afeta qualidade: ${issue.message}`,
        source: issue,
        severity: 'P0'
      });
    } else {
      concerns.high.push({
        type: 'Code Quality Impact',
        message: `Issue de arquitetura pode afetar qualidade: ${issue.message}`,
        source: issue,
        severity: 'P1'
      });
    }
  });

  // Score baixo de arquitetura indica problemas de qualidade
  if (score < 60) {
    concerns.high.push({
      type: 'Architectural Quality',
      message: `Score arquitetural baixo (${score}/100) sugere problemas de qualidade de código`,
      severity: 'P1'
    });
  }

  return concerns;
}

/**
 * Code Quality avalia Document Analysis
 */
export function codeEvaluatesDocs(documentAnalysisResult) {
  const concerns = {
    critical: [],
    high: [],
    medium: []
  };

  if (!documentAnalysisResult || !documentAnalysisResult.data) {
    return concerns;
  }

  const { documents, issues } = documentAnalysisResult.data;

  // Documentação de padrões de código faltando
  const hasCodeQualityDocs = documents.found.some(doc => 
    doc.name.includes('Code Quality') || doc.name.includes('Standard')
  );

  if (!hasCodeQualityDocs) {
    concerns.high.push({
      type: 'Documentation Gap',
      message: 'Documentação de padrões de qualidade de código não encontrada',
      severity: 'P1'
    });
  }

  // Issues de documentação que afetam qualidade
  issues.high.forEach(issue => {
    if (issue.type === 'Document Quality' && issue.message.includes('README')) {
      concerns.medium.push({
        type: 'Documentation Quality',
        message: `Documentação pode estar incompleta: ${issue.message}`,
        source: issue,
        severity: 'P2'
      });
    }
  });

  return concerns;
}

/**
 * Document Analysis avalia Architecture Review
 */
export function docsEvaluatesArchitecture(architectureResult) {
  const concerns = {
    critical: [],
    high: [],
    medium: []
  };

  if (!architectureResult || !architectureResult.data) {
    return concerns;
  }

  const { issues } = architectureResult.data;

  // Issues críticos de arquitetura precisam ser documentados
  issues.critical.forEach(issue => {
    concerns.high.push({
      type: 'Documentation Need',
      message: `Issue crítico de arquitetura precisa ser documentado: ${issue.message}`,
      source: issue,
      severity: 'P1'
    });
  });

  return concerns;
}

/**
 * Document Analysis avalia Code Quality
 */
export function docsEvaluatesCode(codeQualityResult) {
  const concerns = {
    critical: [],
    high: [],
    medium: []
  };

  if (!codeQualityResult || !codeQualityResult.data) {
    return concerns;
  }

  const { issues } = codeQualityResult.data;

  // Issues críticos precisam ser documentados
  issues.critical.forEach(issue => {
    concerns.high.push({
      type: 'Documentation Need',
      message: `Issue crítico de código precisa ser documentado: ${issue.message}`,
      source: issue,
      severity: 'P1'
    });
  });

  // Business logic issues precisam estar documentados
  issues.high.forEach(issue => {
    if (issue.type.includes('Business Logic')) {
      concerns.medium.push({
        type: 'Documentation Need',
        message: `Regra de negócio deve estar documentada: ${issue.message}`,
        source: issue,
        severity: 'P2'
      });
    }
  });

  return concerns;
}

/**
 * Gera relatório de avaliação cruzada
 */
export function generateCrossEvaluationReport(evaluator, evaluated, concerns, timestamp) {
  const criticalCount = concerns.critical.length;
  const highCount = concerns.high.length;
  const mediumCount = concerns.medium.length;

  let report = `# Avaliação Cruzada: ${evaluator} avalia ${evaluated}

**Data:** ${new Date().toISOString()}
**Avaliador:** ${evaluator} Agent
**Avaliado:** ${evaluated} Agent
**Perspectiva:** Avaliação sob perspectiva de ${evaluator}

---

## ⚠️ Preocupações Identificadas

### Preocupações Críticas (P0)

`;

  if (criticalCount > 0) {
    report += `| ID | Preocupação | Impacto | Severidade |\n`;
    report += `|----|-------------|---------|------------|\n`;
    concerns.critical.forEach((concern, idx) => {
      report += `| P0-${idx + 1} | ${concern.message} | Alto | Crítica |\n`;
    });
    report += `\n**Detalhes:**\n\n`;
    concerns.critical.forEach((concern, idx) => {
      report += `- **P0-${idx + 1}**: ${concern.message}\n`;
      if (concern.source) {
        report += `  - **Origem**: ${concern.source.file || concern.source.location || 'N/A'}\n`;
      }
      report += `  - **Tipo**: ${concern.type}\n\n`;
    });
  } else {
    report += `Nenhuma preocupação crítica identificada. ✅\n\n`;
  }

  report += `### Preocupações de Alta Prioridade (P1)\n\n`;

  if (highCount > 0) {
    report += `| ID | Preocupação | Impacto | Severidade |\n`;
    report += `|----|-------------|---------|------------|\n`;
    concerns.high.slice(0, 10).forEach((concern, idx) => {
      report += `| P1-${idx + 1} | ${concern.message} | Médio | Alta |\n`;
    });
    if (highCount > 10) {
      report += `\n*... e mais ${highCount - 10} preocupações de alta prioridade*\n\n`;
    }
  } else {
    report += `Nenhuma preocupação de alta prioridade identificada. ✅\n\n`;
  }

  report += `### Preocupações de Média Prioridade (P2)\n\n`;
  report += `${mediumCount} preocupações de média prioridade identificadas.\n\n`;

  report += `## 📊 Score de Alinhamento\n\n`;
  const alignmentScore = Math.max(0, 100 - (criticalCount * 20) - (highCount * 10) - (mediumCount * 5));
  report += `- **Score**: ${alignmentScore}/100\n`;
  report += `- **Status**: ${alignmentScore >= 80 ? '✅ Excelente' : alignmentScore >= 60 ? '⚠️ Bom' : '❌ Precisa Melhorar'}\n\n`;

  report += `**Gerado por:** ${evaluator} Agent\n`;

  return report;
}

