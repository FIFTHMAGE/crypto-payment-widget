/**
 * @title FeeCalculator
 * @description Payment amount calculator with fees
 */

export const FeeCalculator = ({ amount, feePercent = 0.25 }: { amount: string; feePercent?: number }) => {
  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * (feePercent / 100);
  const total = numAmount + fee;

  return (
    <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between"><span>Amount:</span><span>{numAmount.toFixed(4)} ETH</span></div>
      <div className="flex justify-between text-sm text-gray-600"><span>Fee ({feePercent}%):</span><span>{fee.toFixed(4)} ETH</span></div>
      <div className="flex justify-between font-bold border-t pt-2"><span>Total:</span><span>{total.toFixed(4)} ETH</span></div>
    </div>
  );
};

