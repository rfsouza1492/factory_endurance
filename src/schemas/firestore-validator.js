/**
 * Firestore Validator
 * Validações específicas para garantir compatibilidade com Firestore
 * 
 * Firestore não aceita:
 * - undefined (valores)
 * - undefined (em objetos)
 * - undefined (em arrays)
 */

/**
 * Verifica se um valor contém undefined (recursivo)
 * @param {any} value - Valor a verificar
 * @param {string} path - Caminho atual (para mensagens de erro)
 * @returns {string[]} - Lista de caminhos com undefined
 */
export function findUndefinedFields(value, path = '') {
  const undefinedPaths = [];

  if (value === undefined) {
    undefinedPaths.push(path || 'raiz');
    return undefinedPaths;
  }

  if (value === null) {
    // null é aceito pelo Firestore
    return undefinedPaths;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const itemPath = path ? `${path}[${index}]` : `[${index}]`;
      undefinedPaths.push(...findUndefinedFields(item, itemPath));
    });
  } else if (typeof value === 'object') {
    for (const [key, val] of Object.entries(value)) {
      const fieldPath = path ? `${path}.${key}` : key;
      undefinedPaths.push(...findUndefinedFields(val, fieldPath));
    }
  }

  return undefinedPaths;
}

/**
 * Valida se um objeto está pronto para Firestore (sem undefined)
 * @param {Object} obj - Objeto a validar
 * @param {string} objectName - Nome do objeto (para mensagens de erro)
 * @returns {{valid: boolean, errors: string[]}} - Resultado da validação
 */
export function validateForFirestore(obj, objectName = 'Objeto') {
  const undefinedPaths = findUndefinedFields(obj);

  if (undefinedPaths.length === 0) {
    return {
      valid: true,
      errors: []
    };
  }

  return {
    valid: false,
    errors: [
      `${objectName} contém campos undefined:`,
      ...undefinedPaths.map(path => `  - ${path}`)
    ]
  };
}

export default {
  findUndefinedFields,
  validateForFirestore
};

