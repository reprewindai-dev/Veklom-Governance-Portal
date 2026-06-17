import React, { useState, useEffect, useRef } from 'react';
import { PRESET_SCENARIOS, ScenarioProfile } from '../scenarios';
import { Agent, Capability, PipelineStep, SimulationResult } from '../types';
import { Play, Terminal, HelpCircle, ShieldAlert, CheckCircle, ChevronRight, AlertTriangle, Coins, Eye, Key, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PipelineVisualizerProps {
  agents: Agent[];
  capabilities: Capability[];
  onSimulationSuccess: (result: SimulationResult) => void;
  activeScenarioId?: string;
  onSelectTab: (tab: string) => void;
}

export default function PipelineVisualizer({
  agents,
  capabilities,
  onSimulationSuccess,
  activeScenarioId,
  onSelectTab
}: PipelineVisualizerProps) {
  // Scenario trigger states
  const [selectedScenario, setSelectedScenario] = useState<ScenarioProfile>(
    PRESET_SCENARIOS.find(s => s.id === activeScenarioId) || PRESET_SCENARIOS[0]
  );
  const [customQuery, setCustomQuery] = useState(JSON.stringify(PRESET_SCENARIOS[0].input, null, 2));
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [streamedLogs, setStreamedLogs] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeScenarioId) {
      const found = PRESET_SCENARIOS.find(s => s.id === activeScenarioId);
      if (found) {
        setSelectedScenario(found);
        setCustomQuery(JSON.stringify(found.input, null, 2));
        setCurrentResult(null);
        setActiveStepIndex(-1);
        setStreamedLogs([]);
      }
    }
  }, [activeScenarioId]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleSelectScenario = (scen: ScenarioProfile) => {
    setSelectedScenario(scen);
    setCustomQuery(JSON.stringify(scen.input, null, 2));
    setCurrentResult(null);
    setActiveStepIndex(-1);
    setStreamedLogs([]);
  };

  // Run simulation sequence
  const startSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    let parsedInput = {};
    try {
      parsedInput = JSON.parse(customQuery);
    } catch (e) {
      alert('Invalid arguments format. Please supply clean JSON.');
      return;
    }

    setIsRunning(true);
    setActiveStepIndex(0);
    setCurrentResult(null);
    setStreamedLogs(['[SYSTEM] Initializing VEKLOM v2.0 Execution Session...', `[SYSTEM] connection_id generated: conn_${Math.floor(Math.random() * 900000 + 100000)}`]);
    setExpandedStep(1);

    // Compute final result context from static processor
    const finalResult = selectedScenario.customCheck
      ? selectedScenario.customCheck(parsedInput, 'pgl_sha256_c23a1099fe42_ec4')
      : PRESET_SCENARIOS[0].customCheck!(parsedInput, 'pgl_sha256_c23a1099fe42_ec4');

    // Sequence progress through 9 steps
    const totalDuration = 4500; // Total 4.5 seconds for complete sequence
    const stepInterval = totalDuration / 9;

    let stepCounter = 1;
    const interval = setInterval(() => {
      if (stepCounter <= 9) {
        setActiveStepIndex(stepCounter);
        setExpandedStep(stepCounter);

        // Append log files representation
        const stepLogs = finalResult.steps[stepCounter - 1]?.details || [];
        setStreamedLogs(prev => [
          ...prev,
          `[PHASE ${stepCounter}] ${finalResult.steps[stepCounter - 1]?.name} processing...`,
          ...stepLogs.map(l => `  > ${l}`)
        ]);

        stepCounter++;
      } else {
        clearInterval(interval);
        intervalRef.current = null;
        setIsRunning(false);
        setCurrentResult(finalResult);
        onSimulationSuccess(finalResult);
        setStreamedLogs(prev => [
          ...prev,
          `[SYSTEM] Compilation finished. Authorization Status: ${finalResult.status.toUpperCase()}`,
          finalResult.evidence ? `[SYSTEM] Immutable proof saved successfully to ledger chain: ${finalResult.evidence.pglHash}` : '[SYSTEM] Suspended state preserved.'
        ]);
      }
    }, stepInterval);

    intervalRef.current = interval;
  };

  // Instant jump to specific compliance stage
  const runToSpecificStep = (targetStep: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    let parsedInput = {};
    try {
      parsedInput = JSON.parse(customQuery);
    } catch (e) {
      alert('Invalid arguments format. Please supply clean JSON.');
      return;
    }

    setIsRunning(false);
    setActiveStepIndex(targetStep);
    setExpandedStep(targetStep);

    const finalResult = selectedScenario.customCheck
      ? selectedScenario.customCheck(parsedInput, 'pgl_sha256_c23a1099fe42_ec4')
      : PRESET_SCENARIOS[0].customCheck!(parsedInput, 'pgl_sha256_c23a1099fe42_ec4');

    // Build cumulative logs up to current targetStep
    const logs = ['[SYSTEM] Initializing VEKLOM v2.0 Execution Session...', `[SYSTEM] connection_id generated: conn_${Math.floor(Math.random() * 900000 + 100000)}`];
    for (let i = 1; i <= targetStep; i++) {
      const stepLogs = finalResult.steps[i - 1]?.details || [];
      logs.push(`[PHASE ${i}] ${finalResult.steps[i - 1]?.name} processing...`);
      logs.push(...stepLogs.map(l => `  > ${l}`));
    }

    if (targetStep === 9) {
      logs.push(`[SYSTEM] Compilation finished. Authorization Status: ${finalResult.status.toUpperCase()}`);
      if (finalResult.evidence) {
        logs.push(`[SYSTEM] Immutable proof saved successfully to ledger chain: ${finalResult.evidence.pglHash}`);
      } else {
        logs.push('[SYSTEM] Suspended state preserved.');
      }
      setCurrentResult(finalResult);
      onSimulationSuccess(finalResult);
    } else {
      // Create partial result
      setCurrentResult({
        ...finalResult,
        steps: finalResult.steps.map((st, idx) => {
          if (idx < targetStep) return st;
          return { ...st, status: 'pending', details: [] };
        })
      });
    }
    setStreamedLogs(logs);
  };

  const complianceStages = [
    { id: 1, label: 'Identity', desc: 'Ed25519 Verify' },
    { id: 2, label: 'Policy Map', desc: 'Composed Rules' },
    { id: 3, label: 'Anomaly Check', desc: 'Rogue Assessment' },
    { id: 4, label: 'Budget/Ledger', desc: 'Credit Threshold' },
    { id: 5, label: 'Quorum Gate', desc: 'Multi-Sig Escrow' },
    { id: 6, label: 'Execution', desc: 'Secure Sandbox' },
    { id: 7, label: 'Proof Chain', desc: 'Decentered Chaining' },
    { id: 8, label: 'Ledger Publish', desc: 'Gnom Commit' },
    { id: 9, label: 'Secure Seal', desc: 'Signed Delivery' }
  ];

  return (
    <div className="space-y-4 animate-fade-in" id="pipeline-tab">
      {/* Interactive Horizontal Progress Ribbon */}
      <div className="bg-[#0F1115] border border-[#23272E] p-4 rounded shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#23272E] pb-3 mb-3 gap-2">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              VEKLOM v2.0 Compliance Lifecycle
            </h4>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
              Click any stage card arrow to immediately trigger or jump to that simulation results stage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeStepIndex > 0 ? (
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-blue-900/40 bg-blue-950/20 text-blue-400">
                ACTIVE PHASE: {activeStepIndex} / 9
              </span>
            ) : (
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-gray-800 bg-[#0B0C0E] text-gray-500">
                AWAITING SIMULATION
              </span>
            )}
          </div>
        </div>

        {/* 9 Stages Responsive Grid list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {complianceStages.map((stage) => {
            const isCurrent = activeStepIndex === stage.id;
            const isPassed = activeStepIndex > stage.id || currentResult !== null;
            const isFuture = activeStepIndex < stage.id && currentResult === null;

            let stageBg = 'bg-[#0B0C0E] border-[#23272E] text-gray-500';
            if (isCurrent) {
              stageBg = 'bg-blue-950/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)]';
            } else if (isPassed) {
              stageBg = 'bg-green-950/10 border-green-900/50 text-green-400';
            }

            return (
              <div
                key={stage.id}
                onClick={() => !isFuture && runToSpecificStep(stage.id)}
                className={`relative p-2 rounded border transition-all flex flex-col justify-between h-[72px] cursor-pointer group ${stageBg}`}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold opacity-60">Phase 0{stage.id}</span>
                    {isPassed && <span className="text-[8px] bg-green-950/40 text-green-400 px-1 rounded font-bold font-mono uppercase">DONE</span>}
                    {isCurrent && <span className="text-[8px] bg-blue-950 text-blue-400 px-1 rounded font-bold font-mono uppercase animate-pulse">RUN</span>}
                  </div>
                  <h5 className={`text-[11px] font-bold leading-tight mt-1 truncate ${isCurrent ? 'text-blue-300' : isPassed ? 'text-gray-200' : 'text-gray-400'}`}>
                    {stage.label}
                  </h5>
                  <p className="text-[9px] text-gray-500 font-mono truncate leading-none mt-0.5">{stage.desc}</p>
                </div>

                {/* Highly interactive action arrow */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    runToSpecificStep(stage.id);
                  }}
                  className={`absolute bottom-1.5 right-1.5 p-1 rounded transition-all border ${
                    isCurrent
                      ? 'bg-blue-500 text-slate-950 border-blue-400'
                      : isPassed
                      ? 'bg-[#15181E] border-green-800 text-green-400 hover:bg-green-950/30'
                      : 'bg-[#15181E] border-[#23272E] text-gray-400 hover:text-white hover:border-gray-600 group-hover:border-gray-500 group-hover:text-gray-200'
                  }`}
                  title={`Run simulation directly up to Stage ${stage.id}`}
                >
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Simulation Scenario Trigger (Left 5 Cols) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-[#0F1115] border border-[#23272E] p-4 rounded space-y-4">
            <div className="border-b border-[#23272E] pb-3 flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#D1D5DB] uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-500" />
                1. Choose Governance vectors
              </h3>
              <span className="text-[10px] bg-[#0B0C0E] px-2 py-0.5 rounded border border-[#23272E] font-mono text-gray-400">
                {PRESET_SCENARIOS.length} presets
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {PRESET_SCENARIOS.map(scen => {
                const matchesAgent = agents.find(a => a.id === scen.agentId);
                return (
                  <button
                    key={scen.id}
                    onClick={() => handleSelectScenario(scen)}
                    disabled={isRunning}
                    className={`w-full text-left p-3 rounded border transition-all flex flex-col gap-1.5 relative ${
                      selectedScenario.id === scen.id
                        ? 'bg-blue-950/20 border-blue-500/80'
                        : 'bg-[#0B0C0E] border-[#23272E] hover:bg-[#15181E] hover:border-gray-700'
                    } ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-white text-xs">{scen.name}</span>
                      <span className={`text-[9px] uppercase font-bold font-mono px-1.5 py-0.5 rounded ${
                        scen.id === 'scen-standard' || scen.id === 'scen-delegated'
                          ? 'bg-green-950/20 text-green-400 border border-green-900/30'
                          : scen.id === 'scen-quarantine'
                          ? 'bg-amber-950/20 text-amber-400 border border-amber-900/30'
                          : 'bg-red-950/20 text-red-400 border border-red-900/30'
                      }`}>
                        {scen.id === 'scen-standard' ? 'Auto-Approve' : 'Pre-Defined'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{scen.description}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[10px] bg-[#0B0C0E] text-gray-400 font-mono px-1.5 py-0.5 border border-[#23272E] rounded">
                        Agent: {matchesAgent?.name || scen.agentId}
                      </span>
                      {scen.tags.map(t => (
                        <span key={t} className="text-[9px] bg-[#0B0C0E] text-gray-500 font-mono px-1 py-0.5 border border-[#23272E] rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Payload Arguments Inputs */}
            <div className="space-y-2 pt-2 border-t border-[#23272E]">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                2. Transaction Arguments (Payload payload)
              </label>
              <textarea
                id="selected-scenario-args"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                disabled={isRunning}
                rows={4}
                className="w-full bg-[#0B0C0E] font-mono text-xs p-3 border border-[#23272E] rounded text-blue-400 focus:outline-none focus:border-blue-500/50 resize-y"
              />
            </div>

            {/* Action Trigger Button */}
            <button
              id="trigger-simulation-btn"
              onClick={startSimulation}
              disabled={isRunning}
              className={`w-full py-2 px-4 font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 border ${
                isRunning
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-[#23272E]'
                  : 'bg-[#15181E] hover:bg-[#1C1F26] border-[#23272E] text-white shadow'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Compiling Verification Pipeline...' : 'Run Pipeline Simulation'}
            </button>
          </div>

          {/* Live Diagnostics Terminal box */}
          <div className="bg-[#0B0C0E] border border-[#23272E] rounded overflow-hidden">
            <div className="bg-[#0F1115] px-4 py-2 border-b border-[#23272E] flex justify-between items-center text-[11px] text-gray-400 font-mono">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-blue-500" />
                Live Diagnostic Output Telemetry
              </span>
              <span className="text-gray-600">VEKLOM_LOGS: STDOUT</span>
            </div>
            <div className="p-3 h-56 overflow-y-auto font-mono text-[10px] space-y-1 select-text scrollbar-thin text-gray-4050 bg-[#0B0C0E] relative">
              {streamedLogs.length === 0 && (
                <div className="text-gray-600 italic absolute inset-0 flex items-center justify-center text-center p-4">
                  Awaiting active connection triggers to stream console telemetry...
                </div>
              )}
              {streamedLogs.map((log, lIdx) => {
                let color = 'text-gray-400';
                if (log.startsWith('[SYSTEM]')) color = 'text-blue-400 font-bold';
                else if (log.includes('[PHASE')) color = 'text-green-400 font-bold';
                else if (log.includes('CRITICAL') || log.includes('EXPLOIT') || log.includes('SECURITY')) color = 'text-red-400 font-bold';
                else if (log.includes('warning') || log.includes('ANOMALY') || log.includes('Quarantine')) color = 'text-amber-400';

                return (
                  <div key={lIdx} className={`${color} leading-normal`}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 9 Phase Visual Pipeline (Right 7 Cols) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-[#0F1115] border border-[#23272E] p-4 rounded">
            {/* Section banner */}
            <div className="border-b border-[#23272E] pb-3 flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xs font-bold text-[#D1D5DB] uppercase tracking-wider">
                  VEKLOM v2.0 9-Phase Compliance Core
                </h3>
                <p className="text-[10px] text-gray-500 mt-1 font-mono">
                  Every request evaluation is bound physically to these immutable enforcement stages.
                </p>
              </div>
              {isRunning && (
                <span className="text-xs text-blue-400 animate-pulse font-mono">
                  Active index: Phase {activeStepIndex}
                </span>
              )}
            </div>

            {/* Vertical Pipeline Phases mapping */}
            <div className="space-y-2 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#23272E]">
              {Array.from({ length: 9 }).map((_, i) => {
                const phaseNum = i + 1;
                const isCurrent = activeStepIndex === phaseNum;
                const isPast = activeStepIndex > phaseNum || currentResult !== null;
                const isFuture = activeStepIndex < phaseNum && currentResult === null;

                // Phase definitions
                const titles = [
                  'Phase 1: Cryptographic Identity & Security Check',
                  'Phase 2: Dynamic Policy Composition',
                  'Phase 3: Deep Behavioral Anomaly Assessment',
                  'Phase 4: Cost Ledger & Budget limits',
                  'Phase 5: Multi-Sig Quorum Routing Gates',
                  'Phase 6: Isolated Capability Execution',
                  'Phase 7: Cryptographic Proof & Trace Snapshot',
                  'Phase 8: Gnom Compliance Ledger publication',
                  'Phase 9: Secure Seal Response Delivery'
                ];
                const subtitles = [
                  'Verify Ed25519 signatures & replay protection',
                  'Merge multi-permission system, owner, & situational scopes',
                  'Learn 30-day baseline activities & suppress rogue trusts',
                  'Enforce operational credits before launching system requests',
                  'Quarantine suspends and awaits multiple authorization signs',
                  'Route safely to local daemon, HTTP REST, or MCP server',
                  'Hash snapshot with previous evidence records to chain',
                  'Commit proof block dynamically to decentralized PGL register',
                  'Form seal response verification packet for agent caller'
                ];

                const stepResult = currentResult ? currentResult.steps[i] : null;
                const status = isPast ? (stepResult?.status || 'success') : isCurrent ? 'active' : 'pending';

                let statusColor = 'text-gray-500 bg-[#0B0C0E] border-[#23272E]';
                let iconContent = <HelpCircle className="w-3.5 h-3.5" />;

                if (status === 'success') {
                  statusColor = 'text-green-400 bg-green-950/20 border-green-900/50';
                  iconContent = <CheckCircle className="w-3.5 h-3.5" />;
                } else if (status === 'warning') {
                  statusColor = 'text-amber-400 bg-amber-950/20 border-amber-900/50';
                  iconContent = <AlertTriangle className="w-3.5 h-3.5" />;
                } else if (status === 'error') {
                  statusColor = 'text-red-400 bg-red-950/20 border-red-900/50';
                  iconContent = <ShieldAlert className="w-3.5 h-3.5" />;
                } else if (status === 'active') {
                  statusColor = 'text-blue-400 bg-[#0B0C0E] border-blue-500 animate-pulse';
                  iconContent = <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />;
                }

                const isExpanded = expandedStep === phaseNum;

                return (
                  <div key={phaseNum} className="relative pl-8 transition-all duration-300">
                    {/* Phase bubble */}
                    <div
                      onClick={() => !isFuture && setExpandedStep(isExpanded ? null : phaseNum)}
                      className={`absolute left-2.5 top-2.5 w-5 h-5 rounded-sm flex items-center justify-center border text-[9px] font-mono cursor-pointer transition-all ${statusColor} z-10`}
                    >
                      {iconContent}
                    </div>

                    {/* Header info */}
                    <div className="bg-[#0B0C0E] border border-[#23272E] p-2.5 rounded transition-all">
                      <div
                        onClick={() => !isFuture && setExpandedStep(isExpanded ? null : phaseNum)}
                        className={`flex justify-between items-center ${!isFuture ? 'cursor-pointer' : 'opacity-60'}`}
                      >
                        <div
                          className={`select-none text-xs font-bold ${
                            isCurrent ? 'text-blue-400' : isPast ? 'text-gray-200' : 'text-gray-500'
                          }`}
                        >
                          {titles[i]}
                        </div>
                        <ChevronRight
                          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{subtitles[i]}</div>

                      {/* Expandable step details (Log lines inside) */}
                      <AnimatePresence>
                        {isExpanded && stepResult && stepResult.details && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-2 bg-[#0F1115] rounded border border-[#23272E] pt-1 pb-2 px-3 space-y-1.5"
                          >
                            {stepResult.details.map((detail, dIdx) => (
                              <div key={dIdx} className="text-[10px] font-mono text-gray-400 flex items-start gap-1">
                                <span className="text-gray-650">&gt;</span>
                                <p className="leading-normal break-all">{detail}</p>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive alert box if transaction was quarantined */}
            {currentResult && currentResult.status === 'quarantined' && (
              <div className="bg-amber-950/20 text-amber-300 border border-amber-900/40 p-4 rounded mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Transaction Quarantined Under System Quarantine
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">
                    Multiple critical anomalies detected. A quorum of 2 signatures is required to execute.
                  </p>
                </div>
                <button
                  id="quarantine-redirect-btn"
                  onClick={() => onSelectTab('quarantine')}
                  className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs uppercase px-4 py-2 rounded transition-all font-mono tracking-wider shrink-0"
                >
                  Sign Quorum approvals →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
