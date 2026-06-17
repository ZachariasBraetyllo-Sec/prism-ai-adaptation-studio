'use client';

import { useState } from 'react';
import { CreativeDNA, AdaptationPlan, AdaptationRecommendation, DecisionStatus, ProductionBlueprint } from '@/types';
import CreativeDNADisplay from '@/components/CreativeDNADisplay';
import AdaptationPlanDisplay from '@/components/AdaptationPlan';
import ProductionBlueprintDisplay from '@/components/ProductionBlueprint';

const DEMO_STORY = `# The Last Bloom

**By Prism AI Adaptation Studio**  
*An original short story for adaptation demonstration*

---

Maya had always thought of memories as flowers pressed between the pages of a book—flat, faded, but preserved. Now, standing in her grandmother's greenhouse for the first time in fifteen years, she realized memories were more like the orchids surrounding her: alive, demanding, and capable of dying if neglected.

The key had arrived three days after the funeral, wrapped in tissue paper that smelled of lavender and time. Her mother's note had been brief: "Per your grandmother's instructions. She wanted you to have this today." No explanation, just the brass key and an address Maya had spent years trying to forget. Her mother had called it "closure." Maya called it what it was: an obligation.

The greenhouse stood at the edge of the property, a glass cathedral catching the afternoon light. Through the streaked windows, she could see the riot of green inside—her grandmother's life's work, thriving without her. Or perhaps because of her absence. Maya wasn't sure which thought disturbed her more.

She turned the key. The lock resisted, then yielded with a click that sounded like forgiveness.

Inside, the air was thick and sweet, heavy with the breath of a thousand plants. Humidity clung to her skin immediately, and she remembered how she used to complain about it as a child. "It's like being inside a lung," she'd whined once. Her grandmother had laughed, that deep, knowing laugh. "Exactly right, little bird. We're breathing together."

Maya hadn't been anyone's little bird in a long time.

The main path led deeper into the greenhouse, past familiar strangers: the towering bird of paradise that had always reminded her of a dancer frozen mid-leap, the sprawling ferns that whispered secrets when you brushed past them, the roses her grandmother had named after dead poets. Everything was larger than she remembered, or perhaps she had simply been smaller.

At the center of the greenhouse stood the worktable, exactly as she'd left it that last summer. The summer of the argument. The summer she'd called her grandmother's life "a waste," her devotion to these plants "an obsession." The summer she'd walked out and never walked back in.

The table was covered in her grandmother's handwriting—notes, sketches, observations recorded in that precise, slanting script. Maya picked up a journal, its pages swollen with moisture and time. The entries were dated, methodical, scientific. But in the margins, her grandmother had written other things: "Reminded me of Maya today," next to a sketch of a closed bud. "She'll understand someday," beside a drawing of roots spreading underground, invisible but essential.

Maya's throat tightened. She'd spent fifteen years building a life that looked nothing like this—a corner office, a apartment with clean lines and minimal maintenance, relationships that required no tending. She'd been so proud of her efficiency, her independence, her escape from the suffocating care her grandmother had poured into everything she touched.

But standing here, surrounded by the evidence of that care, Maya felt the weight of what she'd really been running from: the terrifying vulnerability of loving something that could die.

She moved deeper into the greenhouse, past the everyday plants to the back section her grandmother had always kept locked. The special collection. Maya had only seen it once, when she was twelve, and her grandmother had deemed her "ready to understand."

The door was unlocked now. An invitation or an oversight? Maya pushed it open.

The room beyond was smaller, dimmer, temperature-controlled. And there, in the center, was the reason her grandmother had spent forty years in this greenhouse: a single orchid, unlike any Maya had ever seen. Its petals were the color of twilight, that impossible moment between day and night when the sky can't decide what it wants to be. The flower seemed to glow from within, though Maya knew that was impossible. Orchids didn't glow.

Except this one did.

She approached slowly, reading the placard her grandmother had written in her careful hand: *Phalaenopsis memoria*. Memory orchid. Below that, in smaller letters: "Blooms once every fifteen years. Next bloom: Today."

Maya's breath caught. Today. The day she'd finally come back.

She sank onto the stool beside the plant, and for the first time since receiving the key, she let herself cry. Not the polite tears she'd shed at the funeral, but the ugly, gasping sobs of someone who'd realized too late what they'd lost. Her grandmother had known. Had timed this. Had left the key to arrive exactly when Maya would need to see this bloom, this impossible flower that her grandmother had spent a lifetime nurturing toward this single moment.

The orchid's petals began to open wider, responding to some internal clock that had nothing to do with Maya's presence and everything to do with the patient, invisible work of time and care. It was the most beautiful thing she'd ever seen, and it would be gone in three days. That was the nature of orchids—they bloomed briefly, brilliantly, and then they rested. But they came back. If you cared for them, if you were patient, if you believed in the possibility of return, they came back.

Maya pulled out her phone, then stopped. Some moments weren't meant to be captured, only witnessed. Instead, she reached for one of her grandmother's journals and began to write, her hand shaking slightly as she formed the words: "Day one of the bloom. I understand now."

She didn't know if she could stay. Her life was in the city, her job, her carefully constructed independence. But she could come back. She could tend this place, these plants, this legacy of patient love. She could learn the names her grandmother had given each flower, the stories behind them, the years of observation compressed into those margin notes.

She could become someone's little bird again, if only her own.

The orchid continued its slow unfurling, indifferent to her revelation, focused only on the work of becoming. Maya watched until the light began to fade, until the greenhouse filled with that same twilight color as the orchid's petals, until she couldn't tell where the flower ended and the world began.

When she finally stood to leave, she locked the door behind her. But she kept the key.

Tomorrow, she would come back. And the day after that. And the day after that. She would learn to read the language of leaves and roots, to understand the grammar of growth and decay. She would become fluent in the dialect of care her grandmother had spoken all her life.

The orchid would bloom for three days. But Maya had the rest of her life to learn what her grandmother had been trying to teach her: that love wasn't about holding on or letting go. It was about tending. About showing up. About believing that something beautiful could emerge from patient, invisible work.

She walked back to her car as the last light drained from the sky, the key warm in her pocket, the smell of the greenhouse still clinging to her clothes. Behind her, through the glass walls, the memory orchid glowed like a promise in the gathering dark.

Some flowers, she thought, were worth the wait.`;

