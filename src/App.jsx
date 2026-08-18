import React, { useRef, useEffect, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { drawHandLandmarks } from './utils/drawing';
import { detectGesture } from './utils/gestures';
import { Camera, CameraOff, Video, Square, Layers, Square as SquareIcon, Disc, Download, Settings, Activity } from 'lucide-react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [handLandmarker, setHandLandmarker] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [viewMode, setViewModeState] = useState('bounding_box');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [fps, setFps] = useState(0);
  
  const viewModeRef = useRef('bounding_box');
  const framesRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  const setViewMode = (mode) => {
    setViewModeState(mode);
    viewModeRef.current = mode;
  };

  useEffect(() => {
    const initModel = async () => {
      setIsModelLoading(true);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 4, 
        });
        setHandLandmarker(landmarker);
      } catch (error) {
        console.error("Failed to load MediaPipe model:", error);
      }
      setIsModelLoading(false);
    };
    initModel();
  }, []);

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsCameraOn(true);
          setRecordedVideoUrl(null);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    } else {
      alert("getUserMedia not supported in this browser.");
    }
  };

  const stopCamera = () => {
    if (isRecording) stopRecording();

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const startRecording = () => {
    if (!canvasRef.current) return;
    
    recordedChunksRef.current = [];
    const stream = canvasRef.current.captureStream(30); 
    
    try {
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
    } catch (e) {
      mediaRecorderRef.current = new MediaRecorder(stream); 
    }

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    setRecordedVideoUrl(null);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const predictWebcam = () => {
    if (!videoRef.current || !canvasRef.current || !handLandmarker) return;

    // Calculate FPS
    const now = performance.now();
    framesRef.current++;
    if (now - lastTimeRef.current >= 1000) {
      setFps(framesRef.current);
      framesRef.current = 0;
      lastTimeRef.current = now;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (video.videoWidth > 0 && video.videoHeight > 0) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    }

    ctx.save();
    if (canvas.width > 0) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      if (video.currentTime > 0 && !video.paused && !video.ended) {
        const results = handLandmarker.detectForVideo(video, performance.now());
        
        if (results.landmarks) {
          results.landmarks.forEach((landmarks, index) => {
            let handName = "Hand";
            if (results.handednesses && results.handednesses[index]) {
              handName = results.handednesses[index][0].displayName; 
            }
            const gesture = detectGesture(landmarks);
            const label = gesture ? `${handName} #${index + 1}: ${gesture}` : `${handName} #${index + 1}`;
            
            drawHandLandmarks(ctx, landmarks, canvas.width, canvas.height, viewModeRef.current, label);
          });
        }
      }
    }
    ctx.restore();
    
    if (isCameraOn) {
      requestAnimationFrame(predictWebcam);
    }
  };

  useEffect(() => {
    if (isCameraOn) {
      requestAnimationFrame(predictWebcam);
    }
  }, [isCameraOn]);

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <h1>Hand Tracking</h1>
        </div>

        <nav className="tool-sections">
          <div className="tool-group">
            <h3>Camera Settings</h3>
            <div className="widget-box">
              {!isCameraOn ? (
                <button onClick={startCamera} disabled={isModelLoading} className="widget-btn primary">
                  <Camera size={18} />
                  <span>{isModelLoading ? "Loading AI..." : "Start Camera"}</span>
                </button>
              ) : (
                <button onClick={stopCamera} className="widget-btn danger">
                  <Square size={18} />
                  <span>Stop Camera</span>
                </button>
              )}
            </div>
          </div>

          <div className="tool-group">
            <h3>Visualizations</h3>
            <div className="widget-box column">
              <label className={`widget-toggle ${viewMode === 'skeleton' ? 'active' : ''}`}>
                <input type="radio" value="skeleton" checked={viewMode === 'skeleton'} onChange={(e) => setViewMode(e.target.value)} />
                <Layers size={16} /> <span>Skeleton Only</span>
              </label>
              <label className={`widget-toggle ${viewMode === 'bounding_box' ? 'active' : ''}`}>
                <input type="radio" value="bounding_box" checked={viewMode === 'bounding_box'} onChange={(e) => setViewMode(e.target.value)} />
                <SquareIcon size={16} /> <span>Bounding Box</span>
              </label>
              <label className={`widget-toggle ${viewMode === 'heatmap' ? 'active' : ''}`}>
                <input type="radio" value="heatmap" checked={viewMode === 'heatmap'} onChange={(e) => setViewMode(e.target.value)} />
                <Activity size={16} /> <span>Heatmap</span>
              </label>
              <label className={`widget-toggle ${viewMode === 'both' ? 'active' : ''}`}>
                <input type="radio" value="both" checked={viewMode === 'both'} onChange={(e) => setViewMode(e.target.value)} />
                <Video size={16} /> <span>All Overlay</span>
              </label>
            </div>
          </div>

          <div className="tool-group">
            <h3>Recording</h3>
            <div className="widget-box column">
              {!isRecording ? (
                <button 
                  onClick={startRecording} 
                  disabled={!isCameraOn} 
                  className="widget-btn record"
                >
                  <Disc size={18} />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button onClick={stopRecording} className="widget-btn record-active">
                  <Square size={18} />
                  <span>Stop Recording</span>
                </button>
              )}

              {recordedVideoUrl && !isRecording && (
                <a href={recordedVideoUrl} download="hand-tracking-session.webm" className="widget-btn success">
                  <Download size={18} />
                  <span>Download Video</span>
                </a>
              )}
            </div>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <span>
            By <a href="https://github.com/psaanvibhat" target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'underline'}}>P Saanvi</a>
          </span>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="workspace">
        <div className="workspace-header">
          <h2>Live Detection Feed</h2>
          {isRecording && (
            <div className="status-badge pulse">
              <span className="dot"></span> Recording
            </div>
          )}
          {isCameraOn && !isRecording && (
             <div className="status-badge active">
               <span className="dot"></span> Active
             </div>
          )}
        </div>

        <div className="video-container">
          <div className="canvas-wrapper">
            {isCameraOn && (
              <div className="fps-counter">
                <span className="fps-value">{fps}</span>
                <span className="fps-label">FPS</span>
              </div>
            )}
            
            <video 
              ref={videoRef} 
              className="hidden"
              autoPlay 
              playsInline
              muted
            />
            
            <canvas 
              ref={canvasRef} 
              className={`canvas-composite ${!isCameraOn ? 'hidden' : ''}`}
            />
            
            {!isCameraOn && !recordedVideoUrl && (
              <div className="empty-state">
                <CameraOff size={64} className="empty-icon" />
                <h3>No video feed</h3>
                <p>Start your camera from the sidebar to begin tracking.</p>
              </div>
            )}

            {!isCameraOn && recordedVideoUrl && (
              <video 
                src={recordedVideoUrl} 
                className="canvas-composite" 
                controls 
                autoPlay 
                loop 
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
