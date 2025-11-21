/**
 * Reconciliation Service
 * Handles payment reconciliation between blockchain and database records
 */

import { Pool } from 'pg';
import { ethers } from 'ethers';
import logger from '../utils/logger';
import { BlockchainService } from './BlockchainService';

interface ReconciliationResult {
  totalChecked: number;
  mismatches: PaymentMismatch[];
  resolved: number;
  unresolved: number;
}

interface PaymentMismatch {
  paymentId: string;
  type: 'missing' | 'amount_mismatch' | 'status_mismatch' | 'duplicate';
  dbRecord: any;
  blockchainRecord?: any;
  details: string;
}

interface ReconciliationOptions {
  startDate?: Date;
  endDate?: Date;
  autoResolve?: boolean;
  checkBlockchain?: boolean;
}

export class ReconciliationService {
  constructor(
    private db: Pool,
    private blockchainService: BlockchainService,
  ) {}

  /**
   * Perform full payment reconciliation
   */
  async reconcilePayments(options: ReconciliationOptions = {}): Promise<ReconciliationResult> {
    const {
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      endDate = new Date(),
      autoResolve = false,
      checkBlockchain = true,
    } = options;

    logger.info('Starting payment reconciliation', { startDate, endDate });

    const mismatches: PaymentMismatch[] = [];
    let resolved = 0;
    let unresolved = 0;

    try {
      // Get all payments in date range
      const payments = await this.getPaymentsForReconciliation(startDate, endDate);
      logger.info(`Checking ${payments.length} payments`);

      // Check each payment
      for (const payment of payments) {
        const issues = await this.checkPayment(payment, checkBlockchain);

        if (issues.length > 0) {
          mismatches.push(...issues);

          // Attempt auto-resolution if enabled
          if (autoResolve) {
            const resolvedIssues = await this.resolveIssues(payment, issues);
            resolved += resolvedIssues;
            unresolved += issues.length - resolvedIssues;
          } else {
            unresolved += issues.length;
          }
        }
      }

      // Check for missing payments on blockchain
      if (checkBlockchain) {
        const blockchainMismatches = await this.checkBlockchainForMissingPayments(
          startDate,
          endDate,
        );
        mismatches.push(...blockchainMismatches);
        unresolved += blockchainMismatches.length;
      }

      const result: ReconciliationResult = {
        totalChecked: payments.length,
        mismatches,
        resolved,
        unresolved,
      };

      logger.info('Reconciliation completed', result);
      await this.saveReconciliationReport(result);

      return result;
    } catch (error) {
      logger.error('Error during reconciliation:', error);
      throw new Error('Reconciliation failed');
    }
  }

  /**
   * Get payments for reconciliation
   */
  private async getPaymentsForReconciliation(startDate: Date, endDate: Date): Promise<any[]> {
    const query = `
      SELECT *
      FROM payments
      WHERE created_at BETWEEN $1 AND $2
      ORDER BY created_at ASC
    `;

    const result = await this.db.query(query, [startDate, endDate]);
    return result.rows;
  }

  /**
   * Check individual payment for issues
   */
  private async checkPayment(
    payment: any,
    checkBlockchain: boolean,
  ): Promise<PaymentMismatch[]> {
    const issues: PaymentMismatch[] = [];

    // Check for duplicate payments
    const duplicate = await this.checkForDuplicate(payment);
    if (duplicate) {
      issues.push({
        paymentId: payment.id,
        type: 'duplicate',
        dbRecord: payment,
        details: 'Duplicate payment found',
      });
    }

    // Check blockchain record if transaction hash exists
    if (checkBlockchain && payment.transaction_hash) {
      try {
        const blockchainRecord = await this.blockchainService.getTransaction(
          payment.transaction_hash,
        );

        if (!blockchainRecord) {
          issues.push({
            paymentId: payment.id,
            type: 'missing',
            dbRecord: payment,
            details: 'Transaction not found on blockchain',
          });
        } else {
          // Check amount mismatch
          const dbAmount = ethers.utils.parseEther(payment.amount);
          const blockchainAmount = blockchainRecord.value;

          if (!dbAmount.eq(blockchainAmount)) {
            issues.push({
              paymentId: payment.id,
              type: 'amount_mismatch',
              dbRecord: payment,
              blockchainRecord,
              details: `Amount mismatch: DB=${payment.amount}, Blockchain=${ethers.utils.formatEther(blockchainAmount)}`,
            });
          }

          // Check status mismatch
          const blockchainStatus = blockchainRecord.confirmations > 0 ? 'completed' : 'pending';
          if (payment.status !== blockchainStatus) {
            issues.push({
              paymentId: payment.id,
              type: 'status_mismatch',
              dbRecord: payment,
              blockchainRecord,
              details: `Status mismatch: DB=${payment.status}, Blockchain=${blockchainStatus}`,
            });
          }
        }
      } catch (error) {
        logger.error(`Error checking blockchain for payment ${payment.id}:`, error);
        issues.push({
          paymentId: payment.id,
          type: 'missing',
          dbRecord: payment,
          details: 'Error fetching blockchain data',
        });
      }
    }

    // Check internal consistency
    const consistencyIssues = this.checkInternalConsistency(payment);
    issues.push(...consistencyIssues);

    return issues;
  }

