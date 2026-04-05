'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
}

interface GatewayResponse {
  success: boolean;
  events: CalendarEvent[];
  message?: string;
  error?: string;
  refreshed?: boolean;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const MOCK_EVENTS: CalendarEvent[] = [
    {
      id: 'mock-1',
      summary: 'Hackathon Final Pitch',
      description: 'The final presentation of AgentPassport Lite. Show off the secure gateway!',
      start: { dateTime: new Date(Date.now() + 3600000).toISOString() },
      end: { dateTime: new Date(Date.now() + 7200000).toISOString() },
      organizer: { email: 'hackathon@example.com', displayName: 'Hackathon Team' }
    },
    {
      id: 'mock-2',
      summary: 'Sync with AI Agent',
      description: 'Automated sync session between the Google Calendar and the AI Agent.',
      start: { dateTime: new Date(Date.now() + 86400000).toISOString() },
      end: { dateTime: new Date(Date.now() + 90000000).toISOString() },
      organizer: { email: 'agent@agentpassport.io', displayName: 'Agent Butler' }
    },
    {
      id: 'mock-3',
      summary: 'Security Audit Review',
      description: 'Reviewing the Auth0 Token Vault integration and gateway security logs.',
      start: { dateTime: new Date(Date.now() + 172800000).toISOString() },
      end: { dateTime: new Date(Date.now() + 176400000).toISOString() },
      organizer: { email: 'security@agentpassport.io', displayName: 'Security Bot' }
    }
  ];

  const MOCK_AGENTS = [
    { name: 'Agent Butler', status: 'Active', scope: 'Calendar.Read', lastAccess: '2 mins ago' },
    { name: 'Security Bot', status: 'Idle', scope: 'Logs.Read', lastAccess: '1 hour ago' },
    { name: 'Meeting Scheduler', status: 'Active', scope: 'Calendar.Write', lastAccess: 'Just now' }
  ];

  const MOCK_LOGS = [
    { id: 1, agent: 'Meeting Scheduler', action: 'Requested availability', status: 'Success', time: 'Just now' },
    { id: 2, agent: 'Agent Butler', action: 'Fetched daily agenda', status: 'Success', time: '5 mins ago' },
    { id: 3, agent: 'Security Bot', action: 'Audit log rotation', status: 'Success', time: '1 hour ago' },
    { id: 4, agent: 'System', action: 'Token refreshed via Auth0', status: 'Success', time: '4 hours ago' }
  ];

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    // Check if fake_auth exists first (hackathon mode)
    const isFakeAuth = localStorage.getItem('fake_auth') === 'true';
    if (isFakeAuth) {
      setAuthenticated(true);
      setEvents(MOCK_EVENTS);
      return;
    }

