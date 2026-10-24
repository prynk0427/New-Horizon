import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  PiggyBank, Calculator, DollarSign, RefreshCw, TrendingUp,
  AlertTriangle, CheckCircle, Info
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { budgetApi } from '@/services/api'
import type { BudgetEstimateResponse, BudgetCategory } from '@/types'

const schema = z.object({
  destination: z.string().min(2, 'Enter a destination'),
  num_travellers: z.coerce.number().int().min(1).max(50),
  num_days: z.coerce.number().int().min(1).max(365),
  budget: z.coerce.number().positive('Enter your budget'),
  currency: z.string(),
  accommodation_pref: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR', 'JPY', 'AED', 'SGD', 'THB']
const ACCOMMODATIONS = ['Hostel', 'Budget Hotel', 'Mid-range Hotel', 'Boutique Hotel', 'Luxury Resort']

const CHART_COLORS = ['#14b8a6', '#f59e0b', '#6366f1', '#ef4444', '#22c55e', '#ec4899', '#94a3b8', '#0ea5e9']

function formatCurrency(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function BudgetPage() {
  const [result, setResult] = useState<BudgetEstimateResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [editCategories, setEditCategories] = useState<BudgetCategory[]>([])
  const [userBudget, setUserBudget] = useState(0)
  const [currency, setCurrencyState] = useState('USD')

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      destination: '',
      num_travellers: 2,
      num_days: 7,
      budget: 2000,
      currency: 'USD',
      accommodation_pref: 'Mid-range Hotel',
    },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await budgetApi.estimate({
        destination: data.destination,
        num_travellers: data.num_travellers,
        num_days: data.num_days,
        budget: data.budget,
        currency: data.currency,
        accommodation_pref: data.accommodation_pref,
      })
      setResult(res)
      setEditCategories(res.categories.map(c => ({ ...c })))
      setUserBudget(data.budget)
      setCurrencyState(data.currency)
    } catch (err: any) {
      alert('Failed to estimate budget: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (index: number, value: number) => {
    const updated = editCategories.map((c, i) => i === index ? { ...c, estimated_cost: value } : c)
    setEditCategories(updated)
  }

  const customTotal = editCategories.reduce((s, c) => s + (c.estimated_cost || 0), 0)
  const customRemaining = userBudget - customTotal

  const pieData = editCategories.map(c => ({ name: c.name, value: c.estimated_cost }))
  const barData = editCategories.map((c, i) => ({ name: c.name.replace(' & ', ' & '), amount: c.estimated_cost, fill: CHART_COLORS[i % CHART_COLORS.length] }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
          <PiggyBank className="text-teal-600" size={32} /> Smart Budget Estimator
        </h1>
        <p className="text-slate-500">Get a realistic cost breakdown for your trip. <strong>All estimates are approximate</strong> — actual costs may vary.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4 sticky top-20">
            <div>
              <label className="label">Destination</label>
              <input {...register('destination')} className="input-field" placeholder="e.g. Paris, Bali, New York" />
              {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Travellers</label>
                <input {...register('num_travellers')} type="number" min={1} max={50} className="input-field" />
              </div>
              <div>
                <label className="label">Days</label>
                <input {...register('num_days')} type="number" min={1} max={365} className="input-field" />
              </div>
            </div>

            <div>
              <label className="label">Total Budget</label>
              <div className="flex gap-2">
                <select {...register('currency')} className="input-field w-24">
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input {...register('budget')} type="number" min={0} step={100} className="input-field flex-1" placeholder="2000" />
              </div>
              {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
            </div>

            <div>
              <label className="label">Accommodation Preference</label>
              <select {...register('accommodation_pref')} className="input-field">
                {ACCOMMODATIONS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <span>Estimates are based on typical costs for the region. Real prices may differ significantly.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <RefreshCw size={17} className="animate-spin" /> : <Calculator size={17} />}
              {loading ? 'Calculating…' : 'Estimate Budget'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {!result && !loading && (
            <div className="card p-12 text-center">
              <PiggyBank size={56} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Budget Breakdown Will Appear Here</h3>
              <p className="text-slate-400">Enter your trip details and click Estimate Budget to get a cost breakdown.</p>
            </div>
          )}

          {loading && (
            <div className="card p-12 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-500">Calculating estimates…</p>
            </div>
          )}

          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Warnings */}
              {result.warnings?.map((w, i) => (
                <div key={i} className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <AlertTriangle size={16} /> {w}
                </div>
              ))}

              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Total Estimated', value: formatCurrency(customTotal, currency), highlight: true },
                  { label: 'Per Traveller', value: formatCurrency(result.per_traveller, currency), highlight: false },
                  { label: 'Per Day', value: formatCurrency(result.per_day, currency), highlight: false },
                  { label: 'Remaining', value: formatCurrency(customRemaining, currency), highlight: customRemaining < 0, danger: customRemaining < 0 },
                ].map(({ label, value, highlight, danger }) => (
                  <div key={label} className={`card p-4 text-center ${danger ? 'bg-red-50 border-red-200' : ''}`}>
                    <div className={`text-lg font-bold ${danger ? 'text-red-600' : 'text-slate-900'}`}>{value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Pie chart */}
              <div className="card p-5">
                <h3 className="font-bold text-slate-900 mb-4">Expense Breakdown</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${percent > 5 ? name.split(' ')[0] : ''}`}>
                        {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value, currency), '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar chart */}
              <div className="card p-5">
                <h3 className="font-bold text-slate-900 mb-4">Category Comparison</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={40} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value, currency), 'Cost']} />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                        {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Editable categories */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Edit Category Estimates</h3>
                  <span className="text-xs text-slate-400">Drag to adjust</span>
                </div>
                <div className="space-y-3">
                  {editCategories.map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm text-slate-700 flex-1 min-w-0 truncate">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={cat.estimated_cost}
                          onChange={e => handleCategoryChange(i, Number(e.target.value))}
                          className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal-400"
                        />
                        <span className="text-xs text-slate-400 w-8">{currency}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Custom Total</span>
                  <span className={`font-bold text-lg ${customRemaining < 0 ? 'text-red-600' : 'text-teal-700'}`}>
                    {formatCurrency(customTotal, currency)}
                  </span>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 mt-3 text-xs text-amber-700 flex items-start gap-2">
                  <Info size={13} className="flex-shrink-0 mt-0.5" />
                  All figures are approximate estimates only. Verify actual prices with service providers.
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
