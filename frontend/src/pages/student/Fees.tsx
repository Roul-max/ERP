import React, { useEffect, useState } from "react";
import { CreditCard, IndianRupee } from "lucide-react";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { formatCurrency } from "../../utils/format";
import { toastError, toastSuccess } from "../../utils/toast";

const Fees: React.FC = () => {
  const [fees, setFees] = useState([]);

  const fetchFees = async () => {
    const res = await client.get('/finance/my');
    setFees(res.data);
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handlePay = async (id: string) => {
    if(confirm('Proceed to payment gateway simulation?')) {
        try {
          await client.put(`/finance/${id}/pay`);
          toastSuccess("Payment successful");
          fetchFees();
        } catch {
          toastError("Payment failed");
        }
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees & payments"
        description="Review fee dues and simulate payments."
      />
      
      <div className="grid gap-6">
        {fees.map((fee: any) => (
          <Card
            key={fee._id}
            className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-300">
                  <IndianRupee size={24} />
               </div>
               <div>
                 <h3 className="font-bold text-lg text-gray-900 dark:text-white">{fee.type}</h3>
                 <p className="text-gray-500 dark:text-gray-400">Due: {new Date(fee.dueDate).toLocaleDateString('en-IN')}</p>
                 {fee.status === 'Paid' && <p className="text-xs text-green-600 font-medium mt-1">Txn: {fee.transactionId}</p>}
               </div>
            </div>
            
            <div className="flex items-center gap-6">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(fee.amount)}</span>
                {fee.status === 'Pending' ? (
                    <Button 
                        onClick={() => handlePay(fee._id)}
                        leftIcon={<CreditCard size={18} />}
                        className="bg-green-600 hover:bg-green-700 border border-green-600/30 shadow-sm shadow-green-600/20"
                    >
                        Pay now
                    </Button>
                ) : (
                    <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-bold border border-green-200 dark:border-green-800">Paid</span>
                )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Fees;
