# Hand Detection and Tracking System

A complete, feature-rich real-time hand detection and tracking system built for the Dheera AI Internship Assessment. It processes webcam video entirely in the browser using WebAssembly and GPU acceleration.

## Features Implemented

*   **Core Detection**: Real-time rendering of hand landmarks directly over a live webcam feed.
*   **Multi-Hand Tracking**: Accurately detects and tracks up to 4 hands simultaneously.
*   **Handedness Identification**: Distinguishes and labels Left vs Right hands.
*   **Custom Gesture Recognition**: Features a rotation-invariant geometric engine to accurately detect:
    *   ✌️ Peace Sign
    *   ✋ Open Palm
    *   👍 Thumbs Up
    *   ✊ Fist
*   **Dynamic Visualizations**: Toggle seamlessly between Skeleton mode, Bounding Box mode, and Heatmap mode.
*   **Video Recording**: A highly complex composite canvas system allows users to seamlessly record the live feed with all visual overlays intact, and export it instantly as a `.webm` file.
*   **Premium UI**: A polished dark theme, glassmorphism panels, responsive layout, and beautiful iconography.

## Technology Stack

*   **Frontend**: React + Vite
*   **Computer Vision**: MediaPipe Tasks Vision (`@mediapipe/tasks-vision`)
*   **Styling**: Vanilla CSS
*   **Icons**: Lucide React (`lucide-react`)

## Setup Instructions

1.  **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
2.  **Clone/Download**: Download this repository and navigate into the project directory in your terminal.
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
5.  **Open Application**: Navigate to `http://localhost:5173` (or the URL provided in your terminal) in your web browser.

## AI Tools Used

During the development of this project, AI coding assistants (like Google Antigravity) were utilized to:
*   Generate the initial implementation plan and phase breakdown.
*   Rapidly scaffold the React boilerplate and MediaPipe integration code.
*   Engineer the complex rotation-invariant geometric formulas used for the custom gesture recognition system.
*   Write modern, responsive CSS styling for the premium UI.

## Challenges Faced & Solutions

*   **Recording with Overlays**: Standard HTML `<video>` elements cannot be exported with HTML `<canvas>` overlays on top of them. To solve this, the raw webcam frames are mathematically mirrored and painted directly onto the canvas *underneath* the skeleton and labels on every single animation frame. This creates a single composited video stream that is fully recordable without losing any overlays or text readability!
*   **Robust Gesture Recognition**: Simple distance checks (e.g. comparing Y coordinates) failed when the hand was rotated or tilted. Solved by implementing a geometric algorithm that compares the distance of the thumb tip to the center of the palm versus the thumb joint to the center of the palm, making the gesture engine completely rotation-invariant.

---

**Developed by P Saanvi ([@psaanvibhat](https://github.com/psaanvibhat))**
