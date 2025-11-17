/** Payment Reconciliation */
export class ReconciliationService {
  async reconcile(internalPayments: any[], blockchainPayments: any[]) {
    const matched = [];
    const unmatched = [];
    
    for (const internal of internalPayments) {
      const match = blockchainPayments.find(bp => bp.hash === internal.txHash);
      match ? matched.push({ internal, blockchain: match }) : unmatched.push(internal);
    }
    
    return { matched, unmatched, discrepancies: unmatched.length };
  }
}

