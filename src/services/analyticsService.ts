interface AnalyticsEvent {
  id: string;
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface SessionData {
  id: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  pageViews: string[];
  events: AnalyticsEvent[];
  userAgent: string;
  referrer: string;
  location: {
    country?: string;
    region?: string;
    city?: string;
  };
}

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  interactionToNextPaint: number;
  cumulativeLayoutShift: number;
  timestamp: number;
}

interface UserEngagement {
  totalSessions: number;
  averageSessionDuration: number;
  pageViewsPerSession: number;
  bounceRate: number;
  returnVisitorRate: number;
  conversionRate: number;
  topPages: Array<{ page: string; views: number; avgTime: number }>;
  topEvents: Array<{ event: string; count: number; value: number }>;
}

interface GameAnalytics {
  gameType: string;
  totalPlays: number;
  averageScore: number;
  averageCompletionTime: number;
  completionRate: number;
  difficultyDistribution: Record<string, number>;
  scoreDistribution: Record<string, number>;
  dailyPlays: Array<{ date: string; plays: number; avgScore: number }>;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

export class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessions: SessionData[] = [];
  private currentSession: SessionData | null = null;
  private isInitialized = false;
  private apiEndpoint = '/api/analytics';

  constructor() {
    this.loadStoredData();
  }

  async initialize() {
    if (this.isInitialized) return;

    this.startSession();
    this.setupPerformanceTracking();
    this.setupVisibilityTracking();
    this.setupErrorTracking();
    
    // Send data to server periodically
    setInterval(() => this.syncToServer(), 30000); // Every 30 seconds

    this.isInitialized = true;
    console.log('📊 Analytics service initialized');
  }

  private startSession() {
    const sessionId = this.generateSessionId();
    this.currentSession = {
      id: sessionId,
      userId: this.getCurrentUserId(),
      startTime: Date.now(),
      pageViews: [window.location.pathname],
      events: [],
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      location: {}
    };

    this.sessions.push(this.currentSession);
    this.trackEvent('session', 'start', 'user_session');
  }

