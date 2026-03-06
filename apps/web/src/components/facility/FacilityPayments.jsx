import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Search, 
  Filter, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  CreditCard,
  Calendar,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";

export default function FacilityPayments({ user, serviceFees, shifts }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredFees = serviceFees.filter(fee => {
    const shift = shifts.find(s => s.id === fee.shift_id);
    const matchesSearch = shift?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fee.staff_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPending = serviceFees
    .filter(f => f.status === 'pending')
    .reduce((sum, f) => sum + (f.fee_amount || 0), 0);

  const totalPaid = serviceFees
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + (f.fee_amount || 0), 0);

  const totalOverdue = serviceFees
    .filter(f => f.status === 'overdue')
    .reduce((sum, f) => sum + (f.fee_amount || 0), 0);

  const totalSpend = shifts
    .filter(s => s.status === 'completed' || s.status === 'filled')
    .reduce((sum, s) => sum + (s.hourly_rate * 8 * (s.positions_filled || 1)), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Staffing Spend</p>
                <p className="text-2xl font-bold text-gray-900">${totalSpend.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Fees</p>
                <p className="text-2xl font-bold text-amber-600">${totalPending.toFixed(2)}</p>
              </div>
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Fees</p>
                <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">${totalOverdue.toFixed(2)}</p>
              </div>
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link to={createPageUrl("Billing")}>
          <Button className="bg-gradient-to-r from-blue-600 to-teal-600">
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Subscription
          </Button>
        </Link>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Statement
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search fees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Platform Fee Explanation */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">How Platform Fees Work</h3>
              <p className="text-sm text-blue-700 mt-1">
                A 5% platform fee is calculated on each filled shift (hourly rate × hours worked). 
                Fees are billed weekly and due within 7 days. This supports credential verification, 
                matching algorithms, and 24/7 support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fees List */}
      {filteredFees.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No platform fees yet</p>
            <p className="text-sm text-gray-400 mt-1">Fees are generated when shifts are filled</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredFees.map((fee) => {
                const shift = shifts.find(s => s.id === fee.shift_id);
                
                return (
                  <div 
                    key={fee.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        fee.status === 'paid' ? 'bg-green-100' :
                        fee.status === 'overdue' ? 'bg-red-100' :
                        'bg-amber-100'
                      }`}>
                        {fee.status === 'paid' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : fee.status === 'overdue' ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{shift?.title || 'Shift'}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span>${fee.shift_rate}/hr × {fee.shift_hours}hrs × 5%</span>
                          {fee.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {format(new Date(fee.due_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${fee.fee_amount?.toFixed(2)}</p>
                      </div>
                      <Badge className={
                        fee.status === 'paid' ? 'bg-green-100 text-green-700' :
                        fee.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }>
                        {fee.status}
                      </Badge>
                      {fee.status === 'pending' && (
                        <Button size="sm">Pay Now</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/25</p>
              </div>
            </div>
            <Link to={createPageUrl("Billing")}>
              <Button variant="outline" size="sm">Update</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}