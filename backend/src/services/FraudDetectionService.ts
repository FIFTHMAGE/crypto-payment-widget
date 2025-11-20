/**
 * FraudDetectionService - AI-powered fraud detection for payments
 * @module services/FraudDetection
 */

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface FraudSignal {
  type: string;
  severity: RiskLevel;
  description: string;
  weight: number;
  timestamp: number;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  signals: FraudSignal[];
  recommendation: 'approve' | 'review' | 'reject';
  reasons: string[];
  metadata: Record<string, any>;
}

export interface TransactionPattern {
  address: string;
  averageAmount: number;
  transactionCount: number;
  uniqueRecipients: number;
  firstSeen: number;
  lastSeen: number;
  velocity: number;
}

export class FraudDetectionService {
  private blacklistedAddresses: Set<string> = new Set();
  private whitelistedAddresses: Set<string> = new Set();
  private transactionHistory: Map<string, TransactionPattern> = new Map();
  private riskThresholds = {
    low: 30,
    medium: 60,
    high: 80,
  };

  /**
   * Assess risk for a transaction
   */
  async assessRisk(transaction: {
    from: string;
    to: string;
    amount: string;
    token: string;
    metadata?: Record<string, any>;
  }): Promise<RiskAssessment> {
    const signals: FraudSignal[] = [];
    let totalScore = 0;

    // Check blacklist
    const blacklistSignal = this.checkBlacklist(transaction.from, transaction.to);
    if (blacklistSignal) {
      signals.push(blacklistSignal);
      totalScore += blacklistSignal.weight;
    }

    // Check velocity (rapid transactions)
    const velocitySignal = await this.checkVelocity(transaction.from, transaction.amount);
    if (velocitySignal) {
      signals.push(velocitySignal);
      totalScore += velocitySignal.weight;
    }

    // Check unusual amount
    const amountSignal = this.checkUnusualAmount(transaction.from, transaction.amount);
    if (amountSignal) {
      signals.push(amountSignal);
      totalScore += amountSignal.weight;
    }

    // Check new address behavior
    const newAddressSignal = this.checkNewAddress(transaction.from);
    if (newAddressSignal) {
      signals.push(newAddressSignal);
      totalScore += newAddressSignal.weight;
    }

    // Check suspicious patterns
    const patternSignals = await this.detectSuspiciousPatterns(transaction);
    signals.push(...patternSignals);
    totalScore += patternSignals.reduce((sum, s) => sum + s.weight, 0);

    // Determine risk level and recommendation
    const level = this.determineRiskLevel(totalScore);
    const recommendation = this.getRecommendation(level, signals);
    const reasons = signals.map((s) => s.description);

    return {
      score: totalScore,
      level,
      signals,
      recommendation,
      reasons,
      metadata: {
        addressReputation: await this.getAddressReputation(transaction.from),
        transactionCount: this.transactionHistory.get(transaction.from)?.transactionCount || 0,
      },
    };
  }

  /**
   * Check if addresses are blacklisted
   */
  private checkBlacklist(from: string, to: string): FraudSignal | null {
    if (this.blacklistedAddresses.has(from)) {
      return {
        type: 'blacklisted_sender',
        severity: RiskLevel.CRITICAL,
        description: 'Sender address is blacklisted',
        weight: 100,
        timestamp: Date.now(),
      };
    }

    if (this.blacklistedAddresses.has(to)) {
      return {
        type: 'blacklisted_recipient',
        severity: RiskLevel.CRITICAL,
        description: 'Recipient address is blacklisted',
        weight: 100,
        timestamp: Date.now(),
      };
    }

    return null;
  }

