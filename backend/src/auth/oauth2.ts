/** OAuth2 Authentication */
export class OAuth2Provider {
  async authorize(clientId: string, redirectUri: string) {
    const code = Math.random().toString(36).substr(2);
    return { code, redirectUri };
  }
  
  async exchangeToken(code: string) {
    return { accessToken: `at_${code}`, refreshToken: `rt_${code}`, expiresIn: 3600 };
  }
}

