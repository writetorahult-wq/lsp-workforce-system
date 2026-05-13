import { DollarSign, Download, FileText, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function PayrollDashboard() {
  const currentPayroll = {
    grossPay: 3250,
    netPay: 2438,
    taxes: 650,
    deductions: 162,
  };

  const yearToDate = {
    gross: 19500,
    net: 14628,
    taxes: 3900,
    deductions: 972,
  };

  const payHistory = [
    { month: "Jan", amount: 3250 },
    { month: "Feb", amount: 3250 },
    { month: "Mar", amount: 3250 },
    { month: "Apr", amount: 3250 },
    { month: "May", amount: 3250 },
    { month: "Jun", amount: 3250 },
  ];

  const payslips = [
    {
      id: 1,
      period: "April 2026",
      payDate: "May 1, 2026",
      gross: 3250,
      net: 2438,
      status: "paid",
    },
    {
      id: 2,
      period: "March 2026",
      payDate: "Apr 1, 2026",
      gross: 3250,
      net: 2438,
      status: "paid",
    },
    {
      id: 3,
      period: "February 2026",
      payDate: "Mar 1, 2026",
      gross: 3250,
      net: 2438,
      status: "paid",
    },
    {
      id: 4,
      period: "January 2026",
      payDate: "Feb 1, 2026",
      gross: 3250,
      net: 2438,
      status: "paid",
    },
  ];

  const taxDocuments = [
    { name: "W-2 Form 2025", date: "Jan 31, 2026", type: "Tax Form" },
    { name: "W-4 Form", date: "Jan 1, 2026", type: "Tax Form" },
    { name: "Benefits Summary 2026", date: "Dec 15, 2025", type: "Benefits" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payroll Dashboard</h1>
        <p className="text-gray-600 mt-1">View your salary, payslips, and tax documents</p>
      </div>

      {/* Current Payroll Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Gross Pay</h3>
          </div>
          <p className="text-4xl font-bold">${currentPayroll.grossPay.toLocaleString()}</p>
          <p className="text-sm text-blue-100 mt-2">Current Period</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Net Pay</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">${currentPayroll.netPay.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">Take Home</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Taxes</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">${currentPayroll.taxes.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">Withheld</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Deductions</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">${currentPayroll.deductions.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">Benefits & Other</p>
        </div>
      </div>

      {/* Year to Date Summary & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Year to Date</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <span className="text-gray-600">Gross Pay</span>
              <span className="font-bold text-gray-900">${yearToDate.gross.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <span className="text-gray-600">Net Pay</span>
              <span className="font-bold text-green-600">${yearToDate.net.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <span className="text-gray-600">Taxes</span>
              <span className="font-bold text-gray-900">${yearToDate.taxes.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Deductions</span>
              <span className="font-bold text-gray-900">${yearToDate.deductions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Pay History</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={payHistory}>
              <CartesianGrid key="grid-payroll" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis key="xaxis-payroll" dataKey="month" stroke="#6b7280" />
              <YAxis key="yaxis-payroll" stroke="#6b7280" />
              <Tooltip
                key="tooltip-payroll"
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar key="bar-amount" dataKey="amount" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Payslips */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Payslips</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Pay Period
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Pay Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Gross Pay
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Net Pay
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payslips.map((slip) => (
                <tr key={slip.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {slip.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {slip.payDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${slip.gross.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${slip.net.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Documents */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Tax Documents</h2>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {taxDocuments.map((doc, idx) => (
            <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {doc.type} • {doc.date}
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
