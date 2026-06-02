import { useStore } from '../lib/store';
import { can } from '../lib/rbac';
import { Card, Badge, StatCard } from '../components/ui';
import { planTypes } from '../lib/mock';

export default function Products() {
  const { products, role, toggleProduct } = useStore();
  const canToggle = can(role, 'product.toggle');
  const funds = products.filter((p) => p.assetClass === 'mutual_fund');
  const stocks = products.filter((p) => p.assetClass === 'stock');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active products" value={products.filter((p) => p.isActive).length.toString()} sub={`${products.length} total`} />
        <StatCard label="Mutual funds" value={funds.length.toString()} />
        <StatCard label="Savings plan types" value={planTypes.length.toString()} />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-line p-4 font-bold">Investment products</div>
        <table className="w-full text-sm">
          <thead className="bg-soft text-left text-xs uppercase tracking-wide text-forest-deep/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Class</th>
              <th className="px-4 py-3 font-semibold">Risk</th>
              <th className="px-4 py-3 font-semibold">Unit price</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[...funds, ...stocks].map((p) => (
              <tr key={p.id} className="hover:bg-soft/60">
                <td className="px-4 py-3">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-forest-deep/50">{p.ticker ?? p.fundManager}</div>
                </td>
                <td className="px-4 py-3 capitalize text-forest-deep/70">{p.assetClass.replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  <Badge tone={p.riskLevel === 'low' ? 'green' : p.riskLevel === 'medium' ? 'amber' : 'red'}>{p.riskLevel}</Badge>
                </td>
                <td className="px-4 py-3 font-medium">
                  {p.currency === 'USD' ? '$' : '₦'}
                  {p.unitPrice.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={p.isActive ? 'green' : 'gray'}>{p.isActive ? 'active' : 'disabled'}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {canToggle ? (
                    <button
                      onClick={() => toggleProduct(p.id)}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-soft"
                    >
                      {p.isActive ? 'Disable' : 'Enable'}
                    </button>
                  ) : (
                    <span className="text-xs text-forest-deep/40">View only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-line p-4 font-bold">Savings plan types</div>
        <table className="w-full text-sm">
          <thead className="bg-soft text-left text-xs uppercase tracking-wide text-forest-deep/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Rate (p.a.)</th>
              <th className="px-4 py-3 font-semibold">Min tenor</th>
              <th className="px-4 py-3 font-semibold">Break penalty</th>
              <th className="px-4 py-3 font-semibold">Withdrawals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {planTypes.map((p) => (
              <tr key={p.id} className="hover:bg-soft/60">
                <td className="px-4 py-3">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-forest-deep/50">{p.description}</div>
                </td>
                <td className="px-4 py-3 font-medium text-forest">{p.interestRatePA}%</td>
                <td className="px-4 py-3 text-forest-deep/70">{p.minTenorDays} days</td>
                <td className="px-4 py-3 text-forest-deep/70">{Math.round(p.penaltyOnBreak * 100)}%</td>
                <td className="px-4 py-3">
                  <Badge tone={p.allowsWithdrawal ? 'green' : 'gray'}>{p.allowsWithdrawal ? 'allowed' : 'locked'}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