export default function Home() {
  const [sourceText, setSourceText] = useState('');
  const [duration, setDuration] = useState(15);
  const [platform, setPlatform] = useState('festival');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creativeDNA, setCreativeDNA] = useState<CreativeDNA | null>(null);
  
  // Adaptation plan state
  const [adaptationPlan, setAdaptationPlan] = useState<AdaptationPlan | null>(null);
  const [recommendations, setRecommendations] = useState<AdaptationRecommendation[]>([]);
  const [decisions, setDecisions] = useState<Record<string, DecisionStatus>>({});
  const [adaptationLoading, setAdaptationLoading] = useState(false);
  const [adaptationError, setAdaptationError] = useState<string | null>(null);

  // Production blueprint state
  const [productionBlueprint, setProductionBlueprint] = useState<ProductionBlueprint | null>(null);
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);

  // Demo mode tracking
  const [demoModeActive, setDemoModeActive] = useState(false);

  const handleLoadDemo = () => {
    setSourceText(DEMO_STORY);
    setError(null);
    setCreativeDNA(null);
    setAdaptationPlan(null);
    setRecommendations([]);
    setDecisions({});
    setAdaptationError(null);
    setProductionBlueprint(null);
    setBlueprintError(null);
  };

  const handleAnalyze = async () => {
    if (!sourceText.trim()) {
      setError('Please enter a story to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setCreativeDNA(null);
    setAdaptationPlan(null);
    setRecommendations([]);
    setAdaptationError(null);
    setProductionBlueprint(null);
    setBlueprintError(null);

    try {
      const response = await fetch('/api/analyze-creative-dna', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceText }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setCreativeDNA(data.data);
      setDemoModeActive(data.mode === 'demo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAdaptation = async () => {
    if (!creativeDNA) return;

    setAdaptationLoading(true);
    setAdaptationError(null);
    setAdaptationPlan(null);
    setRecommendations([]);
    setDecisions({});
    setProductionBlueprint(null);
    setBlueprintError(null);

    try {
      const response = await fetch('/api/recommend-adaptation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creativeDNA,
          targetMedium: {
            medium: 'film',
            format: 'short film',
            estimatedLength: {
              value: duration,
              unit: 'minutes'
            },
            platform: platform.toLowerCase()
          }
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Adaptation generation failed');
      }

      setAdaptationPlan(data.data);
      setRecommendations(data.data.recommendations);
      if (data.mode === 'demo') {
        setDemoModeActive(true);
      }
      
      // Initialize all decisions as pending using recommendationId
      const initialDecisions: Record<string, DecisionStatus> = {};
      data.data.recommendations.forEach((rec: any) => {
        initialDecisions[rec.recommendationId] = 'pending';
      });
      setDecisions(initialDecisions);
    } catch (err) {
      setAdaptationError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setAdaptationLoading(false);
    }
  };

  const handleAcceptRecommendation = (id: string) => {
    setDecisions(prev => ({
      ...prev,
      [id]: 'accepted' as DecisionStatus
    }));
  };

  const handleRejectRecommendation = (id: string) => {
    setDecisions(prev => ({
      ...prev,
      [id]: 'rejected' as DecisionStatus
    }));
  };

  const handleGenerateBlueprint = async () => {
    if (!creativeDNA || !adaptationPlan) return;

    // Check for at least one accepted recommendation
    const acceptedCount = Object.values(decisions).filter(d => d === 'accepted').length;
    if (acceptedCount === 0) {
      setBlueprintError('At least one accepted recommendation is required to generate a production blueprint');
      return;
    }

    setBlueprintLoading(true);
    setBlueprintError(null);
    setProductionBlueprint(null);

    try {
      const response = await fetch('/api/generate-production-blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creativeDNA,
          adaptationPlan,
          decisions,
          targetMedium: {
            format: 'short-film',
            platform: platform.toLowerCase(),
            duration: {
              minimumSeconds: Math.max(540, (duration - 6) * 60),
              maximumSeconds: duration * 60
            },
            additionalContext: `${duration}-minute ${platform.toLowerCase()} short film`
          }
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Production blueprint generation failed');
      }

      setProductionBlueprint(data.data);
      if (data.mode === 'demo') {
        setDemoModeActive(true);
      }
    } catch (err) {
      setBlueprintError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setBlueprintLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            PRISM
          </h1>
          <p className="text-xl text-purple-200">
            AI-Powered Story Adaptation Studio
          </p>
          <p className="text-sm text-purple-300 mt-2">
            Short Story → Short Film
          </p>
        </header>

        {/* Demo Mode Banner */}
        {demoModeActive && (
          <div className="bg-amber-500/20 backdrop-blur-lg border border-amber-500/50 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-amber-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-amber-300 mb-1">Demo Mode Active</h3>
                <p className="text-amber-200 text-sm">
                  {"Using pre-generated demo fixtures for \"The Last Bloom\" story. No AI API calls are being made. This demonstrates the system's capabilities without consuming API tokens."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Source Story</h2>
          
          <div className="space-y-6">
            {/* Story Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="sourceText" className="block text-sm font-medium text-purple-100">
                  Paste your short story here
                </label>
                <button
                  onClick={handleLoadDemo}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-purple-500/30 hover:bg-purple-500/50 text-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Load Demo Story
                </button>
              </div>
              <textarea
                id="sourceText"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="w-full h-64 px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Enter your story text here..."
                disabled={loading}
              />
              <p className="text-xs text-purple-200 mt-2">
                {sourceText.length} characters
              </p>
            </div>

            {/* Target Medium Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-purple-100 mb-2">
                  Target Duration (minutes)
                </label>
                <input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                  min="5"
                  max="30"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-purple-100 mb-2">
                  Target Platform
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="festival">Festival</option>
                  <option value="streaming">Streaming</option>
                  <option value="social">Social Media</option>
                </select>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !sourceText.trim()}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Story...
                </span>
              ) : (
                'Analyze Story'
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 backdrop-blur-lg border border-red-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-300 mb-1">Analysis Error</h3>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Creative DNA Display */}
        {creativeDNA && (
          <div className="space-y-8">
            {/* Success Message */}
            <div className="bg-green-500/10 backdrop-blur-lg border border-green-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-green-300">Creative DNA Analysis Complete</h3>
                </div>
                
                {/* Generate Adaptation Button */}
                {!adaptationPlan && (
                  <button
                    onClick={handleGenerateAdaptation}
                    disabled={adaptationLoading}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {adaptationLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      '🎬 Generate Adaptation Plan'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Creative DNA Summary */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-400/30 shadow-2xl">
              <h2 className="text-2xl font-semibold text-white mb-6">Creative DNA Summary</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-1">Premise</p>
                  <p className="text-white text-lg leading-relaxed">{creativeDNA.coreElements.premise}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-1">Central Conflict</p>
                  <p className="text-white leading-relaxed">{creativeDNA.coreElements.centralConflict}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-1">Unique Hook</p>
                  <p className="text-white leading-relaxed">{creativeDNA.coreElements.uniqueHook}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-2">Primary Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {creativeDNA.thematicElements.primaryThemes.map((theme, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-400/30 text-white rounded-full text-sm font-medium">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-2">Overall Tone</p>
                    <span className="inline-block px-3 py-1 bg-pink-400/30 text-white rounded-full text-sm font-medium capitalize">
                      {creativeDNA.emotionalTone.overallTone.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Creative DNA Display */}
            <CreativeDNADisplay creativeDNA={creativeDNA} />
          </div>
        )}

        {/* Adaptation Error Display */}
        {adaptationError && (
          <div className="bg-red-500/10 backdrop-blur-lg border border-red-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-300 mb-1">Adaptation Generation Error</h3>
                <p className="text-red-200">{adaptationError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Adaptation Plan Display */}
        {adaptationPlan && recommendations.length > 0 && (
          <div className="mt-8 space-y-8">
            <AdaptationPlanDisplay
              plan={adaptationPlan}
              recommendations={recommendations}
              decisions={decisions}
              onAccept={handleAcceptRecommendation}
              onReject={handleRejectRecommendation}
            />

            {/* Generate Production Blueprint Button */}
            {!productionBlueprint && (
              <div className="bg-green-500/10 backdrop-blur-lg border border-green-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-300 mb-2">Ready to Generate Production Blueprint?</h3>
                    <p className="text-green-200 text-sm">
                      {Object.values(decisions).filter(d => d === 'accepted').length} recommendation(s) accepted
                      {Object.values(decisions).filter(d => d === 'accepted').length === 0 && ' - At least one required'}
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateBlueprint}
                    disabled={blueprintLoading || Object.values(decisions).filter(d => d === 'accepted').length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {blueprintLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Blueprint...
                      </span>
                    ) : (
                      '🎬 Generate Production Blueprint'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blueprint Error Display */}
        {blueprintError && (
          <div className="bg-red-500/10 backdrop-blur-lg border border-red-500/30 rounded-lg p-6 mt-8">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-300 mb-1">Production Blueprint Error</h3>
                <p className="text-red-200">{blueprintError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Production Blueprint Display */}
        {productionBlueprint && (
          <div className="mt-8">
            <ProductionBlueprintDisplay blueprint={productionBlueprint} />
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
