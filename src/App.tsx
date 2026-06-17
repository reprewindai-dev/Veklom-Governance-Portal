/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_AGENTS,
  INITIAL_CAPABILITIES,
  INITIAL_POLICIES,
  INITIAL_LEDGER
} from './scenarios';
import { Agent, Capability, Policy, Evidence, QuarantinedTicket, PolicyRule, SimulationResult } from './types';

// Tab components
import Dashboard from './components/Dashboard';
import PipelineVisualizer from './components/PipelineVisualizer';
import PolicyManager from './components/PolicyManager';
import QuarantineCenter from './components/QuarantineCenter';
import LedgerExplorer from './components/LedgerExplorer';

// Styling utilities & layout icons
import {
  ShieldAlert,
  Cpu,
  Bookmark,
  Scale,
  Signature,
  Database,
  Activity,
  UserCheck,
  Zap,
  Radio,
  Clock as ClockIcon
} from 'lucide-react';

export default function App() {
  // Tabs: 'dashboard' | 'visualizer' | 'policies' | 'quarantine' | 'ledger'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Master local state
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [capabilities] = useState<Capability[]>(INITIAL_CAPABILITIES);
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [ledger, setLedger] = useState<Evidence[]>(INITIAL_LEDGER);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scen-standard');

  // Pre-populate quarantine ticket store with 1 preset ticket (Suspicious DB Delete) for playability!
  const [quarantineTickets, setQuarantineTickets] = useState<QuarantinedTicket[]>([
    {
      ticketId: 'TKT-992A-SEC',
      connectionId: 'conn_preset_94fd23a',
      agentId: 'agent-db-sync',
      agentName: 'SynclonObsoleteAgent',
      capabilityId: 'db-delete',
      capabilityName: 'DatabaseDeleter',
      timestamp: '2026-06-16T03:00:00-07:00',
      anomalies: [
        'Cascading database truncation requires elevated quorum consensus',
        'Temporal warning: Action triggered outside normal operating hours (3:00 AM local)',
        'Budget advisory: synclon-agent has depleted 98% of credit boundaries (Used 980 of 1000)'
      ],
      approvalsCollected: [],
      status: 'pending',
      inputArgs: { recordId: 'audit_archive_2020', confirm: true }
    }
  ]);

  // Dynamic date state for real time clock simulation
  const [virtTime, setVirtTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to realistic EU compliance tracker timezone simulation
      setVirtTime(now.toLocaleTimeString() + ' (GMT-7)');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // System State Reset
  const handleResetSystem = () => {
    setAgents(INITIAL_AGENTS.map(a => ({ ...a })));
    setPolicies(INITIAL_POLICIES.map(p => ({ ...p, rules: [...p.rules] })));
    setLedger(INITIAL_LEDGER.map(l => ({ ...l })));
    setQuarantineTickets([
      {
        ticketId: 'TKT-992A-SEC',
        connectionId: 'conn_preset_94fd23a',
        agentId: 'agent-db-sync',
        agentName: 'SynclonObsoleteAgent',
        capabilityId: 'db-delete',
        capabilityName: 'DatabaseDeleter',
        timestamp: '2026-06-16T03:00:00-07:00',
        anomalies: [
          'Cascading database truncation requires elevated quorum consensus',
          'Temporal warning: Action triggered outside normal operating hours (3:00 AM local)',
          'Budget advisory: synclon-agent has depleted 98% of credit boundaries (Used 980 of 1000)'
        ],
        approvalsCollected: [],
        status: 'pending',
        inputArgs: { recordId: 'audit_archive_2020', confirm: true }
      }
    ]);
    setActiveScenarioId('scen-standard');
    alert('System state registries reloaded autonomously. Clean audit baselines compiled.');
  };

  // Toggle active agent state
  const handleToggleAgentStatus = (agentId: string) => {
    setAgents(prev =>
      prev.map(agent => {
        if (agent.id === agentId) {
          const nextStatus = agent.status === 'active' ? 'suspended' : 'active';
          return { ...agent, status: nextStatus };
        }
        return agent;
      })
    );
  };

  // Dynamic success/credits callback when pipeline simulation ends successfully
  const handleSimulationSuccess = (res: SimulationResult) => {
    if (res.status === 'authorized' && res.evidence) {
      // Append block
      setLedger(prev => [res.evidence!, ...prev]);

      // Deduct budget & increase trust
      setAgents(prev =>
        prev.map(agent => {
          if (agent.id === res.agentId) {
            const expense = res.evidence?.what.capabilityId === 'db-read' ? 8 : 5;
            return {
              ...agent,
              trustScore: Math.min(100, agent.trustScore + 2),
              budgetUsed: Math.min(agent.budgetLimit, agent.budgetUsed + expense)
            };
          }
          return agent;
        })
      );
    } else if (res.status === 'quarantined' && res.quarantinedTicket) {
      // Add ticket to quarantine queue
      setQuarantineTickets(prev => {
        if (prev.some(t => t.ticketId === res.quarantinedTicket?.ticketId)) return prev;
        return [res.quarantinedTicket!, ...prev];
      });

      // Penalize trust & increase anomaly count
      setAgents(prev =>
        prev.map(agent => {
          if (agent.id === res.agentId) {
            return {
              ...agent,
              trustScore: Math.max(0, agent.trustScore - 15),
              anomalyCount: agent.anomalyCount + 1
            };
          }
          return agent;
        })
      );
    } else if (res.status === 'denied') {
      // Basic security denial penalty
      setAgents(prev =>
        prev.map(agent => {
          if (agent.id === res.agentId) {
            const anomalyBonus = res.capabilityId === 'search' ? 1 : 0; // Replay attack check
            return {
              ...agent,
              trustScore: Math.max(0, agent.trustScore - 10),
              anomalyCount: agent.anomalyCount + anomalyBonus
            };
          }
          return agent;
        })
      );
    }
  };

  // Human Board multi-sig approved quarantine ticket execution
  const handleApproveQuarantineTicket = (
    ticketId: string,
    updatedTicket: QuarantinedTicket,
    newEvidence: Evidence
  ) => {
    // Remove / Mark Approved
    setQuarantineTickets(prev => prev.filter(t => t.ticketId !== ticketId));

    // Dedut final credits and apply success/override metrics
    setAgents(prev =>
      prev.map(agent => {
        if (agent.id === updatedTicket.agentId) {
          const usageIncrease = updatedTicket.capabilityId === 'db-delete' ? 50 : 200;
          return {
            ...agent,
            budgetUsed: Math.min(agent.budgetLimit, agent.budgetUsed + usageIncrease),
            trustScore: Math.max(0, agent.trustScore - 5) // Approved override carries minor operational score decay
          };
        }
        return agent;
      })
    );
  };

  const handleDenyQuarantineTicket = (ticketId: string) => {
    setQuarantineTickets(prev => prev.filter(t => t.ticketId !== ticketId));
  };

  // Add rule exception helper
  const handleAddPolicyRule = (policyId: string, rule: PolicyRule) => {
    setPolicies(prev =>
      prev.map(policy => {
        if (policy.id === policyId) {
          return {
            ...policy,
            rules: [...policy.rules, rule]
          };
        }
        return policy;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#D1D5DB] flex flex-col font-sans select-none antialiased">
      {/* Top Universal Header */}
      <header className="bg-[#0B0C0E] border-b border-[#23272E] px-6 h-14 shrink-0 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center p-1 shadow-sm">
            <UserCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white uppercase font-mono">
                VEKLOM
              </span>
              <span className="bg-blue-900/30 text-blue-400 border border-blue-900/40 text-[9px] font-mono px-1.5 py-0.5 rounded tracking-widest font-semibold uppercase">
                COGNITIVE_SHIELD
              </span>
            </div>
            <p className="text-[9px] text-gray-500 font-mono tracking-wide">
              GOVERNANCE PROTOCOL v2.0
            </p>
          </div>
        </div>

        {/* Global telemetry variables */}
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="hidden md:flex items-center gap-1.5 text-gray-500">
            <ClockIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>{virtTime || '...' }</span>
          </div>
          <div className="flex items-center gap-2 text-green-400 bg-green-950/20 border border-green-900/40 px-2 py-0.5 rounded text-[9px] uppercase font-semibold">
            <Radio className="w-2.5 h-2.5 text-green-400 animate-pulse" />
            Policy Engine active
          </div>
        </div>
      </header>

      {/* Primary Workspace Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0">
        {/* Navigation Sidebar */}
        <aside className="bg-[#0B0C0E] border-r border-[#23272E] lg:w-64 shrink-0 flex flex-col justify-between py-4 px-3 select-none">
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 tracking-widest font-bold uppercase px-3 block">
                Infrastructure
              </span>
              <nav className="space-y-1 pt-1.5">
                {/* Tab 1 */}
                <button
                  id="tab-dashboard"
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-[#1A1D23] text-white border border-[#23272E]'
                      : 'text-gray-400 hover:bg-[#15181E] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    Global Command
                  </span>
                  <span className="text-[9px] bg-[#0B0C0E] font-mono text-gray-500 px-1.5 py-0.5 rounded border border-[#23272E]">
                    Live
                  </span>
                </button>

                {/* Tab 2 */}
                <button
                  id="tab-visualizer"
                  onClick={() => setActiveTab('visualizer')}
                  className={`w-full text-left py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'visualizer'
                      ? 'bg-[#1A1D23] text-white border border-[#23272E]'
                      : 'text-gray-400 hover:bg-[#15181E] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Capability Mesh
                  </span>
                  <span className="text-[9px] bg-[#0B0C0E] font-mono text-gray-500 px-1.5 py-0.5 rounded border border-[#23272E]">
                    Mesh
                  </span>
                </button>

                {/* Tab 3 */}
                <button
                  id="tab-policies"
                  onClick={() => setActiveTab('policies')}
                  className={`w-full text-left py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'policies'
                      ? 'bg-[#1A1D23] text-white border border-[#23272E]'
                      : 'text-gray-400 hover:bg-[#15181E] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5 text-emerald-400" />
                    Audit & Compliance
                  </span>
                  <span className="text-[9px] bg-[#0B0C0E] font-mono text-gray-500 px-1.5 py-0.5 rounded border border-[#23272E]">
                    Rules
                  </span>
                </button>

                {/* Tab 4 */}
                <button
                  id="tab-quarantine"
                  onClick={() => setActiveTab('quarantine')}
                  className={`w-full text-left py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'quarantine'
                      ? 'bg-[#1A1D23] text-white border border-[#23272E]'
                      : 'text-gray-400 hover:bg-[#15181E] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Signature className="w-3.5 h-3.5 text-red-400" />
                    Quarantine Zone
                  </span>
                  {quarantineTickets.filter(t => t.status === 'pending').length > 0 && (
                    <span className="bg-red-950/40 text-red-400 border border-red-900/40 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {quarantineTickets.filter(t => t.status === 'pending').length}
                    </span>
                  )}
                </button>

                {/* Tab 5 */}
                <button
                  id="tab-ledger"
                  onClick={() => setActiveTab('ledger')}
                  className={`w-full text-left py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'ledger'
                      ? 'bg-[#1A1D23] text-white border border-[#23272E]'
                      : 'text-gray-400 hover:bg-[#15181E] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                    PGL Ledger
                  </span>
                  <span className="text-[9px] bg-[#0B0C0E] font-mono text-gray-500 px-1.5 py-0.5 rounded border border-[#23272E]">
                    {ledger.length}
                  </span>
                </button>
              </nav>
            </div>

            {/* Quick Trigger Scenarios Selector Sidebar */}
            <div className="hidden lg:block space-y-2 border-t border-[#23272E] pt-5">
              <span className="text-[10px] text-gray-500 tracking-widest font-semibold uppercase px-2 block">
                Quick Simulation Targets
              </span>
              <div className="space-y-1 text-xs">
                <button
                  id="sec-trigger-scen1"
                  onClick={() => {
                    setActiveScenarioId('scen-standard');
                    setActiveTab('visualizer');
                  }}
                  className="w-full text-left px-2 py-1 rounded text-[11px] text-gray-400 hover:bg-[#15181E] hover:text-white block border border-transparent"
                >
                  ➔ 1. Compliant Query Run
                </button>
                <button
                  id="sec-trigger-scen2"
                  onClick={() => {
                    setActiveScenarioId('scen-quarantine');
                    setActiveTab('visualizer');
                  }}
                  className="w-full text-left px-2 py-1 rounded text-[11px] text-gray-400 hover:bg-[#15181E] hover:text-white block border border-transparent"
                >
                  ➔ 2. Trigger Quarantine Warning
                </button>
                <button
                  id="sec-trigger-scen3"
                  onClick={() => {
                    setActiveScenarioId('scen-replay');
                    setActiveTab('visualizer');
                  }}
                  className="w-full text-left px-2 py-1 rounded text-[11px] text-gray-400 hover:bg-[#15181E] hover:text-white block border border-transparent"
                >
                  ➔ 3. Replay Exploit Attack
                </button>
                <button
                  id="sec-trigger-scen4"
                  onClick={() => {
                    setActiveScenarioId('scen-budget');
                    setActiveTab('visualizer');
                  }}
                  className="w-full text-left px-2 py-1 rounded text-[11px] text-gray-400 hover:bg-[#15181E] hover:text-white block border border-transparent"
                >
                  ➔ 4. Quota Overflow Block
                </button>
                <button
                  id="sec-trigger-scen5"
                  onClick={() => {
                    setActiveScenarioId('scen-delegated');
                    setActiveTab('visualizer');
                  }}
                  className="w-full text-left px-2 py-1 rounded text-[11px] text-gray-400 hover:bg-[#15181E] hover:text-white block border border-transparent"
                >
                  ➔ 5. Governed Delegation Hops
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Footer Credit line */}
          <div className="hidden lg:block border-t border-[#23272E] pt-4 text-[10px] text-gray-600 px-2 font-mono space-y-1 select-none pointer-events-none">
            <div className="bg-[#15181E] p-3 rounded-lg border border-[#23272E]">
              <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-tighter">EU AI ACT COMPLIANCE</div>
              <div className="flex justify-between items-end">
                <span className="text-lg font-mono text-green-400">98.4%</span>
                <span className="text-[9px] text-gray-500">August 2026</span>
              </div>
              <div className="w-full bg-[#0B0C0E] h-1 mt-2 rounded-full">
                <div className="bg-green-500 h-1 rounded-full" style={{ width: '98.4%' }}></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Master Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-6 bg-[#0B0C0E] relative space-y-6">
          {/* Main workspace routing mapping */}
          {activeTab === 'dashboard' && (
            <Dashboard
              agents={agents}
              capabilities={capabilities}
              quarantineTickets={quarantineTickets}
              ledger={ledger}
              onToggleAgentStatus={handleToggleAgentStatus}
              onResetSystem={handleResetSystem}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'visualizer' && (
            <PipelineVisualizer
              agents={agents}
              capabilities={capabilities}
              onSimulationSuccess={handleSimulationSuccess}
              activeScenarioId={activeScenarioId}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'policies' && (
            <PolicyManager
              agents={agents}
              capabilities={capabilities}
              policies={policies}
              onAddPolicyRule={handleAddPolicyRule}
            />
          )}

          {activeTab === 'quarantine' && (
            <QuarantineCenter
              tickets={quarantineTickets}
              onApproveTicket={handleApproveQuarantineTicket}
              onDenyTicket={handleDenyQuarantineTicket}
              onAppendLedgerBlock={(block) => setLedger(prev => [block, ...prev])}
            />
          )}

          {activeTab === 'ledger' && (
            <LedgerExplorer ledger={ledger} />
          )}
        </main>
      </div>
    </div>
  );
}
