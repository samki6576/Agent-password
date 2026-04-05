export interface CalendarEvent {
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

export interface CalendarResponse {
  items: CalendarEvent[];
  nextPageToken?: string;
}

export async function getCalendarEvents(accessToken: string): Promise<CalendarEvent[]> {
  if (!accessToken) {
    throw new Error('Access token is required to fetch calendar events');
  }

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (response.status === 401) {
    throw new Error('Unauthorized: Access token may be expired or invalid');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Google Calendar API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data: CalendarResponse = await response.json();
  return data.items || [];
}

export function formatEventTime(event: CalendarEvent): string {
  const startTime = event.start.dateTime || event.start.date;
  if (!startTime) return 'No time specified';

  const date = new Date(startTime);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
