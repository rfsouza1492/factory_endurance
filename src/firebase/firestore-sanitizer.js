/**
 * Firestore Sanitizer
 * Remove valores undefined e sanitiza dados antes de salvar no Firestore
 * 
 * Firestore não aceita:
 * - undefined (valores)
 * - undefined (em objetos)
 * - undefined (em arrays)
 * 
 * Firestore aceita:
 * - null
 * - strings, numbers, booleans
 * - arrays (sem undefined)
 * - objetos (sem undefined)
 * - Timestamp, GeoPoint, etc.
 */

/**
 * Sanitiza um valor para ser compatível com Firestore
 * @param {any} value - Valor a ser sanitizado
 * @param {object} options - Opções de sanitização
 * @param {boolean} options.removeNull - Se true, remove campos null também (padrão: false)
 * @param {boolean} options.removeEmptyStrings - Se true, remove strings vazias (padrão: false)
 * @returns {any} - Valor sanitizado
 */
export function sanitizeForFirestore(value, options = {}) {
  const {
    removeNull = false,
    removeEmptyStrings = false
  } = options;

  // null é aceito pelo Firestore, mas podemos remover se solicitado
  if (value === null) {
    return removeNull ? undefined : null;
  }

  // undefined sempre deve ser removido
  if (value === undefined) {
    return undefined; // Será removido no processamento de objetos
  }

  // Strings vazias podem ser removidas se solicitado
  if (removeEmptyStrings && typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  // Arrays: sanitizar cada item e remover undefined
  if (Array.isArray(value)) {
    const sanitized = value
      .map(item => sanitizeForFirestore(item, options))
      .filter(item => item !== undefined);
    return sanitized;
  }

  // Objetos: sanitizar recursivamente e remover campos undefined
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    // Verificar se é um objeto especial do Firestore (Timestamp, GeoPoint, etc.)
    // Esses objetos têm métodos específicos e não devem ser processados
    if (value.constructor && value.constructor.name !== 'Object') {
      // É um objeto especial (Timestamp, etc.) - retornar como está
      return value;
    }

    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      // Nunca incluir chaves que começam com _ (convenção para campos internos)
      if (key.startsWith('_') && key !== '_id') {
        continue;
      }

      const sanitizedValue = sanitizeForFirestore(val, options);
      
      // Só adicionar se não for undefined
      if (sanitizedValue !== undefined) {
        sanitized[key] = sanitizedValue;
      }
    }
    return sanitized;
  }

  // Valores primitivos (string, number, boolean) são aceitos como estão
  return value;
}

/**
 * Sanitiza um documento completo antes de salvar no Firestore
 * @param {object} doc - Documento a ser sanitizado
 * @param {object} options - Opções de sanitização
 * @returns {object} - Documento sanitizado
 */
export function sanitizeDocument(doc, options = {}) {
  if (!doc || typeof doc !== 'object') {
    return doc;
  }

  const sanitized = sanitizeForFirestore(doc, options);
  
  // Garantir que retornamos um objeto (não undefined)
  return sanitized || {};
}

/**
 * Valida se um documento está pronto para Firestore
 * @param {object} doc - Documento a validar
 * @returns {{valid: boolean, errors: string[]}} - Resultado da validação
 */
export function validateForFirestore(doc) {
  const errors = [];

  function checkValue(value, path = '') {
    if (value === undefined) {
      errors.push(`Campo undefined encontrado em: ${path || 'raiz'}`);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        checkValue(item, `${path}[${index}]`);
      });
    } else if (value !== null && typeof value === 'object') {
      for (const [key, val] of Object.entries(value)) {
        checkValue(val, path ? `${path}.${key}` : key);
      }
    }
  }

  checkValue(doc);

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitiza e valida um documento antes de salvar
 * @param {object} doc - Documento a processar
 * @param {object} options - Opções de sanitização
 * @returns {{sanitized: object, valid: boolean, errors: string[]}} - Resultado
 */
export function sanitizeAndValidate(doc, options = {}) {
  const sanitized = sanitizeDocument(doc, options);
  const validation = validateForFirestore(sanitized);

  return {
    sanitized,
    valid: validation.valid,
    errors: validation.errors
  };
}

export default {
  sanitizeForFirestore,
  sanitizeDocument,
  validateForFirestore,
  sanitizeAndValidate
};

