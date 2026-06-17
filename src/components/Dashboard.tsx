import React from 'react';
import { Agent, Capability, Evidence, QuarantinedTicket } from '../types';
import { ShieldCheck, ShieldAlert, Cpu, Database, Landmark, RefreshCw, BarChart2, Activity } from 'lucide-react';

interface DashboardProps {
  agents: Agent[];
  capabilities: Capability[];
  quarantineTickets: QuarantinedTicket[];
  ledger: Evidence[];
  onToggleAgentStatus: (agentId: string) => void;
  onResetSystem: () => void;
  onSelectTab: (tab: string) => void;
}

export default function Dashboard({
  agents,
  capabilities,
  quarantineTickets,
  ledger,
  onToggleAgentStatus,
  onResetSystem,
  onSelectTab
}: DashboardProps) {
  // Stats
  const activeAgents = agents.filter(a => a.status === 'active');
  const avgTrustScore = Math.round(agents.reduce((acc, curr) => acc + curr.trustScore, 0) / agents.length);
  const totalAnomalies = agents.reduce((acc, curr) => acc + curr.anomalyCount, 0);
  const totalBudgetLimit = agents.reduce((acc, curr) => acc + curr.budgetLimit, 0);
  const totalBudgetUsed = agents.reduce((acc, curr) => acc + curr.budgetUsed, 0);
  const pendingQuarantines = quarantineTickets.filter(t => t.status === 'pending').length;

  return (
    <div id="dashboard-tab" className="space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#0F1115] border border-[#23272E] rounded">
        <div>
          <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
            <Landmark className="w-4 h-4 text-blue-500" />
            Compliance Status Command Center
          </h2>
          <p className="text-[10px] text-gray-500 mt-1 font-mono">
            Governing automated machine capabilities with zero-trust cryptographic attestations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-400 bg-[#0B0C0E] px-2 py-1 rounded border border-[#23272E]">
            LOCALE_TIME: 2026-06-16 (UTC-7)
          </span>
          <button
            id="reset-state-btn"
            onClick={onResetSystem}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] text-blue-400 hover:text-white bg-[#15181E] hover:bg-[#1A1D23] border border-[#23272E] transition-all rounded font-mono uppercase"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Base Register
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-[#0F1115] border border-[#23272E] p-4 rounded relative overflow-hidden group">
          <div className="absolute right-2 top-2 text-[#23272E] opacity-25 pointer-events-none group-hover:scale-110 transition-transform">
            <Cpu className="w-12 h-12" />
          </div>
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Governed Agents</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white">{agents.length}</span>
            <span className="text-[10px] text-green-400 font-mono flex items-center gap-0.5">
              ● {activeAgents.length} Active
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1 font-mono">Autonomous software entities</p>
        </div>

        {/* Stat 2 */}
        <div className="bg-[#0F1115] border border-[#23272E] p-4 rounded relative overflow-hidden group">
          <div className="absolute right-2 top-2 text-[#23272E] opacity-25 pointer-events-none group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sovereign Trust Rating</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-blue-400">{avgTrustScore}</span>
            <span className="text-[10px] text-gray-500 font-mono">/ 100 avg</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1 font-mono">Weighted transaction adherence</p>
        </div>

        {/* Stat 3 */}
        <div className="bg-[#0F1115] border border-[#23272E] p-4 rounded relative overflow-hidden group">
          <div className="absolute right-2 top-2 text-[#23272E] opacity-25 pointer-events-none group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Active Quarantines</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-amber-500">{pendingQuarantines}</span>
            <span className="text-[10px] text-gray-500 font-mono">held limits</span>
          </div>
          <button
            id="view-quarantine-link"
            onClick={() => onSelectTab('quarantine')}
            className="text-[10px] text-blue-400 hover:underline mt-1 block h-4 text-left font-mono"
          >
            Requires Quorum Signature →
          </button>
        </div>

        {/* Stat 4 */}
        <div className="bg-[#0F1115] border border-[#23272E] p-4 rounded relative overflow-hidden group">
          <div className="absolute right-2 top-2 text-[#23272E] opacity-25 pointer-events-none group-hover:scale-110 transition-transform">
            <Activity className="w-12 h-12" />
          </div>
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">PGL Ledger Entries</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-green-400">{ledger.length}</span>
            <span className="text-[10px] text-gray-500 font-mono">Attested</span>
          </div>
          <button
            id="view-blockchain-link"
            onClick={() => onSelectTab('ledger')}
            className="text-[10px] text-blue-400 hover:underline mt-1 block h-4 text-left font-mono"
          >
            Browse Block History →
          </button>
        </div>
      </div>

      {/* Grid: Financial Footprints & Compliance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progress Tracker (Left) */}
        <div className="bg-[#0F1115] border border-[#23272E] p-4 rounded space-y-4 col-span-1">
          <div className="flex justify-between items-center border-b border-[#23272E] pb-3">
            <h3 className="text-xs font-bold text-[#D1D5DB] uppercase tracking-wider">Budget Quota Compliance</h3>
            <span className="bg-blue-900/30 text-blue-400 border border-blue-900/40 text-[9px] px-2 py-0.5 rounded font-mono">
              DAILY_LIMIT
            </span>
          </div>
          <div className="space-y-4 py-1">
            <div>
              <div className="flex justify-between text-[11px] mb-1 font-mono">
                <span className="text-gray-400">Collective Credit Expense</span>
                <span className="text-white font-medium">
                  {totalBudgetUsed} / {totalBudgetLimit} Credits
                </span>
              </div>
              <div className="h-1.5 bg-[#0B0C0E] rounded-full overflow-hidden border border-[#23272E]">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-400 transition-all duration-500"
                  style={{ width: `${Math.min((totalBudgetUsed / totalBudgetLimit) * 100, 100).toFixed(1)}%` }}
                />
              </div>
            </div>

            {/* Micro details */}
            <div className="grid grid-cols-2 gap-3 text-[11px] bg-[#0B0C0E] p-3 rounded border border-[#23272E] font-mono">
              <div>
                <div className="text-gray-500 uppercase text-[9px]">Unused Capacity</div>
                <div className="text-gray-300 font-bold mt-1">
                  {totalBudgetLimit - totalBudgetUsed} Cr
                </div>
              </div>
              <div>
                <div className="text-gray-500 uppercase text-[9px]">Usage Coefficient</div>
                <div className="text-gray-300 font-bold mt-1">
                  {((totalBudgetUsed / totalBudgetLimit) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="border-t border-[#23272E] pt-3">
              <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Cost Category Allocation</h4>
              <div className="space-y-2 font-mono text-[10px]">
                <div className="flex justify-between text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-sm" />
                    Search Query (5cr/req)
                  </span>
                  <span className="text-gray-300">35%</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-sm" />
                    Database Sync Actions (50cr/req)
                  </span>
                  <span className="text-gray-300">45%</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-sm" />
                    Financial Payout Events (200cr/req)
                  </span>
                  <span className="text-gray-300">20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Trend Chart (Right) */}
        <div className="bg-[#0F1115] border border-[#23272E] p-4 rounded col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center border-b border-[#23272E] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#D1D5DB] uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-green-400" />
                7-Day Interaction Compliance Log
              </h3>
            </div>
            <span className="text-gray-400 text-[10px] font-mono">100% Attestation Validation Rate</span>
          </div>

          {/* Clean custom SVG chart */}
          <div className="relative">
            <svg viewBox="0 0 500 160" className="w-full h-auto text-[#23272E]">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="480" y2="20" stroke="#23272E" strokeWidth="0.5" strokeDasharray="3,3" />
              <line x1="30" y1="60" x2="480" y2="60" stroke="#23272E" strokeWidth="0.5" strokeDasharray="3,3" />
              <line x1="30" y1="100" x2="480" y2="100" stroke="#23272E" strokeWidth="0.5" strokeDasharray="3,3" />
              <line x1="30" y1="140" x2="480" y2="140" stroke="#23272E" strokeWidth="1" />

              {/* Data Lines & Shading - Compliance Level */}
              <defs>
                <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 50 140 L 50 110 L 120 80 L 190 120 L 260 40 L 330 90 L 400 35 L 470 42 L 470 140 Z"
                fill="url(#chart-area-grad)"
              />
              <path
                d="M 50 110 L 120 80 L 190 120 L 260 40 L 330 90 L 400 35 L 470 42"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />

              {/* Secure Transaction Points */}
              <circle cx="50" cy="110" r="3" fill="#0B0C0E" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx="120" cy="80" r="3" fill="#0B0C0E" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx="190" cy="120" r="3" fill="#0B0C0E" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx="260" cy="40" r="3" fill="#0B0C0E" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx="330" cy="90" r="3" fill="#0B0C0E" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx="400" cy="35" r="3" fill="#0B0C0E" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx="470" cy="42" r="3" fill="#0B0C0E" stroke="#3b82f6" strokeWidth="1.5" />

              {/* Day Labels */}
              <text x="50" y="155" textAnchor="middle" fill="#4b5563" className="text-[9px] font-mono">10 JUN</text>
              <text x="120" y="155" textAnchor="middle" fill="#4b5563" className="text-[9px] font-mono">11 JUN</text>
              <text x="190" y="155" textAnchor="middle" fill="#4b5563" className="text-[9px] font-mono">12 JUN</text>
              <text x="260" y="155" textAnchor="middle" fill="#4b5563" className="text-[9px] font-mono">13 JUN</text>
              <text x="330" y="155" textAnchor="middle" fill="#4b5563" className="text-[9px] font-mono">14 JUN</text>
              <text x="400" y="155" textAnchor="middle" fill="#4b5563" className="text-[9px] font-mono">15 JUN</text>
              <text x="470" y="155" textAnchor="middle" fill="#4b5563" className="text-[9px] font-mono">16 JUN</text>

              {/* Y Axis Guides */}
              <text x="24" y="23" textAnchor="end" fill="#4b5563" className="text-[8px] font-mono">5k ops</text>
              <text x="24" y="63" textAnchor="end" fill="#4b5563" className="text-[8px] font-mono">3k ops</text>
              <text x="24" y="103" textAnchor="end" fill="#4b5563" className="text-[8px] font-mono">1k ops</text>
            </svg>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-500 bg-[#0B0C0E] px-3 py-1.5 rounded border border-[#23272E] font-mono">
            <span>● <strong>Interactive baseline</strong> learns typical behavior patterns from historical nodes.</span>
            <span className="text-green-400 uppercase">Audit status: Clean</span>
          </div>
        </div>
      </div>

      {/* Directory & Active Governance Lifecycle Panel */}
      <div className="bg-[#0F1115] border border-[#23272E] p-4 rounded">
        <div className="flex justify-between items-center border-b border-[#23272E] pb-3 mb-4">
          <h3 className="text-xs font-bold text-[#D1D5DB] uppercase tracking-wider">
            Agent Governance Lifecycle Registry
          </h3>
          <span className="text-[10px] text-gray-500 font-mono text-right">Manage agent authorizations & lifecycle state</span>
        </div>

        <div className="overflow-x-auto">
          <table id="agents-lifecycle-table" className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#23272E] text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2">Agent Signature Identity</th>
                <th className="py-2">Owner Unit</th>
                <th className="py-2">Trust rating</th>
                <th className="py-2">Success Index</th>
                <th className="py-2">Anomaly Counter</th>
                <th className="py-2">Core framework</th>
                <th className="py-2">Operational quota</th>
                <th className="py-2 text-right">Lifecycle status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23272E]/50">
              {agents.map(agent => (
                <tr key={agent.id} className="hover:bg-[#15181E]/40 transition-colors">
                  <td className="py-2.5">
                    <span className="font-bold text-white block text-[11px] font-sans">{agent.name}</span>
                    <span className="text-[9px] text-gray-600 block truncate max-w-xs">{agent.publicKey}</span>
                  </td>
                  <td className="py-2.5 text-gray-400">{agent.ownerId}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-sm ${
                        agent.trustScore >= 80 ? 'bg-green-400' :
                        agent.trustScore >= 50 ? 'bg-amber-400' : 'bg-red-500'
                      }`} />
                      <span className="font-bold text-gray-200">{agent.trustScore}</span>
                      <span className="text-[10px] text-gray-600">/100</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-gray-300">{(agent.successRate * 100).toFixed(0)}%</td>
                  <td className="py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      agent.anomalyCount === 0 ? 'bg-[#0B0C0E] text-gray-500 border border-[#23272E]' :
                      agent.anomalyCount < 3 ? 'bg-amber-950/20 text-amber-400 border border-amber-900/40' :
                      'bg-red-950/20 text-red-400 border border-red-900/40'
                    }`}>
                      {agent.anomalyCount} anomalies
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-400">{agent.framework}</td>
                  <td className="py-2.5">
                    <div className="space-y-1 w-24">
                      <div className="flex justify-between text-[9px] text-gray-600">
                        <span>{agent.budgetUsed}cr</span>
                        <span>{agent.budgetLimit}cr</span>
                      </div>
                      <div className="h-1 bg-[#0B0C0E] rounded-full overflow-hidden border border-[#23272E]">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(agent.budgetUsed / agent.budgetLimit) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      id={`toggle-agent-${agent.id}`}
                      onClick={() => onToggleAgentStatus(agent.id)}
                      className={`px-2 py-0.5 text-[10px] uppercase font-bold transition-all rounded font-mono border ${
                        agent.status === 'active'
                          ? 'bg-green-950/20 text-green-400 hover:bg-red-950/20 hover:text-red-400 border-green-9050 border-green-900/40 hover:border-red-900/40'
                          : 'bg-red-950/20 text-red-400 hover:bg-green-950/20 hover:text-green-400 border-red-900/40 hover:border-green-900/40'
                      }`}
                    >
                      {agent.status === 'active' ? 'ACTIVE (SUSPEND)' : 'SUSPENDED (RESUME)'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
