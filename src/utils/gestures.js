export const detectGesture = (landmarks) => {
  // Helper to calculate distance between two landmarks
  const dist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  // A finger is "extended" if its tip is further from the wrist (0) than its PIP joint.
  // This distance-based check is robust regardless of hand rotation.
  const isIndexExtended = dist(landmarks[8], landmarks[0]) > dist(landmarks[6], landmarks[0]);
  const isMiddleExtended = dist(landmarks[12], landmarks[0]) > dist(landmarks[10], landmarks[0]);
  const isRingExtended = dist(landmarks[16], landmarks[0]) > dist(landmarks[14], landmarks[0]);
  const isPinkyExtended = dist(landmarks[20], landmarks[0]) > dist(landmarks[18], landmarks[0]);

  // For the thumb, we compare how far the tip (4) and the IP joint (3) are from the center of the hand (middle knuckle 9).
  // In a fist or peace sign, the thumb folds ACROSS the palm, meaning the tip (4) gets closer to the center than the IP joint (3).
  // In an open palm or thumbs up, the thumb points OUTWARD, meaning the tip (4) is further away from the center than the IP joint (3).
  const isThumbExtended = dist(landmarks[4], landmarks[9]) > dist(landmarks[3], landmarks[9]);

  // Peace Sign: Index and Middle extended. Ring and Pinky NOT extended. Thumb folded.
  if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended && !isThumbExtended) {
    return "Peace Sign";
  }

  // Open Palm: All fingers extended.
  if (isThumbExtended && isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
    return "Open Palm";
  }

  // Thumbs Up: Only the thumb is extended out.
  if (isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return "Thumbs Up";
  }

  // Fist: No fingers extended, and thumb is folded in.
  if (!isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return "Fist";
  }

  return "";
};
