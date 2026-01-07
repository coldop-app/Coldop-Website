import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const VoucherForm = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    voucherType: 'Journal',
    debitLedger: '',
    creditLedger: '',
    amount: '',
    narration: ''
  });

  const { data: ledgersData } = useQuery({
    queryKey: ['ledgers'],
    queryFn: () => storeAdminApi.getLedgers({}, adminInfo?.token || ''),
    enabled: !!adminInfo?.token
  });

  const createVoucherMutation = useMutation({
    mutationFn: (payload: {
      date: string;
      debitLedger: string;
      creditLedger: string;
      amount: number;
      narration?: string;
    }) => storeAdminApi.createVoucher(payload, adminInfo?.token || ''),
    onSuccess: () => {
      toast.success('Voucher created successfully');
      setFormData({
        voucherType: 'Journal',
        debitLedger: '',
        creditLedger: '',
        amount: '',
        narration: ''
      });
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create voucher');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.debitLedger || !formData.creditLedger || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    createVoucherMutation.mutate({
      date: date.toISOString(),
      debitLedger: formData.debitLedger,
      creditLedger: formData.creditLedger,
      amount: parseFloat(formData.amount),
      narration: formData.narration || ''
    });
  };

  const ledgers = ledgersData?.data || [];

  return (
    <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        Create Voucher Entry
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Voucher Type + Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Voucher Type
            </label>
            <Select
              value={formData.voucherType}
              onValueChange={(value) =>
                setFormData({ ...formData, voucherType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Voucher Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Journal">Journal Voucher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "dd/MM/yyyy") : "Select date"}
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Row 2: Debit + Credit Ledger */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Debit Ledger
            </label>
            <Select
              value={formData.debitLedger}
              onValueChange={(value) =>
                setFormData({ ...formData, debitLedger: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Debit Ledger" />
              </SelectTrigger>
              <SelectContent>
                {ledgers.map((ledger: any) => (
                  <SelectItem key={ledger._id} value={ledger._id}>
                    {ledger.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Credit Ledger
            </label>
            <Select
              value={formData.creditLedger}
              onValueChange={(value) =>
                setFormData({ ...formData, creditLedger: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Credit Ledger" />
              </SelectTrigger>
              <SelectContent>
                {ledgers.map((ledger: any) => (
                  <SelectItem key={ledger._id} value={ledger._id}>
                    {ledger.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 3: Amount + Narration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Amount (₹)
            </label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Narration
            </label>
            <Input
              placeholder="Description"
              value={formData.narration}
              onChange={(e) =>
                setFormData({ ...formData, narration: e.target.value })
              }
            />
          </div>
        </div>

        {/* Action */}
        <Button
          type="submit"
          disabled={createVoucherMutation.isPending}
          className="bg-green-600 text-white hover:bg-green-700 w-fit"
        >
          {createVoucherMutation.isPending ? "Creating..." : "+ Create Voucher"}
        </Button>
      </form>
    </Card>
  );
};

export default VoucherForm;
