/**
 * Authentication Middleware
 * Sistema básico de autenticação para produção
 */

// Em produção, usar Firebase Auth ou JWT
// Por enquanto, implementação básica com API keys ou tokens simples

const API_KEYS = new Set(
  (process.env.API_KEYS || '').split(',').filter(k => k.trim())
);

const ADMIN_USERS = new Set(
  (process.env.ADMIN_USERS || '').split(',').filter(u => u.trim())
);

/**
 * Middleware de autenticação básica
 * Verifica API key ou token
 */
export function requireAuth(req, res, next) {
  // Permitir se não há API keys configuradas (modo desenvolvimento)
  if (API_KEYS.size === 0 && !process.env.REQUIRE_AUTH) {
    return next();
  }

  // Verificar API key no header
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'API key ou token de autenticação necessário'
    });
    return;
  }

  if (!API_KEYS.has(apiKey)) {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'API key inválida'
    });
    return;
  }

  // Adicionar informações do usuário à requisição
  req.user = {
    apiKey,
    isAdmin: ADMIN_USERS.has(apiKey)
  };

  next();
}

/**
 * Middleware para verificar se usuário é admin
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Autenticação necessária'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Acesso de administrador necessário'
    });
  }

  next();
}

/**
 * Middleware opcional (não bloqueia se não autenticado)
 */
export function optionalAuth(req, res, next) {
  // Se não há API keys configuradas, não fazer nada
  if (API_KEYS.size === 0) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

  if (apiKey && API_KEYS.has(apiKey)) {
    req.user = {
      apiKey,
      isAdmin: ADMIN_USERS.has(apiKey)
    };
  }

  next();
}

