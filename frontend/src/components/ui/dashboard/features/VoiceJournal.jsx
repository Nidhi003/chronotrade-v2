"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Pause, Trash2, Volume2 } from "lucide-react";

export default function VoiceJournal({ entries = [], onSave = () => {} }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState(entries);
  const [playingId, setPlayingId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRefs = useRef({});
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const newEntry = {
          id: Date.now(),
          url,
          blob,
          duration: 0,
          timestamp: new Date().toISOString(),
          transcription: ''
        };
        setRecordings(prev => [newEntry, ...prev]);
        onSave([newEntry, ...prev]);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const playRecording = (id) => {
    const audio = audioRefs.current[id];
    if (audio) {
      if (playingId === id) {
        audio.pause();
        setPlayingId(null);
      } else {
        Object.values(audioRefs.current).forEach(a => a.pause());
        audio.play();
        setPlayingId(id);
      }
    }
  };
  
  const deleteRecording = (id) => {
    setRecordings(prev => prev.filter(e => e.id !== id));
    if (playingId === id) setPlayingId(null);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Mic className="h-6 w-6 text-pink-500" />
          Voice Journal
        </h2>
        <p className="text-slate-400">Record emotional state & trade notes</p>
      </div>
      
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isRecording 
                ? 'bg-rose-500 animate-pulse' 
                : 'bg-gradient-to-br from-pink-500 to-purple-600'
            }`}
          >
            {isRecording ? (
              <Square className="h-8 w-8 text-white" />
            ) : (
              <Mic className="h-8 w-8 text-white" />
            )}
          </motion.button>
        </div>
        
        <p className="text-center text-slate-400 mb-4">
          {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
        </p>
        
        {isRecording && (
          <div className="flex justify-center mb-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [10, 30, 10] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  className="w-2 bg-pink-500 rounded-full"
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {recordings.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-white">Recent Recordings</h3>
            {recordings.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                <button
                  onClick={() => playRecording(entry.id)}
                  className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-500 transition"
                >
                  {playingId === entry.id ? (
                    <Pause className="h-5 w-5 text-white" />
                  ) : (
                    <Play className="h-5 w-5 text-white" />
                  )}
                </button>
                
                <audio
                  ref={el => audioRefs.current[entry.id] = el}
                  src={entry.url}
                  onEnded={() => setPlayingId(null)}
                />
                
                <div className="flex-1">
                  <p className="text-white text-sm">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {entry.transcription || 'Voice note'}
                  </p>
                </div>
                
                <button
                  onClick={() => deleteRecording(entry.id)}
                  className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center hover:bg-rose-600 transition"
                >
                  <Trash2 className="h-4 w-4 text-slate-400 hover:text-white" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
      
      <div className="glass rounded-xl p-4">
        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-pink-500" />
          Why Voice Notes?
        </h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Capture emotional state immediately after trades</li>
          <li>• Quicker than typing for real-time thoughts</li>
          <li>• Review tone & confidence in your decision-making</li>
          <li>• Build a library of mental notes for self-improvement</li>
        </ul>
      </div>
    </div>
  );
}