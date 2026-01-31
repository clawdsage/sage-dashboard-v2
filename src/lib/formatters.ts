export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return '0s'

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

export function formatCost(dollars: number, estimated?: boolean): string {
  if (dollars === null || dollars === undefined || dollars === 0) return '$0.00'
  
  const prefix = estimated ? '~$' : '$'
  
  // Show more precision for small amounts (< $0.01)
  if (dollars < 0.01) {
    // Show up to 4 decimal places, remove trailing zeros
    const formatted = Number(dollars).toFixed(4).replace(/\.?0+$/, '')
    return `${prefix}${formatted}`
  }
  
  return `${prefix}${Number(dollars).toFixed(2)}`
}

// Model pricing per 1M tokens (approximate, as of early 2026)
// Format: { input: $/1M, output: $/1M }
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // Grok models (xAI)
  'grok': { input: 0.10, output: 0.50 },
  'grok-code': { input: 0.10, output: 0.50 },
  'grok-code-fast': { input: 0.05, output: 0.25 },
  // Claude models (Anthropic)
  'claude-sonnet': { input: 3.00, output: 15.00 },
  'claude-opus': { input: 15.00, output: 75.00 },
  'claude-haiku': { input: 0.25, output: 1.25 },
  // GPT models (OpenAI)
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4': { input: 30.00, output: 60.00 },
  'gpt-3.5': { input: 0.50, output: 1.50 },
  // DeepSeek
  'deepseek': { input: 0.14, output: 0.28 },
  'deepseek-coder': { input: 0.14, output: 0.28 },
  // Gemini (Google)
  'gemini': { input: 0.075, output: 0.30 },
  'gemini-flash': { input: 0.075, output: 0.30 },
  // Qwen
  'qwen': { input: 0.10, output: 0.30 },
  // Default fallback
  'default': { input: 0.50, output: 1.50 },
}

/**
 * Estimate cost from tokens and model name
 * Assumes ~30% input, ~70% output token split (typical for agents)
 */
export function estimateCost(tokens: number, modelName?: string | null): number {
  if (!tokens || tokens <= 0) return 0
  
  // Find matching pricing (partial match on model name)
  let pricing = MODEL_PRICING['default']
  if (modelName) {
    const lowerModel = modelName.toLowerCase()
    for (const [key, value] of Object.entries(MODEL_PRICING)) {
      if (lowerModel.includes(key)) {
        pricing = value
        break
      }
    }
  }
  
  // Estimate split: 30% input, 70% output (agents generate more than they receive)
  const inputTokens = tokens * 0.3
  const outputTokens = tokens * 0.7
  
  const cost = (inputTokens / 1_000_000 * pricing.input) + (outputTokens / 1_000_000 * pricing.output)
  return cost
}

export function formatTokens(num: number): string {
  if (!num) return '0'

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  } else {
    return num.toString()
  }
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}