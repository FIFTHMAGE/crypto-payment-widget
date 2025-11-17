/** Container - Dependency injection container */
export class Container {
  private services = new Map<string, any>();
  
  register(name: string, service: any) {
    this.services.set(name, service);
  }
  
  resolve<T>(name: string): T {
    return this.services.get(name);
  }
}

export const container = new Container();

