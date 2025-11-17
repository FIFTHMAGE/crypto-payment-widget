/** Batch API Operations */
export const batchProcess = async (operations: any[]) => {
  return Promise.all(operations.map(op => {
    switch(op.type) {
      case 'create': return createPayment(op.data);
      case 'update': return updatePayment(op.id, op.data);
      case 'delete': return deletePayment(op.id);
      default: throw new Error('Invalid operation');
    }
  }));
};
const createPayment = (data: any) => ({ id: Date.now(), ...data });
const updatePayment = (id: string, data: any) => ({ id, ...data });
const deletePayment = (id: string) => ({ id, deleted: true });

