/**
 * File utilities - File operation helpers
 * @module utils
 */

import fs from 'fs/promises';
import path from 'path';

export class FileUtil {
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async readJson<T>(filePath: string): Promise<T> {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  static async writeJson(filePath: string, data: any, pretty: boolean = true): Promise<void> {
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    await fs.writeFile(filePath, content, 'utf-8');
  }

  static async ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  static async copyFile(source: string, destination: string): Promise<void> {
    await fs.copyFile(source, destination);
  }

  static async deleteFile(filePath: string): Promise<void> {
    if (await this.exists(filePath)) {
      await fs.unlink(filePath);
    }
  }

  static getExtension(filePath: string): string {
    return path.extname(filePath);
  }

  static getFilename(filePath: string, withExtension: boolean = true): string {
    return withExtension ? path.basename(filePath) : path.basename(filePath, path.extname(filePath));
  }

  static async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  static async listFiles(dirPath: string, extension?: string): Promise<string[]> {
    const files = await fs.readdir(dirPath);
    return extension ? files.filter((file) => path.extname(file) === extension) : files;
  }
}

