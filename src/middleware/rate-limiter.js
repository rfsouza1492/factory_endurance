/**
 * Rate Limiter Middleware
 * Protege endpoints contra abuso
 */

// Armazenamento simples em memória (em produção, usar Redis)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 100; // 100 requisições por minuto por IP

/**
 * Limpa contadores antigos
 */
function cleanupOldCounts() {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now - value.windowStart > RATE_LIMIT_WINDOW) {
      requestCounts.delete(key);
    }
  }
}

// Limpar a cada 5 minutos
setInterval(cleanupOldCounts, 5 * 60 * 1000);

/**
 * Rate limiter middleware
 * @param {Object} options - Opções (max, window, skipSuccessful)
 * @returns {Function} Express middleware
 */
export function rateLimiter(options = {}) {
  const {
    max = RATE_LIMIT_MAX,
    window = RATE_LIMIT_WINDOW,
    skipSuccessful = false
  } = options;

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${ip}-${req.path}`;
    const now = Date.now();

    // Limpar contadores antigos
    cleanupOldCounts();

    // Obter ou criar contador
    let counter = requestCounts.get(key);
    
    if (!counter || now - counter.windowStart > window) {
      counter = {
        count: 0,
        windowStart: now
      };
      requestCounts.set(key, counter);
    }

    // Incrementar contador
    counter.count++;

    // Adicionar headers (sempre, antes de verificar limite)
    if (res.setHeader) {
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - counter.count)));
      res.setHeader('X-RateLimit-Reset', new Date(counter.windowStart + window).toISOString());
    }

    // Verificar limite
    if (counter.count > max) {
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Limite de ${max} requisições por ${window / 1000} segundos excedido`,
        retryAfter: Math.ceil((window - (now - counter.windowStart)) / 1000)
      });
      return;
    }

    // Se skipSuccessful, decrementar em caso de sucesso
    if (skipSuccessful) {
      const originalSend = res.send;
      res.send = function(data) {
        if (res.statusCode < 400) {
          counter.count = Math.max(0, counter.count - 1);
        }
        return originalSend.call(this, data);
      };
    }

    next();
  };
}

/**
 * Rate limiter específico para endpoints críticos
 */
export const criticalRateLimiter = rateLimiter({
  max: 10, // 10 requisições por minuto
  window: 60 * 1000
});

/**
 * Rate limiter para endpoints de workflow
 */
export const workflowRateLimiter = rateLimiter({
  max: 5, // 5 requisições por minuto
  window: 60 * 1000
});