  /**
   * Check transaction velocity
   */
  private async checkVelocity(address: string, amount: string): Promise<FraudSignal | null> {
    const pattern = this.transactionHistory.get(address);
    if (!pattern) return null;

    // Calculate velocity (transactions per hour)
    const hoursSinceFirst = (Date.now() - pattern.firstSeen) / (1000 * 60 * 60);
    const velocity = pattern.transactionCount / Math.max(hoursSinceFirst, 1);

    if (velocity > 10) {
      // More than 10 transactions per hour
      return {
        type: 'high_velocity',
        severity: RiskLevel.HIGH,
        description: `Unusually high transaction velocity: ${velocity.toFixed(2)} tx/hour`,
        weight: 40,
        timestamp: Date.now(),
      };
    }

    if (velocity > 5) {
      return {
        type: 'elevated_velocity',
        severity: RiskLevel.MEDIUM,
        description: `Elevated transaction velocity: ${velocity.toFixed(2)} tx/hour`,
        weight: 20,
        timestamp: Date.now(),
      };
    }

    return null;
  }

  /**
   * Check for unusual transaction amounts
   */
  private checkUnusualAmount(address: string, amount: string): FraudSignal | null {
    const pattern = this.transactionHistory.get(address);
    if (!pattern || pattern.transactionCount < 5) return null;

    const amountNum = parseFloat(amount);
    const avgAmount = pattern.averageAmount;

    // Check if amount is significantly higher than average
    if (amountNum > avgAmount * 10) {
      return {
        type: 'unusual_amount',
        severity: RiskLevel.HIGH,
        description: `Amount is ${(amountNum / avgAmount).toFixed(1)}x higher than average`,
        weight: 35,
        timestamp: Date.now(),
      };
    }

    if (amountNum > avgAmount * 5) {
      return {
        type: 'elevated_amount',
        severity: RiskLevel.MEDIUM,
        description: `Amount is ${(amountNum / avgAmount).toFixed(1)}x higher than average`,
        weight: 20,
        timestamp: Date.now(),
      };
    }

    return null;
  }

  /**
   * Check if address is new
   */
  private checkNewAddress(address: string): FraudSignal | null {
    const pattern = this.transactionHistory.get(address);

    if (!pattern) {
      return {
        type: 'new_address',
        severity: RiskLevel.MEDIUM,
        description: 'First transaction from this address',
        weight: 25,
        timestamp: Date.now(),
      };
    }

    // Check if address is very new (less than 1 hour old)
    const ageHours = (Date.now() - pattern.firstSeen) / (1000 * 60 * 60);
    if (ageHours < 1) {
      return {
        type: 'very_new_address',
        severity: RiskLevel.MEDIUM,
        description: `Address is only ${ageHours.toFixed(1)} hours old`,
        weight: 20,
        timestamp: Date.now(),
      };
    }

    return null;
  }

  /**
   * Detect suspicious patterns
   */
  private async detectSuspiciousPatterns(transaction: {
    from: string;
    to: string;
    amount: string;
  }): Promise<FraudSignal[]> {
    const signals: FraudSignal[] = [];

    // Check for round amounts (possible automated bot)
    if (this.isRoundAmount(transaction.amount)) {
      signals.push({
        type: 'round_amount',
        severity: RiskLevel.LOW,
        description: 'Transaction uses round number (possible bot)',
        weight: 10,
        timestamp: Date.now(),
      });
    }

    // Check for repeated recipient
    const pattern = this.transactionHistory.get(transaction.from);
    if (pattern && pattern.uniqueRecipients === 1 && pattern.transactionCount > 5) {
      signals.push({
        type: 'single_recipient',
        severity: RiskLevel.MEDIUM,
        description: 'All transactions go to same recipient',
        weight: 25,
        timestamp: Date.now(),
      });
    }

    return signals;
  }

  /**
   * Check if amount is a round number
   */
  private isRoundAmount(amount: string): boolean {
    const amountNum = parseFloat(amount);
    return amountNum % 1 === 0 && amountNum % 10 === 0;
  }

