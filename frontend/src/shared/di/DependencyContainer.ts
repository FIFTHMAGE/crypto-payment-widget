/**
 * @title DependencyContainer
 * @description Dependency injection pattern implementation
 */

type Constructor<T = any> = new (...args: any[]) => T;
type Factory<T = any> = () => T;

export class DependencyContainer {
  private static instance: DependencyContainer;
  private services = new Map<string, any>();
  private factories = new Map<string, Factory>();

  private constructor() {}

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  registerFactory<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory);
  }

  resolve<T>(key: string): T {
    if (this.services.has(key)) {
      return this.services.get(key) as T;
    }

    if (this.factories.has(key)) {
      const factory = this.factories.get(key)!;
      const instance = factory();
      this.services.set(key, instance);
      return instance as T;
    }

    throw new Error(`Service not found: ${key}`);
  }

  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

export const container = DependencyContainer.getInstance();

