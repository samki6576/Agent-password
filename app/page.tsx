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

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    // Check if access_token cookie exists by trying to fetch events
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
                AgentPassport Lite
              </h1>
              <p className="text-slate-600">
                Secure AI agent access to Google Calendar via Auth0 Token Vault
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
                  onClick={handleConnect}
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

            {/* Events Section */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Calendar Events</CardTitle>
                    <CardDescription>
                      Retrieved securely via the AgentPassport gateway
                    </CardDescription>
                  </div>
                  <div className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded">
                    {events.length} event{events.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>No upcoming events found in your calendar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-slate-900 text-lg">
                            {event.summary}
                          </h3>
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {formatEventTime(event)}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-slate-600 mb-2">
                            {event.description}
                          </p>
                        )}
                        {event.organizer && (
                          <p className="text-xs text-slate-500">
                            Organizer: {event.organizer.displayName || event.organizer.email}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

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
