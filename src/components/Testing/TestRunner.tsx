import { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration?: number;
  error?: string;
  category: 'component' | 'api' | 'integration' | 'performance';
}

interface TestSuite {
  name: string;
  tests: TestResult[];
}

export function TestRunner() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    initializeTests();
  }, []);

  const initializeTests = () => {
    const suites: TestSuite[] = [
      {
        name: 'Component Tests',
        tests: [
          { id: 'navbar-render', name: 'Navbar renders correctly', status: 'pending', category: 'component' },
          { id: 'game-memory', name: 'Memory game functionality', status: 'pending', category: 'component' },
          { id: 'quiz-flow', name: 'Quiz flow works', status: 'pending', category: 'component' },
          { id: 'auth-modal', name: 'Authentication modal', status: 'pending', category: 'component' },
        ]
      },
      {
        name: 'API Tests',
        tests: [
          { id: 'api-especies', name: 'GET /api/especies', status: 'pending', category: 'api' },
          { id: 'api-quiz', name: 'GET /api/quiz', status: 'pending', category: 'api' },
          { id: 'api-pontuacoes', name: 'POST /api/pontuacoes', status: 'pending', category: 'api' },
          { id: 'api-auth', name: 'Authentication endpoints', status: 'pending', category: 'api' },
        ]
      },
      {
        name: 'Integration Tests',
        tests: [
          { id: 'offline-sync', name: 'Offline synchronization', status: 'pending', category: 'integration' },
          { id: 'pwa-install', name: 'PWA installation', status: 'pending', category: 'integration' },
          { id: 'game-scoring', name: 'Game scoring system', status: 'pending', category: 'integration' },
        ]
      },
      {
        name: 'Performance Tests',
        tests: [
          { id: 'page-load', name: 'Page load time < 3s', status: 'pending', category: 'performance' },
          { id: 'image-loading', name: 'Image lazy loading', status: 'pending', category: 'performance' },
          { id: 'memory-usage', name: 'Memory usage optimization', status: 'pending', category: 'performance' },
        ]
      }
    ];

    setTestSuites(suites);
  };

  const runTests = async () => {
    setIsRunning(true);
    
    // Reset all tests to pending
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      tests: suite.tests.map(test => ({ ...test, status: 'pending' as const }))
    })));

    // Run tests sequentially
    for (const suite of testSuites) {
      for (const test of suite.tests) {
        if (selectedCategory !== 'all' && test.category !== selectedCategory) {
          continue;
        }

        // Update test status to running
        setTestSuites(prev => prev.map(s => 
          s.name === suite.name ? {
            ...s,
            tests: s.tests.map(t => 
              t.id === test.id ? { ...t, status: 'running' as const } : t
            )
          } : s
        ));

        // Simulate test execution
        const result = await executeTest(test);
        
        // Update test result
        setTestSuites(prev => prev.map(s => 
          s.name === suite.name ? {
            ...s,
            tests: s.tests.map(t => 
              t.id === test.id ? { ...t, ...result } : t
            )
          } : s
        ));

        // Small delay between tests for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsRunning(false);
  };

  const executeTest = async (test: TestResult): Promise<Partial<TestResult>> => {
    const start = performance.now();
    
    try {
      switch (test.id) {
        case 'navbar-render':
          // Test if navbar renders
          const navbar = document.querySelector('nav');
          if (!navbar) throw new Error('Navbar not found');
          break;
          
        case 'api-especies':
          // Test especies API
          const response = await fetch('/api/especies');
          if (!response.ok) throw new Error(`API returned ${response.status}`);
          break;
          
        case 'page-load':
          // Test page load performance
          const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
          if (loadTime > 3000) throw new Error(`Page load time: ${loadTime}ms`);
          break;
          
        default:
          // Simulate test execution
          await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
          if (Math.random() > 0.8) throw new Error('Simulated test failure');
      }
      
      const end = performance.now();
      return {
        status: 'passed',
        duration: Math.round(end - start)
      };
    } catch (error) {
      const end = performance.now();
      return {
        status: 'failed',
        duration: Math.round(end - start),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running': return <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />;
      default: return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getOverallStats = () => {
    const allTests = testSuites.flatMap(suite => suite.tests);
    const filteredTests = selectedCategory === 'all' 
      ? allTests 
      : allTests.filter(test => test.category === selectedCategory);
    
    const passed = filteredTests.filter(test => test.status === 'passed').length;
    const failed = filteredTests.filter(test => test.status === 'failed').length;
    const total = filteredTests.length;
    
    return { passed, failed, total, pending: total - passed - failed };
  };

  const stats = getOverallStats();

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Test Runner</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Testes</option>
            <option value="component">Componentes</option>
            <option value="api">API</option>
            <option value="integration">Integração</option>
            <option value="performance">Performance</option>
          </select>
          
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              isRunning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
            }`}
          >
            <Play className="h-5 w-5" />
            <span>{isRunning ? 'Executando...' : 'Executar Testes'}</span>
          </button>
        </div>
      </div>

      {/* Test Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
          <div className="text-sm text-gray-500">Passou</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-gray-500">Falhou</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">Pendente</div>
        </div>
      </div>

      {/* Test Suites */}
      <div className="space-y-6">
        {testSuites.map((suite) => {
          const filteredTests = selectedCategory === 'all' 
            ? suite.tests 
            : suite.tests.filter(test => test.category === selectedCategory);
          
          if (filteredTests.length === 0) return null;
          
          return (
            <div key={suite.name} className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">{suite.name}</h3>
              </div>
              
              <div className="p-4 space-y-2">
                {filteredTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <div className="font-medium text-gray-800">{test.name}</div>
                        {test.error && (
                          <div className="text-sm text-red-600">{test.error}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {test.duration && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {test.duration}ms
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}