  private endSession() {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
      this.trackEvent('session', 'end', 'user_session', this.currentSession.duration);
      this.saveToStorage();
      this.syncToServer();
    }
  }

  private setupPerformanceTracking() {
    // Track page load metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        const lcp = performance.getEntriesByType('largest-contentful-paint')[0] as any;

        const metrics: PerformanceMetrics = {
          pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: lcp?.startTime || 0,
          interactionToNextPaint: 0, // Would need more complex tracking
          cumulativeLayoutShift: 0, // Would need CLS observer
          timestamp: Date.now()
        };

        this.trackEvent('performance', 'page_load', 'metrics', 0, { metrics });
      }, 1000);
    });

    // Track Core Web Vitals
    this.trackCoreWebVitals();
  }

  private trackCoreWebVitals() {
    // FCP - First Contentful Paint
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.trackEvent('performance', 'fcp', 'core_web_vitals', entry.startTime);
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // LCP - Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.trackEvent('performance', 'lcp', 'core_web_vitals', entry.startTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // CLS - Cumulative Layout Shift
    let cumulativeScore = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          cumulativeScore += (entry as any).value;
          this.trackEvent('performance', 'cls', 'core_web_vitals', cumulativeScore);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private setupVisibilityTracking() {
    let startTime = Date.now();
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const timeOnPage = Date.now() - startTime;
        this.trackEvent('engagement', 'page_hidden', 'visibility', timeOnPage);
      } else {
        startTime = Date.now();
        this.trackEvent('engagement', 'page_visible', 'visibility');
      }
    });

    // Track time before unload
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - startTime;
      this.trackEvent('engagement', 'page_unload', 'visibility', timeOnPage);
      this.endSession();
    });
  }

  private setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackEvent('error', 'javascript_error', 'system', 0, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('error', 'unhandled_promise', 'system', 0, {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });
  }

  trackEvent(category: string, action: string, label?: string, value?: number, metadata?: Record<string, any>) {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type: 'custom',
      category,
      action,
      label,
      value,
      metadata,
      timestamp: Date.now(),
      sessionId: this.currentSession?.id || '',
      userId: this.getCurrentUserId()
    };

    this.events.push(event);
    if (this.currentSession) {
      this.currentSession.events.push(event);
    }

    // Auto-save frequently accessed events
    if (this.events.length % 10 === 0) {
      this.saveToStorage();
    }
  }

  // Game-specific tracking methods
  trackGameStart(gameType: string, difficulty?: string) {
    this.trackEvent('game', 'start', gameType, 0, { difficulty });
  }

  trackGameEnd(gameType: string, score: number, completed: boolean, duration: number) {
    this.trackEvent('game', 'end', gameType, score, { 
      completed, 
      duration,
      scorePerMinute: score / (duration / 60000)
    });
  }

  trackQuizAnswer(questionId: string, isCorrect: boolean, timeToAnswer: number) {
    this.trackEvent('quiz', 'answer', questionId, timeToAnswer, { isCorrect });
  }

  trackNavigationFlow(fromPage: string, toPage: string) {
    this.trackEvent('navigation', 'page_change', `${fromPage}_to_${toPage}`);
    
    if (this.currentSession) {
      this.currentSession.pageViews.push(toPage);
    }
  }

  trackFeatureUsage(feature: string, action: string, context?: string) {
    this.trackEvent('feature', action, feature, 0, { context });
  }

  trackUserRetention(days: number) {
    this.trackEvent('retention', 'return_visit', `day_${days}`, days);
  }

  // Analytics data retrieval methods
  async getEngagementMetrics(timeRange: { start: number; end: number }): Promise<UserEngagement> {
    const sessionsInRange = this.sessions.filter(s => 
      s.startTime >= timeRange.start && s.startTime <= timeRange.end
    );

    const totalSessions = sessionsInRange.length;
    const averageSessionDuration = sessionsInRange.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions;
    const totalPageViews = sessionsInRange.reduce((sum, s) => sum + s.pageViews.length, 0);
    const pageViewsPerSession = totalPageViews / totalSessions;
    
    const bouncedSessions = sessionsInRange.filter(s => s.pageViews.length === 1).length;
    const bounceRate = bouncedSessions / totalSessions;

    const returningUsers = sessionsInRange.filter(s => 
      this.sessions.filter(prevS => prevS.userId === s.userId && prevS.startTime < s.startTime).length > 0
    ).length;
    const returnVisitorRate = returningUsers / totalSessions;

    // Calculate top pages
    const pageViewCounts = new Map<string, { views: number; totalTime: number }>();
    sessionsInRange.forEach(session => {
      session.pageViews.forEach(page => {
        const current = pageViewCounts.get(page) || { views: 0, totalTime: 0 };
        pageViewCounts.set(page, {
          views: current.views + 1,
          totalTime: current.totalTime + (session.duration || 0) / session.pageViews.length
        });
      });
    });

    const topPages = Array.from(pageViewCounts.entries())
      .map(([page, data]) => ({
        page,
        views: data.views,
        avgTime: data.totalTime / data.views
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Calculate top events
    const eventCounts = new Map<string, { count: number; totalValue: number }>();
    this.events
      .filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end)
      .forEach(event => {
        const key = `${event.category}_${event.action}`;
        const current = eventCounts.get(key) || { count: 0, totalValue: 0 };
        eventCounts.set(key, {
          count: current.count + 1,
          totalValue: current.totalValue + (event.value || 0)
        });
      });

    const topEvents = Array.from(eventCounts.entries())
      .map(([event, data]) => ({
        event,
        count: data.count,
        value: data.totalValue
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalSessions,
      averageSessionDuration,
      pageViewsPerSession,
      bounceRate,
      returnVisitorRate,
      conversionRate: 0, // Would need conversion goals defined
      topPages,
      topEvents
    };
  }

  async getGameAnalytics(gameType: string, timeRange: { start: number; end: number }): Promise<GameAnalytics> {
    const gameEvents = this.events.filter(e => 
      e.category === 'game' && 
      e.label === gameType && 
      e.timestamp >= timeRange.start && 
      e.timestamp <= timeRange.end
    );

    const gameStarts = gameEvents.filter(e => e.action === 'start');
    const gameEnds = gameEvents.filter(e => e.action === 'end');

    const totalPlays = gameStarts.length;
    const averageScore = gameEnds.reduce((sum, e) => sum + (e.value || 0), 0) / gameEnds.length;
    const completedGames = gameEnds.filter(e => e.metadata?.completed).length;
    const completionRate = completedGames / totalPlays;

    const durations = gameEnds
      .filter(e => e.metadata?.duration)
      .map(e => e.metadata!.duration);
    const averageCompletionTime = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    // Daily plays analysis
    const dailyData = new Map<string, { plays: number; scores: number[] }>();
    gameStarts.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      const current = dailyData.get(date) || { plays: 0, scores: [] };
      current.plays++;
      
      const endEvent = gameEnds.find(e => 
        Math.abs(e.timestamp - event.timestamp) < 3600000 && // Within 1 hour
        e.sessionId === event.sessionId
      );
      if (endEvent && endEvent.value) {
        current.scores.push(endEvent.value);
      }
      
      dailyData.set(date, current);
    });

    const dailyPlays = Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        plays: data.plays,
        avgScore: data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length || 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      gameType,
      totalPlays,
      averageScore,
      averageCompletionTime,
      completionRate,
      difficultyDistribution: {},
      scoreDistribution: {},
      dailyPlays,
      userRetention: {
        day1: 0,
        day7: 0,
        day30: 0
      }
    };
  }

  async getPerformanceMetrics(timeRange: { start: number; end: number }) {
    const performanceEvents = this.events.filter(e => 
      e.category === 'performance' && 
      e.timestamp >= timeRange.start && 
      e.timestamp <= timeRange.end
    );

    const metrics = {
      pageLoadTimes: [] as number[],
      coreWebVitals: {
        fcp: [] as number[],
        lcp: [] as number[],
        cls: [] as number[]
      },
      errorRate: 0,
      totalEvents: performanceEvents.length
    };

    performanceEvents.forEach(event => {
      if (event.action === 'page_load' && event.metadata?.metrics) {
        metrics.pageLoadTimes.push(event.metadata.metrics.pageLoadTime);
      } else if (event.action === 'fcp') {
        metrics.coreWebVitals.fcp.push(event.value || 0);
      } else if (event.action === 'lcp') {
        metrics.coreWebVitals.lcp.push(event.value || 0);
      } else if (event.action === 'cls') {
        metrics.coreWebVitals.cls.push(event.value || 0);
      }
    });

    const errorEvents = this.events.filter(e => 
      e.category === 'error' && 
      e.timestamp >= timeRange.start && 
      e.timestamp <= timeRange.end
    );

    metrics.errorRate = errorEvents.length / Math.max(this.events.length, 1);

    return metrics;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private getCurrentUserId(): string | undefined {
    // Get from auth service or localStorage
    return localStorage.getItem('mangues_user_id') || undefined;
  }

  private saveToStorage() {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-1000))); // Keep last 1000 events
      localStorage.setItem('analytics_sessions', JSON.stringify(this.sessions.slice(-100))); // Keep last 100 sessions
    } catch (error) {
      console.warn('Failed to save analytics to localStorage:', error);
    }
  }

  private loadStoredData() {
    try {
      const storedEvents = localStorage.getItem('analytics_events');
      const storedSessions = localStorage.getItem('analytics_sessions');
      
      if (storedEvents) {
        this.events = JSON.parse(storedEvents);
      }
      
      if (storedSessions) {
        this.sessions = JSON.parse(storedSessions);
      }
    } catch (error) {
      console.warn('Failed to load analytics from localStorage:', error);
    }
  }

  private async syncToServer() {
    if (this.events.length === 0) return;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: this.events,
          sessions: this.sessions
        })
      });

      if (response.ok) {
        console.log('📊 Analytics data synced to server');
      }
    } catch (error) {
      console.warn('Failed to sync analytics to server:', error);
    }
  }

  // Export data for reports
  exportData(format: 'json' | 'csv' = 'json') {
    const data = {
      events: this.events,
      sessions: this.sessions,
      exportDate: new Date().toISOString(),
      totalEvents: this.events.length,
      totalSessions: this.sessions.length
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mangues-analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else if (format === 'csv') {
      // Convert events to CSV
      const csvData = this.events.map(event => ({
        timestamp: new Date(event.timestamp).toISOString(),
        category: event.category,
        action: event.action,
        label: event.label || '',
        value: event.value || 0,
        sessionId: event.sessionId,
        userId: event.userId || ''
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mangues-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  }
}

export default new AnalyticsService();