export interface GoogleMeetSpace {
  name: string; // e.g. "spaces/abc-defg-hij"
  meetingUri: string; // e.g. "https://meet.google.com/abc-defg-hij"
  meetingCode?: string; // e.g. "abc-defg-hij"
  config?: {
    accessType?: string;
    entryPointAccess?: string;
  };
}

/**
 * Creates a real Google Meet Space using the Google Meet v2 REST API.
 * Scope required: https://www.googleapis.com/auth/meetings.space.created
 */
export async function createGoogleMeetSpace(accessToken: string): Promise<GoogleMeetSpace> {
  const response = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Meet API error:', response.status, errorText);
    throw new Error(`Google Meet API call failed (${response.status}): ${errorText}`);
  }

  const space: GoogleMeetSpace = await response.json();
  return space;
}

/**
 * Fetches details for an existing Google Meet Space.
 * Scope required: https://www.googleapis.com/auth/meetings.space.readonly
 */
export async function getGoogleMeetSpace(accessToken: string, spaceName: string): Promise<GoogleMeetSpace> {
  // spaceName expected format: "spaces/{spaceId}" or raw id
  const formattedName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;

  const response = await fetch(`https://meet.googleapis.com/v2/${formattedName}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Google Meet space (${response.status}): ${errorText}`);
  }

  return await response.json();
}
