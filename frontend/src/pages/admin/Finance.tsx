import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import client from '../../api/client';
import { IndianRupee, Plus, Search, Wallet, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import MetricCard from '../../components/ui/MetricCard';
import SectionHeader from '../../components/ui/SectionHeader';
import Skeleton from '../../components/ui/Skeleton';

const Finance: React.FC = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [q, setQ] = useState('');
  const { register, handleSubmit, reset } = useForm();

  const fetchFees = async () => {
    const res = await client.get('/finance/all');
    setFees(res.data);
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      fetchFees(),
      client.get('/students', { ui: { silent: true } } as any),
    ])
      .then(([, studentsRes]) => {
        if (!active) return;
        setStudents(studentsRes.data.students || []);
      })
      .catch(() => {
        if (!active) return;
        setStudents([]);
        setFees([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await client.post('/finance', data);
      reset();
      fetchFees();
    } catch (error) {
      // Error handled globally
    }
  };

  const feeStats = useMemo(() => {
    const all = fees as any[];
    const byStatus = all.reduce(
      (acc, f) => {
        const status = f.status || 'Unknown';
        acc[status] = acc[status] || { count: 0, amount: 0 };
        acc[status].count += 1;
        acc[status].amount += Number(f.amount || 0);
        return acc;
      },
      {} as Record<string, { count: number; amount: number }>
    );
    const totalAmount = all.reduce((s, f) => s + Number((f as any).amount || 0), 0);
    return { byStatus, totalAmount, totalCount: all.length };
  }, [fees]);

  const filteredFees = useMemo(() => {
    const all = fees as any[];
    const query = q.trim().toLowerCase();
    return all.filter((f) => {
      if (filter !== 'All' && f.status !== filter) return false;
      if (!query) return true;
      const name = f.student?.user?.name || '';
      const roll = f.student?.rollNumber || '';
      const type = f.type || '';
      return (
        String(name).toLowerCase().includes(query) ||
        String(roll).toLowerCase().includes(query) ||
        String(type).toLowerCase().includes(query)
      );
    });
  }, [fees, filter, q]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finance"
        description="Track fees, collections, and outstanding balances."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Total fees"
          value={formatCurrency(feeStats.totalAmount)}
          icon={Wallet}
          accent="from-slate-700 to-slate-900"
          loading={loading}
        />
        <MetricCard
          label="Paid"
          value={formatCurrency(feeStats.byStatus.Paid?.amount ?? 0)}
          icon={IndianRupee}
          accent="from-emerald-600 to-teal-700"
          loading={loading}
        />
        <MetricCard
          label="Pending"
          value={formatCurrency(feeStats.byStatus.Pending?.amount ?? 0)}
          icon={AlertTriangle}
          accent="from-amber-600 to-orange-700"
          loading={loading}
        />
        <MetricCard
          label="Records"
          value={feeStats.totalCount.toLocaleString()}
          icon={Plus}
          accent="from-blue-600 to-indigo-700"
          loading={loading}
        />
      </div>

      <Card className="p-6">
        <SectionHeader title="Create fee record" description="Add a new charge for a student." />
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <select {...register('student', { required: true })} className="input">
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.user?.name} ({s.rollNumber})
              </option>
            ))}
          </select>
          <div className="relative">
            <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              {...register('amount', { required: true })}
              type="number"
              placeholder="Amount"
              className="input pl-9"
            />
          </div>
          <select {...register('type', { required: true })} className="input">
            <option value="Tuition">Tuition Fee</option>
            <option value="Hostel">Hostel Fee</option>
            <option value="Library">Library Fee</option>
            <option value="Other">Other</option>
          </select>
          <input {...register('dueDate', { required: true })} type="date" className="input" />
          <Button type="submit" leftIcon={<Plus size={18} />} className="w-full">
            Create
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <SectionHeader
          title="Fee ledger"
          description="Search and filter fee records."
          right={
            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'All' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('All')}
                type="button"
              >
                All
              </Button>
              <Button
                variant={filter === 'Paid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('Paid')}
                type="button"
              >
                Paid
              </Button>
              <Button
                variant={filter === 'Pending' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('Pending')}
                type="button"
              >
                Pending
              </Button>
            </div>
          }
        />

        <div className="mt-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by student name, roll number, or fee type…"
              className="input pl-9"
            />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-200/70 dark:divide-slate-800/70">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-slate-900/30">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Due date
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-48" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                  </tr>
                ))
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-600 dark:text-slate-400">
                    No fee records match your filters.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee: any) => (
                  <tr key={fee._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">
                      {fee.student?.user?.name || 'Unknown'}
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        {fee.student?.rollNumber || ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{fee.type}</td>
                    <td className="px-4 py-3 text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(fee.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {new Date(fee.dueDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={
                          'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border ' +
                          (fee.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/40'
                            : 'bg-amber-50 text-amber-800 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/40')
                        }
                      >
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Finance;
