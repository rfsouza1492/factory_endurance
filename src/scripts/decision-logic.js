/**
 * Lógica de Decisão Go/No-go
 * Implementa a decisão baseada em todos os resultados e avaliações
 */

/**
 * Consolida todas as preocupações de todos os agentes e avaliações
 */
export function consolidateConcerns(executionResults, evaluations) {
  const allConcerns = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  // Coletar issues dos resultados dos agentes
  if (executionResults.results.architecture?.data) {
    const archIssues = executionResults.results.architecture.data.issues;
    allConcerns.critical.push(...archIssues.critical.map(i => ({ ...i, source: 'Architecture Review' })));
    allConcerns.high.push(...archIssues.high.map(i => ({ ...i, source: 'Architecture Review' })));
    allConcerns.medium.push(...archIssues.medium.map(i => ({ ...i, source: 'Architecture Review' })));
    allConcerns.low.push(...archIssues.low.map(i => ({ ...i, source: 'Architecture Review' })));
  }

  if (executionResults.results.codeQuality?.data) {
    const codeIssues = executionResults.results.codeQuality.data.issues;
    allConcerns.critical.push(...codeIssues.critical.map(i => ({ ...i, source: 'Code Quality Review' })));
    allConcerns.high.push(...codeIssues.high.map(i => ({ ...i, source: 'Code Quality Review' })));
    allConcerns.medium.push(...codeIssues.medium.map(i => ({ ...i, source: 'Code Quality Review' })));
    allConcerns.low.push(...codeIssues.low.map(i => ({ ...i, source: 'Code Quality Review' })));
  }

  if (executionResults.results.documentAnalysis?.data) {
    const docsIssues = executionResults.results.documentAnalysis.data.issues;
    allConcerns.critical.push(...docsIssues.critical.map(i => ({ ...i, source: 'Document Analysis' })));
    allConcerns.high.push(...docsIssues.high.map(i => ({ ...i, source: 'Document Analysis' })));
    allConcerns.medium.push(...docsIssues.medium.map(i => ({ ...i, source: 'Document Analysis' })));
    allConcerns.low.push(...docsIssues.low.map(i => ({ ...i, source: 'Document Analysis' })));
  }

  // Coletar issues dos novos agentes
  if (executionResults.results.security?.data) {
    const securityIssues = executionResults.results.security.data.issues;
    allConcerns.critical.push(...securityIssues.critical.map(i => ({ ...i, source: 'Security Audit' })));
    allConcerns.high.push(...securityIssues.high.map(i => ({ ...i, source: 'Security Audit' })));
    allConcerns.medium.push(...securityIssues.medium.map(i => ({ ...i, source: 'Security Audit' })));
    allConcerns.low.push(...securityIssues.low.map(i => ({ ...i, source: 'Security Audit' })));
  }

  if (executionResults.results.performance?.data) {
    const perfIssues = executionResults.results.performance.data.issues;
    allConcerns.critical.push(...perfIssues.critical.map(i => ({ ...i, source: 'Performance Analysis' })));
    allConcerns.high.push(...perfIssues.high.map(i => ({ ...i, source: 'Performance Analysis' })));
    allConcerns.medium.push(...perfIssues.medium.map(i => ({ ...i, source: 'Performance Analysis' })));
    allConcerns.low.push(...perfIssues.low.map(i => ({ ...i, source: 'Performance Analysis' })));
  }

  if (executionResults.results.dependency?.data) {
    const depIssues = executionResults.results.dependency.data.issues;
    allConcerns.critical.push(...depIssues.critical.map(i => ({ ...i, source: 'Dependency Management' })));
    allConcerns.high.push(...depIssues.high.map(i => ({ ...i, source: 'Dependency Management' })));
    allConcerns.medium.push(...depIssues.medium.map(i => ({ ...i, source: 'Dependency Management' })));
    allConcerns.low.push(...depIssues.low.map(i => ({ ...i, source: 'Dependency Management' })));
  }

  if (executionResults.results.testing?.data) {
    const testingIssues = executionResults.results.testing.data.issues;
    allConcerns.critical.push(...testingIssues.critical.map(i => ({ ...i, source: 'Testing Coverage' })));
    allConcerns.high.push(...testingIssues.high.map(i => ({ ...i, source: 'Testing Coverage' })));
    allConcerns.medium.push(...testingIssues.medium.map(i => ({ ...i, source: 'Testing Coverage' })));
    allConcerns.low.push(...testingIssues.low.map(i => ({ ...i, source: 'Testing Coverage' })));
  }

  if (executionResults.results.accessibility?.data) {
    const accessibilityIssues = executionResults.results.accessibility.data.issues;
    allConcerns.critical.push(...accessibilityIssues.critical.map(i => ({ ...i, source: 'Accessibility Audit' })));
    allConcerns.high.push(...accessibilityIssues.high.map(i => ({ ...i, source: 'Accessibility Audit' })));
    allConcerns.medium.push(...accessibilityIssues.medium.map(i => ({ ...i, source: 'Accessibility Audit' })));
    allConcerns.low.push(...accessibilityIssues.low.map(i => ({ ...i, source: 'Accessibility Audit' })));
  }

  if (executionResults.results.apiDesign?.data) {
    const apiDesignIssues = executionResults.results.apiDesign.data.issues;
    allConcerns.critical.push(...apiDesignIssues.critical.map(i => ({ ...i, source: 'API Design Review' })));
    allConcerns.high.push(...apiDesignIssues.high.map(i => ({ ...i, source: 'API Design Review' })));
    allConcerns.medium.push(...apiDesignIssues.medium.map(i => ({ ...i, source: 'API Design Review' })));
    allConcerns.low.push(...apiDesignIssues.low.map(i => ({ ...i, source: 'API Design Review' })));
  }

  // Coletar preocupações das avaliações cruzadas
  if (evaluations.archEvalCode?.concerns) {
    allConcerns.critical.push(...evaluations.archEvalCode.concerns.critical.map(c => ({ ...c, source: 'Architecture→Code' })));
    allConcerns.high.push(...evaluations.archEvalCode.concerns.high.map(c => ({ ...c, source: 'Architecture→Code' })));
  }

  if (evaluations.archEvalDocs?.concerns) {
    allConcerns.critical.push(...evaluations.archEvalDocs.concerns.critical.map(c => ({ ...c, source: 'Architecture→Docs' })));
    allConcerns.high.push(...evaluations.archEvalDocs.concerns.high.map(c => ({ ...c, source: 'Architecture→Docs' })));
  }

  if (evaluations.codeEvalArch?.concerns) {
    allConcerns.critical.push(...evaluations.codeEvalArch.concerns.critical.map(c => ({ ...c, source: 'Code→Architecture' })));
    allConcerns.high.push(...evaluations.codeEvalArch.concerns.high.map(c => ({ ...c, source: 'Code→Architecture' })));
  }

  if (evaluations.codeEvalDocs?.concerns) {
    allConcerns.high.push(...evaluations.codeEvalDocs.concerns.high.map(c => ({ ...c, source: 'Code→Docs' })));
    allConcerns.medium.push(...evaluations.codeEvalDocs.concerns.medium.map(c => ({ ...c, source: 'Code→Docs' })));
  }

  if (evaluations.docsEvalArch?.concerns) {
    allConcerns.high.push(...evaluations.docsEvalArch.concerns.high.map(c => ({ ...c, source: 'Docs→Architecture' })));
  }

  if (evaluations.docsEvalCode?.concerns) {
    allConcerns.high.push(...evaluations.docsEvalCode.concerns.high.map(c => ({ ...c, source: 'Docs→Code' })));
    allConcerns.medium.push(...evaluations.docsEvalCode.concerns.medium.map(c => ({ ...c, source: 'Docs→Code' })));
  }

  // Remover duplicatas (mesma mensagem)
  const uniqueConcerns = {
    critical: removeDuplicates(allConcerns.critical),
    high: removeDuplicates(allConcerns.high),
    medium: removeDuplicates(allConcerns.medium),
    low: removeDuplicates(allConcerns.low)
  };

  return uniqueConcerns;
}

