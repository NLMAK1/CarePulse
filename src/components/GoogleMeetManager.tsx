import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import { googleSignIn, initGoogleAuth, getCachedAccessToken, googleLogout } from '../lib/googleAuth';
import { createGoogleMeetSpace, GoogleMeetSpace } from '../lib/googleMeet';
import { Video, ExternalLink, Copy, Check, Sparkles, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface GoogleMeetManagerProps {
  appointment?: Appointment;
  onUpdateAppointmentMeetLink?: (appointmentId: string, meetLink: string, spaceName: string) => void;
  compact?: boolean;
}

export const GoogleMeetManager: React.FC<GoogleMeetManagerProps> = ({
  appointment,
  onUpdateAppointmentMeetLink,
  compact = false,
}) => {
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getCachedAccessToken());
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [isCreatingMeet, setIsCreatingMeet] = useState<boolean>(false);
  const [createdMeet, setCreatedMeet] = useState<GoogleMeetSpace | null>(
    appointment?.googleMeetLink
      ? {
          name: appointment.googleMeetSpaceName || 'spaces/existing',
          meetingUri: appointment.googleMeetLink,
        }
      : null
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (appointment?.googleMeetLink) {
      setCreatedMeet({
        name: appointment.googleMeetSpaceName || 'spaces/existing',
        meetingUri: appointment.googleMeetLink,
      });
    }
  }, [appointment]);

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMsg(err.message || 'Failed to authenticate with Google.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleCreateMeetSpace = async () => {
    if (!accessToken) {
      // Trigger sign-in first
      await handleGoogleSignIn();
      return;
    }

    setIsCreatingMeet(true);
    setErrorMsg(null);

    try {
      const currentToken = getCachedAccessToken() || accessToken;
      const space = await createGoogleMeetSpace(currentToken);
      setCreatedMeet(space);

      if (appointment && onUpdateAppointmentMeetLink) {
        onUpdateAppointmentMeetLink(appointment.id, space.meetingUri, space.name);
      }
    } catch (err: any) {
      console.error('Failed to create Google Meet space:', err);
      setErrorMsg(
        err.message ||
          'Failed to create Google Meet space. Please check your network connection or sign in again.'
      );
    } finally {
      setIsCreatingMeet(false);
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <Video className="w-4 h-4 text-emerald-600" />
            <span>Google Meet Video Space</span>
          </div>
          {googleUser && (
            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
              {googleUser.email}
            </span>
          )}
        </div>

        {createdMeet ? (
          <div className="flex items-center justify-between gap-2 pt-1">
            <a
              href={createdMeet.meetingUri}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Join Google Meet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => handleCopyLink(createdMeet.meetingUri)}
              className="px-2.5 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-lg hover:bg-emerald-50 transition-all flex items-center gap-1 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleCreateMeetSpace}
            disabled={isCreatingMeet || isAuthLoading}
            className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isCreatingMeet
                ? 'Generating Meet Space...'
                : accessToken
                ? 'Generate Google Meet Space'
                : 'Sign in with Google & Create Meet'}
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E0D3] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#2D332F] flex items-center gap-2">
              Google Meet Integration
              <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 rounded-full font-bold">
                Workspace API
              </span>
            </h3>
            <p className="text-xs text-[#8C8679]">
              Schedule, create, and join real-time encrypted Google Meet virtual rooms.
            </p>
          </div>
        </div>

        {googleUser && (
          <button
            onClick={googleLogout}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 border border-rose-200 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-all"
            title="Sign out of Google"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Google Auth Status Bar */}
      {!googleUser ? (
        <div className="p-4 bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#5A5448]">
            <span className="font-semibold text-[#2D332F]">Google Workspace Status:</span> Disconnected
            <p className="text-[11px] text-[#8C8679]">
              Sign in with your Google account to create official Google Meet conference links.
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isAuthLoading}
            className="gsi-material-button shrink-0 shadow-sm hover:shadow transition-all border border-gray-300 rounded-xl px-4 py-2 bg-white flex items-center gap-2 text-xs font-bold text-gray-700"
          >
            <div className="gsi-material-button-icon w-4 h-4">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
            </div>
            <span>{isAuthLoading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-950">Connected Google User:</span>{' '}
              <span className="text-emerald-800">{googleUser.email || googleUser.displayName}</span>
            </div>
          </div>
          <span className="text-[11px] bg-emerald-200/60 text-emerald-900 px-2.5 py-0.5 rounded-md font-semibold shrink-0">
            Meet Scopes Active
          </span>
        </div>
      )}

      {/* Meet Link Section */}
      {createdMeet ? (
        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-emerald-600" />
              Official Google Meet Room
            </span>
            <span className="text-[11px] text-emerald-700 font-mono bg-emerald-100 px-2 py-0.5 rounded-md">
              {createdMeet.name}
            </span>
          </div>

          <div className="p-2.5 bg-white border border-emerald-200 rounded-lg flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-emerald-950 truncate select-all">
              {createdMeet.meetingUri}
            </span>
            <button
              onClick={() => handleCopyLink(createdMeet.meetingUri)}
              className="p-1.5 text-emerald-800 hover:bg-emerald-100 rounded-md transition-all flex items-center gap-1 text-xs font-semibold shrink-0"
              title="Copy Meet URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <a
              href={createdMeet.meetingUri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Video className="w-4 h-4" />
              <span>Launch Google Meet Room</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleCreateMeetSpace}
              disabled={isCreatingMeet}
              className="px-3 py-2.5 border border-emerald-300 text-emerald-900 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              title="Generate New Google Meet Room"
            >
              <span>Regenerate Link</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleCreateMeetSpace}
          disabled={isCreatingMeet || isAuthLoading}
          className="w-full py-3 bg-[#7A918D] hover:bg-[#5D6F6B] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>
            {isCreatingMeet
              ? 'Creating Google Meet Space...'
              : 'Generate Google Meet Link for Virtual Consultation'}
          </span>
        </button>
      )}
    </div>
  );
};
