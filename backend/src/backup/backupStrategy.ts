/** Backup and Recovery Procedures */
import { exec } from 'child_process';
export const backupDatabase = () => {
  const timestamp = new Date().toISOString();
  const filename = `backup-${timestamp}.sql`;
  exec(`pg_dump payments > backups/${filename}`);
  return filename;
};

