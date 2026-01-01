/**
 * Approvals Helper - Persistência de Aprovações no Firestore
 * Substitui armazenamento em memória por Firestore
 */

import { db } from './connection.js';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { sanitizeDocument } from './firestore-sanitizer.js';
import { validateForFirestore } from '../schemas/firestore-validator.js';
import { logClassifiedError } from '../utils/error-classifier.js';

const APPROVALS_COLLECTION = 'approvals';

/**
 * Salva uma aprovação no Firestore
 * @param {Object} approval - Dados da aprovação
 * @param {Object} options - Opções (approvalId, filePath)
 * @returns {Promise<{success: boolean, firestoreId: string | null, error: string | null}>}
 */
export async function saveApprovalToFirestore(approval, options = {}) {
  const {
    approvalId = approval.id || `approval-${Date.now()}`,
    filePath = null
  } = options;

  const result = {
    success: false,
    firestoreId: null,
    error: null
  };

  try {
    // Validar dados antes de salvar
    const validation = validateForFirestore(approval, `Approval ${approvalId}`);
    if (!validation.valid) {
      const errorMsg = `CONTRACT_ERROR [Approval] [${approvalId}] CONTRATO VIOLADO: ${validation.errors.join('; ')}`;
      logClassifiedError(new Error(errorMsg), 'ApprovalsHelper', `approval/${approvalId}`, 'CONTRACT_ERROR');
      result.error = errorMsg;
      return result;
    }

    // Sanitizar documento
    const cleanedData = sanitizeDocument(approval);

    // Preparar dados para Firestore
    const approvalData = {
      ...cleanedData,
      id: approvalId,
      _syncedAt: serverTimestamp(),
      _syncedFrom: 'maestro-workflow',
      _filePath: filePath || null
    };

    // Salvar no Firestore
    const approvalRef = doc(collection(db, APPROVALS_COLLECTION), approvalId);
    await setDoc(approvalRef, approvalData, { merge: true });

    result.success = true;
    result.firestoreId = approvalId;
    console.log(`✅ Aprovação salva no Firestore: ${approvalId}`);

    return result;
  } catch (error) {
    logClassifiedError(error, 'ApprovalsHelper', `approval/${approvalId}`, 'INFRA_ERROR');
    result.error = error.message;
    console.error(`❌ Erro ao salvar aprovação no Firestore:`, error);
    return result;
  }
}

/**
 * Carrega uma aprovação do Firestore
 * @param {string} approvalId - ID da aprovação
 * @returns {Promise<Object | null>}
 */
export async function loadApprovalFromFirestore(approvalId) {
  try {
    const approvalRef = doc(collection(db, APPROVALS_COLLECTION), approvalId);
    const approvalSnap = await getDoc(approvalRef);

    if (approvalSnap.exists()) {
      const data = approvalSnap.data();
      // Remover campos internos
      delete data._syncedAt;
      delete data._syncedFrom;
      delete data._filePath;
      return data;
    }

    return null;
  } catch (error) {
    logClassifiedError(error, 'ApprovalsHelper', `approval/${approvalId}`, 'INFRA_ERROR');
    console.error(`❌ Erro ao carregar aprovação do Firestore:`, error);
    return null;
  }
}

/**
 * Lista todas as aprovações do Firestore
 * @param {Object} options - Opções (status, limit, orderBy)
 * @returns {Promise<Array>}
 */
export async function listApprovalsFromFirestore(options = {}) {
  const {
    status = null,
    limitCount = 100,
    orderByField = 'timestamp',
    orderDirection = 'desc'
  } = options;

  try {
    let q = query(collection(db, APPROVALS_COLLECTION));

    // Filtrar por status se fornecido
    if (status) {
      q = query(q, where('status', '==', status));
    }

    // Ordenar
    q = query(q, orderBy(orderByField, orderDirection));

    // Limitar
    q = query(q, limit(limitCount));

    const snapshot = await getDocs(q);
    const approvals = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      // Remover campos internos
      delete data._syncedAt;
      delete data._syncedFrom;
      delete data._filePath;
      approvals.push({
        id: doc.id,
        ...data
      });
    });

    return approvals;
  } catch (error) {
    logClassifiedError(error, 'ApprovalsHelper', 'approvals/list', 'INFRA_ERROR');
    console.error(`❌ Erro ao listar aprovações do Firestore:`, error);
    return [];
  }
}

/**
 * Atualiza status de uma aprovação
 * @param {string} approvalId - ID da aprovação
 * @param {string} status - Novo status ('approved', 'rejected', 'pending')
 * @param {Object} updateData - Dados adicionais (approvedBy, rejectedBy, etc.)
 * @returns {Promise<{success: boolean, error: string | null}>}
 */
export async function updateApprovalStatus(approvalId, status, updateData = {}) {
  try {
    const approvalRef = doc(collection(db, APPROVALS_COLLECTION), approvalId);
    
    const updateFields = {
      status,
      ...updateData,
      updatedAt: serverTimestamp()
    };

    // Adicionar timestamp específico baseado no status
    if (status === 'approved') {
      updateFields.approvedAt = serverTimestamp();
    } else if (status === 'rejected') {
      updateFields.rejectedAt = serverTimestamp();
    }

    await setDoc(approvalRef, updateFields, { merge: true });

    console.log(`✅ Status da aprovação atualizado: ${approvalId} -> ${status}`);
    return { success: true, error: null };
  } catch (error) {
    logClassifiedError(error, 'ApprovalsHelper', `approval/${approvalId}`, 'INFRA_ERROR');
    console.error(`❌ Erro ao atualizar status da aprovação:`, error);
    return { success: false, error: error.message };
  }
}

