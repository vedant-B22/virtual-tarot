import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Sparkles, User, Maximize2, Minimize2 } from 'lucide-react';

interface VideoRoomProps {
  socket: Socket | null;
  sessionId: string;
  role: 'admin' | 'client';
  userName: string;
  otherParticipantOnline: boolean;
}

export const VideoRoom: React.FC<VideoRoomProps> = ({
  socket,
  sessionId,
  role,
  userName,
  otherParticipantOnline
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [callActive, setCallActive] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Initialize Local Media Stream
  const startLocalMedia = async () => {
    try {
      setMediaError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, frameRate: 24 },
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCallActive(true);
      initPeerConnection(stream);
    } catch (err: unknown) {
      console.warn("Could not access camera/mic:", err);
      setMediaError("Camera/Mic not detected or blocked. You can still participate via real-time audio/ritual!");
      setCallActive(true);
    }
  };

  const initPeerConnection = (stream: MediaStream) => {
    if (!socket) return;

    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      });

      // Add local tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote track
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        }
      };

      // ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc_signal', {
            signal: { candidate: event.candidate },
            sessionId
          });
        }
      };

      peerConnectionRef.current = pc;

      // Reader creates offer if seeker is present
      if (role === 'admin' && otherParticipantOnline) {
        createOffer(pc);
      }
    } catch (e) {
      console.error("WebRTC Init error:", e);
    }
  };

  const createOffer = async (pc: RTCPeerConnection) => {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.emit('webrtc_signal', {
        signal: { offer },
        sessionId
      });
    } catch (e) {
      console.error("Error creating offer:", e);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleSignal = async ({ signal }: { signal: { offer?: RTCSessionDescriptionInit; answer?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit } }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      try {
        if (signal.offer) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc_signal', {
            signal: { answer },
            sessionId
          });
        } else if (signal.answer) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
        } else if (signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.error("Error handling WebRTC signal:", err);
      }
    };

    socket.on('webrtc_signal', handleSignal);

    return () => {
      socket.off('webrtc_signal', handleSignal);
    };
  }, [socket, sessionId]);

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    peerConnectionRef.current?.close();
    setCallActive(false);
    setLocalStream(null);
    setRemoteStream(null);
  };

  if (!callActive) {
    return (
      <button
        onClick={startLocalMedia}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-xs font-medium transition shadow-md hover:shadow-purple-500/20"
      >
        <Video size={14} className="text-purple-300" />
        <span>Join Live Video/Audio</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-40 bg-[#120d24]/95 backdrop-blur-md border border-purple-500/40 rounded-2xl shadow-2xl p-2.5 transition-all duration-300 ${
      isMinimized ? 'w-64' : 'w-80 sm:w-96'
    }`}>
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-500/20 px-1 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-purple-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Sanctuary Audio/Video</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-purple-800/50 rounded text-purple-400 hover:text-purple-200 transition"
          >
            {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>
        </div>
      </div>

      {mediaError && (
        <div className="p-2 mb-2 rounded bg-amber-950/50 border border-amber-600/40 text-[11px] text-amber-200 leading-snug">
          {mediaError}
        </div>
      )}

      {/* Video Streams */}
      {!isMinimized && (
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          {/* Remote Feed (Other Person) */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-purple-500/30 flex items-center justify-center">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-3 text-center">
                <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/40 flex items-center justify-center mb-1">
                  <User size={18} className="text-purple-300" />
                </div>
                <span className="text-[10px] text-purple-300 font-medium">
                  {role === 'admin' ? 'Seeker (Client)' : 'Reader (Admin)'}
                </span>
                <span className="text-[9px] text-purple-400/70">
                  {otherParticipantOnline ? 'Connected' : 'Waiting...'}
                </span>
              </div>
            )}
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-purple-200">
              {role === 'admin' ? 'Client' : 'Reader'}
            </span>
          </div>

          {/* Local Feed (You) */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-purple-500/30 flex items-center justify-center">
            {localStream && videoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-3 text-center">
                <div className="w-10 h-10 rounded-full bg-purple-950/60 border border-amber-500/30 flex items-center justify-center mb-1">
                  <Sparkles size={16} className="text-amber-400" />
                </div>
                <span className="text-[10px] text-amber-200 font-medium">
                  {userName} (You)
                </span>
                <span className="text-[9px] text-purple-400/70">
                  {videoEnabled ? 'Audio Active' : 'Camera Off'}
                </span>
              </div>
            )}
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-amber-300">
              You ({role === 'admin' ? 'Reader' : 'Seeker'})
            </span>
          </div>
        </div>
      )}

      {/* Media Controls */}
      <div className="flex items-center justify-center gap-2 pt-1 border-t border-purple-500/20">
        <button
          onClick={toggleAudio}
          className={`p-2 rounded-full transition ${
            audioEnabled
              ? 'bg-purple-800/80 hover:bg-purple-700 text-purple-100'
              : 'bg-rose-900/80 hover:bg-rose-800 text-rose-200'
          }`}
          title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
        >
          {audioEnabled ? <Mic size={14} /> : <MicOff size={14} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-2 rounded-full transition ${
            videoEnabled
              ? 'bg-purple-800/80 hover:bg-purple-700 text-purple-100'
              : 'bg-rose-900/80 hover:bg-rose-800 text-rose-200'
          }`}
          title={videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
        >
          {videoEnabled ? <Video size={14} /> : <VideoOff size={14} />}
        </button>

        <button
          onClick={endCall}
          className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition"
          title="Disconnect Video"
        >
          <PhoneOff size={14} />
        </button>
      </div>
    </div>
  );
};
