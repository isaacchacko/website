/**
 * Sanity check script to test API communication from frontend
 * Run this in the browser console or import and call from a component
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export async function sanityCheck() {
  console.group('🔍 API Sanity Check')
  console.log(`API Base URL: ${API_BASE}`)
  console.log(`Environment: ${import.meta.env.MODE}`)
  console.log(`VITE_API_URL: ${import.meta.env.VITE_API_URL || '(not set)'}`)

  const results: Array<{ endpoint: string; status: string; error?: string }> = []

  // Test 1: Health endpoint
  try {
    console.log('\n1. Testing /health...')
    const healthRes = await fetch(`${API_BASE}/health`)
    const healthData = await healthRes.json()
    console.log('✅ Health check:', healthData)
    results.push({ endpoint: '/health', status: 'OK', error: undefined })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('❌ Health check failed:', errMsg)
    results.push({ endpoint: '/health', status: 'FAILED', error: errMsg })
  }

  // Test 2: Status endpoint
  try {
    console.log('\n2. Testing /status/...')
    const statusRes = await fetch(`${API_BASE}/status/`)
    const statusData = await statusRes.json()
    console.log('✅ Status:', statusData)
    results.push({ endpoint: '/status/', status: 'OK', error: undefined })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('❌ Status check failed:', errMsg)
    results.push({ endpoint: '/status/', status: 'FAILED', error: errMsg })
  }

  // Test 3: CORS check
  try {
    console.log('\n3. Testing CORS...')
    const corsRes = await fetch(`${API_BASE}/health`, {
      method: 'OPTIONS',
    })
    console.log('✅ CORS preflight:', corsRes.status)
    results.push({ endpoint: 'CORS', status: 'OK', error: undefined })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('❌ CORS check failed:', errMsg)
    results.push({ endpoint: 'CORS', status: 'FAILED', error: errMsg })
  }

  // Test 4: Network connectivity
  try {
    console.log('\n4. Testing network connectivity...')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    const networkRes = await fetch(`${API_BASE}/health`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    console.log('✅ Network reachable:', networkRes.status)
    results.push({ endpoint: 'Network', status: 'OK', error: undefined })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('❌ Network unreachable:', errMsg)
    results.push({ endpoint: 'Network', status: 'FAILED', error: errMsg })
  }

  console.groupEnd()

  // Summary
  const passed = results.filter((r) => r.status === 'OK').length
  const failed = results.filter((r) => r.status === 'FAILED').length

  console.log('\n📊 Summary:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.table(results)

  return {
    passed,
    failed,
    total: results.length,
    results,
    apiBase: API_BASE,
  }
}

// Auto-run in dev mode if imported
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Make it available globally for manual testing
  ;(window as typeof window & { sanityCheck: typeof sanityCheck }).sanityCheck =
    sanityCheck
  console.log('💡 Run sanityCheck() in the console to test API connectivity')
}
