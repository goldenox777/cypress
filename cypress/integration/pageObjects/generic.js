let baseUrl = Cypress.env('HOST') || 'https://test.gameofpods.com/auth/authorize?client_id=gop&redirect_uri=https%3A%2F%2Ftest.gameofpods.com%2Flogin%2Fcallback&response_type=code&scope=openid&nonce=76dd9d7712556c8023e60fdad9fd9d1bddzaEl9Nl&state=4b76d6a433337fd52f6433d3a09365d38ay9J9ImT&code_challenge=oRp-Qv6mreRtHmlxv5k1bz-CIIRtX8JuFMaYAYcg-y4&code_challenge_method=S256'
console.log(baseUrl)
exports.generic = {
    baseUrl: baseUrl,
    longTimeout: 60000
}