  /**
   * Determine risk level from score
   */
  private determineRiskLevel(score: number): RiskLevel {
    if (score >= this.riskThresholds.high) return RiskLevel.CRITICAL;
    if (score >= this.riskThresholds.medium) return RiskLevel.HIGH;
    if (score >= this.riskThresholds.low) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  /**
   * Get recommendation based on risk
   */
  private getRecommendation(
    level: RiskLevel,
    signals: FraudSignal[]
  ): 'approve' | 'review' | 'reject' {
    // Auto-reject critical risk
    if (level === RiskLevel.CRITICAL) return 'reject';

    // Check for blacklist signals
    if (signals.some((s) => s.type.includes('blacklisted'))) {
      return 'reject';
    }

    // Review high risk
    if (level === RiskLevel.HIGH) return 'review';

    // Review medium risk with multiple signals
    if (level === RiskLevel.MEDIUM && signals.length > 2) {
      return 'review';
    }

    return 'approve';
  }

  /**
   * Get address reputation score
   */
  private async getAddressReputation(address: string): Promise<number> {
    if (this.whitelistedAddresses.has(address)) return 100;
    if (this.blacklistedAddresses.has(address)) return 0;

    const pattern = this.transactionHistory.get(address);
    if (!pattern) return 50; // Neutral for new addresses

    // Calculate reputation based on history
    let reputation = 50;

    // Increase reputation for older addresses
    const ageDays = (Date.now() - pattern.firstSeen) / (1000 * 60 * 60 * 24);
    reputation += Math.min(ageDays * 2, 30);

    // Increase reputation for more transactions
    reputation += Math.min(pattern.transactionCount, 20);

    return Math.min(reputation, 100);
  }

  /**
   * Record transaction
   */
  recordTransaction(from: string, to: string, amount: string): void {
    const amountNum = parseFloat(amount);

    let pattern = this.transactionHistory.get(from);
    if (!pattern) {
      pattern = {
        address: from,
        averageAmount: amountNum,
        transactionCount: 1,
        uniqueRecipients: 1,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        velocity: 0,
      };
    } else {
      // Update pattern
      pattern.averageAmount =
        (pattern.averageAmount * pattern.transactionCount + amountNum) /
        (pattern.transactionCount + 1);
      pattern.transactionCount++;
      pattern.lastSeen = Date.now();

      // Update velocity
      const hoursSinceFirst = (Date.now() - pattern.firstSeen) / (1000 * 60 * 60);
      pattern.velocity = pattern.transactionCount / Math.max(hoursSinceFirst, 1);
    }

    this.transactionHistory.set(from, pattern);
  }

  /**
   * Add address to blacklist
   */
  blacklistAddress(address: string): void {
    this.blacklistedAddresses.add(address.toLowerCase());
    this.whitelistedAddresses.delete(address.toLowerCase());
  }

  /**
   * Add address to whitelist
   */
  whitelistAddress(address: string): void {
    this.whitelistedAddresses.add(address.toLowerCase());
    this.blacklistedAddresses.delete(address.toLowerCase());
  }

  /**
   * Remove address from blacklist
   */
  removeFromBlacklist(address: string): void {
    this.blacklistedAddresses.delete(address.toLowerCase());
  }

  /**
   * Check if address is blacklisted
   */
  isBlacklisted(address: string): boolean {
    return this.blacklistedAddresses.has(address.toLowerCase());
  }

  /**
   * Check if address is whitelisted
   */
  isWhitelisted(address: string): boolean {
    return this.whitelistedAddresses.has(address.toLowerCase());
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    blacklistedCount: number;
    whitelistedCount: number;
    trackedAddresses: number;
    totalTransactions: number;
  } {
    const totalTransactions = Array.from(this.transactionHistory.values()).reduce(
      (sum, p) => sum + p.transactionCount,
      0
    );

    return {
      blacklistedCount: this.blacklistedAddresses.size,
      whitelistedCount: this.whitelistedAddresses.size,
      trackedAddresses: this.transactionHistory.size,
      totalTransactions,
    };
  }
}

export const fraudDetectionService = new FraudDetectionService();