function removeDuplicates(concerns) {
  const seen = new Set();
  return concerns.filter(concern => {
    const key = concern.message || concern.type;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Identifica conflitos entre agentes
 */
export function identifyConflicts(executionResults, evaluations) {
  const conflicts = [];

  // Verificar se há recomendações conflitantes
  const archScore = executionResults.results.architecture?.data?.score || 0;
  const codeScore = executionResults.results.codeQuality?.data?.score || 0;
  const docsScore = executionResults.results.documentAnalysis?.data?.score || 0;

  // Conflito se scores muito diferentes
  if (Math.abs(archScore - codeScore) > 30) {
    conflicts.push({
      type: 'Score Discrepancy',
      message: `Grande discrepância entre scores: Architecture (${archScore}) vs Code Quality (${codeScore})`,
      agents: ['Architecture Review', 'Code Quality Review'],
      impact: 'Médio',
      resolution: 'Revisar critérios de avaliação e alinhar expectativas'
    });
  }

  // Verificar se há issues críticos em áreas relacionadas
  const archCritical = executionResults.results.architecture?.data?.issues?.critical || [];
  const codeCritical = executionResults.results.codeQuality?.data?.issues?.critical || [];

  const archSecurityIssues = archCritical.filter(i => i.type === 'Security');
  const codeSecurityIssues = codeCritical.filter(i => i.type === 'Security');

  if (archSecurityIssues.length > 0 && codeSecurityIssues.length > 0) {
    conflicts.push({
      type: 'Security Issues',
      message: 'Ambos Architecture e Code Quality identificaram issues críticos de segurança',
      agents: ['Architecture Review', 'Code Quality Review'],
      impact: 'Alto',
      resolution: 'Priorizar correção de issues de segurança imediatamente'
    });
  }

  return conflicts;
}

/**
 * Aplica critérios de decisão Go/No-go
 */
export function makeDecision(consolidatedConcerns, conflicts, scores) {
  const criticalCount = consolidatedConcerns.critical.length;
  const highCount = consolidatedConcerns.high.length;
  const hasConflicts = conflicts.length > 0;

  // Critérios de NO-GO
  // NO-GO apenas se houver issues críticos de segurança ou scores muito baixos
  const noGoCriteria = {
    hasCriticalSecurityIssues: criticalCount > 0 && consolidatedConcerns.critical.some(c => 
      c.type === 'Security' || c.message?.toLowerCase().includes('security') || 
      c.message?.toLowerCase().includes('segurança') || c.message?.toLowerCase().includes('secret')
    ),
    hasBlockingConflicts: conflicts.some(c => c.impact === 'Alto'),
    hasVeryLowScores: scores.architecture < 40 || scores.codeQuality < 40 || scores.documentation < 40
  };

  const noGoCount = Object.values(noGoCriteria).filter(v => v).length;

  // Critérios de GO WITH CONCERNS
  const concernsCriteria = {
    hasHighPriorityIssues: highCount > 3,
    hasMediumConflicts: conflicts.some(c => c.impact === 'Médio'),
    hasModerateScores: (scores.architecture < 75 && scores.architecture >= 60) ||
                       (scores.codeQuality < 75 && scores.codeQuality >= 60) ||
                       (scores.documentation < 75 && scores.documentation >= 60)
  };

  const concernsCount = Object.values(concernsCriteria).filter(v => v).length;

  // Decisão
  let decision = 'GO';
  let justification = '';
  let confidence = 'Alta';

  if (noGoCount > 0) {
    decision = 'NO-GO';
    justification = `Bloqueado por: ${noGoCriteria.hasCriticalSecurityIssues ? `${criticalCount} issues críticos de segurança; ` : ''}${noGoCriteria.hasBlockingConflicts ? 'conflitos bloqueadores; ' : ''}${noGoCriteria.hasVeryLowScores ? 'scores muito baixos (<40)' : ''}`;
    confidence = 'Alta';
  } else if (criticalCount > 0) {
    // Tem issues críticos mas não são de segurança - GO WITH CONCERNS
    decision = 'GO WITH CONCERNS';
    justification = `Pode prosseguir mas com atenção a ${criticalCount} issue(s) crítico(s) não relacionados a segurança`;
    confidence = 'Média';
  } else if (concernsCount >= 2) {
    decision = 'GO WITH CONCERNS';
    justification = `Pode prosseguir mas com atenção a: ${highCount} issues de alta prioridade, ${conflicts.length} conflitos identificados`;
    confidence = 'Média';
  } else if (concernsCount === 1) {
    decision = 'GO WITH CONCERNS';
    justification = `Pode prosseguir mas com atenção a preocupações menores`;
    confidence = 'Alta';
  } else {
    decision = 'GO';
    justification = 'Nenhum blocker identificado. Pode prosseguir com confiança.';
    confidence = 'Alta';
  }

  return {
    decision,
    justification,
    confidence,
    criteria: {
      noGo: noGoCriteria,
      concerns: concernsCriteria
    }
  };
}

/**
 * Calcula scores consolidados
 */
export function calculateConsolidatedScores(executionResults) {
  const archScore = executionResults.results.architecture?.data?.score || 0;
  const codeScore = executionResults.results.codeQuality?.data?.score || 0;
  const docsScore = executionResults.results.documentAnalysis?.data?.score || 0;
  const securityScore = executionResults.results.security?.data?.score || 0;
  const perfScore = executionResults.results.performance?.data?.score || 0;
  const depScore = executionResults.results.dependency?.data?.score || 0;
  const testingScore = executionResults.results.testing?.data?.score || 0;
  const accessibilityScore = executionResults.results.accessibility?.data?.score || 0;
  const apiDesignScore = executionResults.results.apiDesign?.data?.score || 0;

  // Score geral ponderado (ajustado para incluir todos os agentes)
  const hasExtendedAgents = securityScore > 0 || perfScore > 0 || depScore > 0 || 
                            testingScore > 0 || accessibilityScore > 0 || apiDesignScore > 0;
  
  let overallScore;
  if (hasExtendedAgents) {
    // Pesos: Architecture 25%, Code Quality 25%, Docs 10%, Security 10%, 
    // Performance 5%, Dependency 5%, Testing 10%, Accessibility 5%, API Design 5%
    overallScore = Math.round(
      (archScore * 0.25) + 
      (codeScore * 0.25) + 
      (docsScore * 0.10) + 
      (securityScore * 0.10) + 
      (perfScore * 0.05) + 
      (depScore * 0.05) +
      (testingScore * 0.10) +
      (accessibilityScore * 0.05) +
      (apiDesignScore * 0.05)
    );
  } else {
    // Pesos originais
    overallScore = Math.round((archScore * 0.4) + (codeScore * 0.4) + (docsScore * 0.2));
  }

  return {
    architecture: archScore,
    codeQuality: codeScore,
    documentation: docsScore,
    security: securityScore || null,
    performance: perfScore || null,
    dependency: depScore || null,
    testing: testingScore || null,
    accessibility: accessibilityScore || null,
    apiDesign: apiDesignScore || null,
    overall: overallScore
  };
}