  /**
   * Check for duplicate payments
   */
  private async checkForDuplicate(payment: any): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM payments
      WHERE transaction_hash = $1
        AND id != $2
    `;

    const result = await this.db.query(query, [payment.transaction_hash, payment.id]);
    return parseInt(result.rows[0].count, 10) > 0;
  }

  /**
   * Check internal database consistency
   */
  private checkInternalConsistency(payment: any): PaymentMismatch[] {
    const issues: PaymentMismatch[] = [];

    // Check required fields
    if (!payment.amount || parseFloat(payment.amount) <= 0) {
      issues.push({
        paymentId: payment.id,
        type: 'amount_mismatch',
        dbRecord: payment,
        details: 'Invalid amount in database',
      });
    }

    // Check status validity
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(payment.status)) {
      issues.push({
        paymentId: payment.id,
        type: 'status_mismatch',
        dbRecord: payment,
        details: `Invalid status: ${payment.status}`,
      });
    }

    // Check timestamps
    if (new Date(payment.updated_at) < new Date(payment.created_at)) {
      issues.push({
        paymentId: payment.id,
        type: 'status_mismatch',
        dbRecord: payment,
        details: 'Updated timestamp is before created timestamp',
      });
    }

    return issues;
  }

  /**
   * Check blockchain for missing payments
   */
  private async checkBlockchainForMissingPayments(
    startDate: Date,
    endDate: Date,
  ): Promise<PaymentMismatch[]> {
    const mismatches: PaymentMismatch[] = [];

    try {
      // Get contract events for the period
      const events = await this.blockchainService.getPaymentEvents(startDate, endDate);

      for (const event of events) {
        // Check if event exists in database
        const exists = await this.paymentExistsInDb(event.transactionHash);

        if (!exists) {
          mismatches.push({
            paymentId: event.transactionHash,
            type: 'missing',
            blockchainRecord: event,
            details: 'Payment found on blockchain but not in database',
          });
        }
      }
    } catch (error) {
      logger.error('Error checking blockchain for missing payments:', error);
    }

    return mismatches;
  }

  /**
   * Check if payment exists in database
   */
  private async paymentExistsInDb(transactionHash: string): Promise<boolean> {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM payments WHERE transaction_hash = $1
      )
    `;

    const result = await this.db.query(query, [transactionHash]);
    return result.rows[0].exists;
  }

  /**
   * Attempt to resolve issues automatically
   */
  private async resolveIssues(payment: any, issues: PaymentMismatch[]): Promise<number> {
    let resolvedCount = 0;

    for (const issue of issues) {
      try {
        switch (issue.type) {
          case 'status_mismatch':
            await this.resolveStatusMismatch(payment, issue);
            resolvedCount++;
            break;

          case 'amount_mismatch':
            // Amount mismatches usually require manual intervention
            logger.warn(`Amount mismatch requires manual resolution: ${payment.id}`);
            break;

          case 'duplicate':
            await this.resolveDuplicate(payment, issue);
            resolvedCount++;
            break;

          case 'missing':
            // Missing records may require creating entries
            logger.warn(`Missing record requires manual resolution: ${payment.id}`);
            break;
        }
      } catch (error) {
        logger.error(`Error resolving issue for payment ${payment.id}:`, error);
      }
    }

    return resolvedCount;
  }

  /**
   * Resolve status mismatch
   */
  private async resolveStatusMismatch(payment: any, issue: PaymentMismatch): Promise<void> {
    if (!issue.blockchainRecord) return;

    const blockchainStatus =
      issue.blockchainRecord.confirmations > 0 ? 'completed' : 'pending';

    const query = `
      UPDATE payments
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `;

    await this.db.query(query, [blockchainStatus, payment.id]);
    logger.info(`Resolved status mismatch for payment ${payment.id}`);
  }

  /**
   * Resolve duplicate payment
   */
  private async resolveDuplicate(payment: any, issue: PaymentMismatch): Promise<void> {
    // Mark older duplicate as cancelled
    const query = `
      UPDATE payments
      SET status = 'cancelled', updated_at = NOW()
      WHERE transaction_hash = $1
        AND id != $2
        AND created_at < (SELECT created_at FROM payments WHERE id = $2)
    `;

    await this.db.query(query, [payment.transaction_hash, payment.id]);
    logger.info(`Resolved duplicate for payment ${payment.id}`);
  }

  /**
   * Save reconciliation report
   */
  private async saveReconciliationReport(result: ReconciliationResult): Promise<void> {
    const query = `
      INSERT INTO reconciliation_reports (
        checked_count,
        mismatch_count,
        resolved_count,
        unresolved_count,
        report_data,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `;

    await this.db.query(query, [
      result.totalChecked,
      result.mismatches.length,
      result.resolved,
      result.unresolved,
      JSON.stringify(result.mismatches),
    ]);
  }

  /**
   * Get reconciliation history
   */
  async getReconciliationHistory(limit: number = 10): Promise<any[]> {
    const query = `
      SELECT *
      FROM reconciliation_reports
      ORDER BY created_at DESC
      LIMIT $1
    `;

    const result = await this.db.query(query, [limit]);
    return result.rows;
  }

  /**
   * Get unresolved mismatches
   */
  async getUnresolvedMismatches(): Promise<PaymentMismatch[]> {
    const query = `
      SELECT report_data
      FROM reconciliation_reports
      WHERE unresolved_count > 0
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await this.db.query(query);
    if (result.rows.length === 0) return [];

    return JSON.parse(result.rows[0].report_data);
  }
}