    // Otherwise check if access_token cookie exists by trying to fetch events
    fetchEvents(true);
  };

  const fetchEvents = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);

    setError(null);

    try {
      const response = await fetch('/api/get-events', {
        method: 'GET',
        credentials: 'include', // Include cookies in request
      });

      if (!response.ok) {
        // Try to parse as JSON, fall back to text if it fails
        let errorMessage = 'Failed to fetch events';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Failed to fetch events';
        } catch {
          // If JSON parsing fails, it might be an HTML error page
          // This could mean Auth0 env vars are missing or API route has an error
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('text/html')) {
            errorMessage = 'Server configuration error. Please ensure Auth0 environment variables are set.';
          } else {
            errorMessage = `Server error (${response.status}). Please check your configuration.`;
          }
        }

        setError(errorMessage);
        setAuthenticated(false);
        setEvents([]);

        if (isInitial) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
        return;
      }

      const data: GatewayResponse = await response.json();

      if (data.success) {
        setEvents(data.events || []);
        setAuthenticated(true);
        setError(null);
        console.log('[Dashboard] Events fetched securely via gateway:', data.events?.length || 0);
      } else {
        setError(data.error || 'Failed to fetch events');
        setAuthenticated(false);
      }
    } catch (err) {
      console.error('[Dashboard Error]', err);
      setError('Failed to connect to gateway. Please check your connection.');
      setAuthenticated(false);
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const handleConnect = () => {
    window.location.href = '/api/auth/login?callbackUrl=/';
  };

  const handleRefresh = () => {
    fetchEvents();
  };

  const handleLogout = () => {
    // Clear fake auth
    localStorage.removeItem('fake_auth');

    // Clear cookies by calling a logout endpoint
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      .catch(() => {
        // If logout endpoint doesn't exist, just clear local state
      })
      .finally(() => {
        setAuthenticated(false);
        setEvents([]);
        setError(null);
      });
  };

  const formatEventTime = (event: CalendarEvent): string => {
    const startTime = event.start.dateTime || event.start.date;
    if (!startTime) return 'No time specified';

    const date = new Date(startTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                AgentPassport: Token Vault
              </h1>
              <p className="text-slate-600">
                Securely delegate data access to AI agents via Auth0 Identity Tokens
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && !authenticated && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              <div className="space-y-2">
                <p>{error}</p>
                {error.includes('Server configuration error') && (
                  <p className="text-sm">
                    Go to Vercel Dashboard → Settings → Environment Variables and add:
                    <code className="block bg-slate-900 text-white p-2 mt-1 rounded text-xs overflow-x-auto">
                      AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, NEXT_PUBLIC_APP_URL
                    </code>
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Section */}
        {!authenticated && (
          <Card className="mb-8 bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Connect Your Google Calendar</CardTitle>
              <CardDescription>
                Securely authenticate via Auth0 to grant read-only access to your calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>You authenticate via Auth0 OAuth</li>
                    <li>Your token is stored securely server-side (HTTP-only cookie)</li>
                    <li>AI agents call the gateway without handling credentials</li>
                    <li>Gateway retrieves your token and calls Google Calendar</li>
                    <li>You maintain full control and can revoke access anytime</li>
                  </ul>
                </div>
                <Button
                  onClick={() => window.location.href = '/login'}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Connect Google Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Spinner className="w-8 h-8 mb-4" />
              <p className="text-slate-600">Loading your calendar events...</p>
            </div>
          </div>
        )}

        {/* Authenticated Section */}
        {authenticated && !loading && (
          <>
            {/* Controls */}
            <div className="mb-6 flex gap-2">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="flex-1"
              >
                {refreshing ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Refreshing...
                  </>
                ) : (
                  'Refresh Events'
                )}
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex-1"
              >
                Disconnect Calendar
              </Button>
            </div>

            {/* Token Vault Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="text-sm font-medium text-slate-500 mb-1">Vault Status</div>
                  <div className="text-2xl font-bold text-green-600 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Encrypted
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="text-sm font-medium text-slate-500 mb-1">Primary Provider</div>
                  <div className="text-2xl font-bold text-slate-900">Google OAuth2</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="text-sm font-medium text-slate-500 mb-1">Active Scopes</div>
                  <div className="text-2xl font-bold text-slate-900">Calendar.Read</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Main Content: Events */}
              <div className="lg:col-span-2">
                <Card className="bg-white border-slate-200 h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Vaulted Data Preview</CardTitle>
                        <CardDescription>
                          Data available to authorized agents
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {events.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <p>No vaulted data found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {events.map((event) => (
                          <div
                            key={event.id}
                            className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-slate-50/50"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold text-slate-900">
                                {event.summary}
                              </h3>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {formatEventTime(event)}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-xs text-slate-600">
                                {event.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar: Agents & Logs */}
              <div className="space-y-8">
                {/* Authorized Agents */}
                <Card className="bg-white border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Authorized Agents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {MOCK_AGENTS.map((agent) => (
                      <div key={agent.name} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{agent.name}</div>
                          <div className="text-[10px] text-slate-500">{agent.scope}</div>
                        </div>
                        <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          agent.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {agent.status}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Audit Logs */}
                <Card className="bg-slate-900 border-slate-800 text-slate-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">Security Audit Log</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 font-mono text-[10px]">
                    {MOCK_LOGS.map((log) => (
                      <div key={log.id} className="border-l-2 border-blue-500 pl-2 py-1">
                        <div className="flex justify-between text-blue-400 mb-0.5">
                          <span>[{log.time}]</span>
                          <span>{log.status}</span>
                        </div>
                        <div className="text-slate-300">
                          <span className="text-white">{log.agent}</span>: {log.action}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Security Info */}
            <Card className="mt-8 bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900">Security Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-green-800">
                  <p className="flex items-center">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    Your access token is stored securely (HTTP-only cookie)
                  </p>
                  <p className="flex items-center">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    Credentials never exposed to the browser or AI agents
                  </p>
                  <p className="flex items-center">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    All API calls go through the secure gateway
                  </p>
                  <p className="flex items-center">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    Scoped to &quot;read:calendar&quot; only
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
          <p>AgentPassport Lite • Built for Authorized to Act Hackathon • Auth0 Token Vault</p>
        </div>
      </div>
    </main>
  );
}
