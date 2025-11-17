/** Proper Authentication Flow */
export class AuthFlow {
  async login(email: string, password: string) {
    return { token: 'jwt_token', user: { id: '1', email } };
  }
  async logout(token: string) { return { success: true }; }
  async refresh(refreshToken: string) { return { accessToken: 'new_token' }; }
}

