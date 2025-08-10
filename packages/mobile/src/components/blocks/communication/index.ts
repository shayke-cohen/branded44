/**
 * Communication Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all communication-related block components with their TypeScript definitions.
 * These components are optimized for AI agent consumption and code generation.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

// === VIDEO CALL COMPONENTS ===

export { default as VideoCallCard } from './VideoCallCard';
export type { 
  VideoCallCardProps,
  CallData,
  CallParticipant,
  CallControls,
  CallStatus,
  CallType,
  NetworkQuality,
  ParticipantStatus
} from './VideoCallCard';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { formatDate, cn } from '../../../lib/utils';

/**
 * AI Agent Usage Guide for Communication Blocks
 * 
 * Quick Selection Guide:
 * - VideoCallCard: Video call interface, participant management, call controls
 * 
 * Common Implementation Patterns:
 * 
 * 1. Video Call Interface:
 * ```tsx
 * <VideoCallCard
 *   call={callData}
 *   participants={participantList}
 *   controls={callControls}
 *   isHost={true}
 *   onMute={handleMute}
 *   onEndCall={handleEndCall}
 * />
 * ```
 * 
 * 2. Minimized Call View:
 * ```tsx
 * <VideoCallCard
 *   call={callData}
 *   participants={participants}
 *   controls={controls}
 *   isMinimized={true}
 *   size="small"
 *   onExpand={handleExpand}
 * />
 * ```
 * 
 * 3. Conference Call:
 * ```tsx
 * <VideoCallCard
 *   call={conferenceData}
 *   participants={allParticipants}
 *   controls={hostControls}
 *   isHost={true}
 *   maxDisplayParticipants={6}
 *   onMuteParticipant={handleMuteParticipant}
 *   onRemoveParticipant={handleRemoveParticipant}
 * />
 * ```
 * 
 * Performance Tips:
 * - Optimize video rendering for multiple participants
 * - Cache participant data for quick access
 * - Use efficient audio/video stream management
 * - Implement proper cleanup on component unmount
 * 
 * Accessibility Features:
 * - Screen reader support for call controls
 * - Keyboard navigation for call interface
 * - Visual indicators for audio-only participants
 * - Closed captioning support for hearing impaired
 */
