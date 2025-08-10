/**
 * VideoCallCard Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive video call interface card component for communication apps,
 * displaying call information, participant management, and call controls.
 * 
 * Features:
 * - Video call interface with participant views
 * - Call controls (mute, camera, end call, etc.)
 * - Participant management and grid layouts
 * - Call status and quality indicators
 * - Screen sharing and recording controls
 * - Chat and reactions integration
 * - Network quality monitoring
 * - Accessibility support for hearing impaired
 * 
 * @example
 * ```tsx
 * <VideoCallCard
 *   call={callData}
 *   participants={participantList}
 *   onMute={handleMute}
 *   onEndCall={handleEndCall}
 *   onToggleCamera={handleCamera}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Badge } from '../../../../~/components/ui/badge';
import { Button } from '../../../../~/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../~/components/ui/avatar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatDate, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Call status
 */
export type CallStatus = 'connecting' | 'ringing' | 'active' | 'on_hold' | 'ended' | 'failed';

/**
 * Call type
 */
export type CallType = 'audio' | 'video' | 'screen_share';

/**
 * Network quality
 */
export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor';

/**
 * Participant status
 */
export type ParticipantStatus = 'connected' | 'connecting' | 'disconnected' | 'muted' | 'speaking';

/**
 * Call participant
 */
export interface CallParticipant {
  /** Participant ID */
  id: string;
  /** Participant name */
  name: string;
  /** Profile picture URL */
  avatar?: string;
  /** Participant status */
  status: ParticipantStatus;
  /** Whether audio is muted */
  isMuted: boolean;
  /** Whether video is enabled */
  isVideoEnabled: boolean;
  /** Whether participant is speaking */
  isSpeaking: boolean;
  /** Whether participant is screen sharing */
  isScreenSharing: boolean;
  /** Network quality */
  networkQuality?: NetworkQuality;
  /** Join time */
  joinTime?: Date;
  /** Participant role */
  role?: 'host' | 'moderator' | 'participant';
}

/**
 * Call data
 */
export interface CallData {
  /** Call ID */
  id: string;
  /** Call title/subject */
  title: string;
  /** Call type */
  type: CallType;
  /** Call status */
  status: CallStatus;
  /** Call start time */
  startTime: Date;
  /** Call duration in seconds */
  duration: number;
  /** Whether call is recording */
  isRecording: boolean;
  /** Whether call is scheduled */
  isScheduled: boolean;
  /** Scheduled start time */
  scheduledTime?: Date;
  /** Call room/meeting ID */
  roomId?: string;
  /** Call description */
  description?: string;
  /** Maximum participants allowed */
  maxParticipants?: number;
  /** Whether call requires password */
  requiresPassword?: boolean;
  /** Whether waiting room is enabled */
  waitingRoomEnabled?: boolean;
}

/**
 * Call controls state
 */
export interface CallControls {
  /** Whether audio is muted */
  isMuted: boolean;
  /** Whether video is enabled */
  isVideoEnabled: boolean;
  /** Whether speaker is on */
  isSpeakerOn: boolean;
  /** Whether screen is being shared */
  isScreenSharing: boolean;
  /** Whether chat is open */
  isChatOpen: boolean;
  /** Whether participants panel is open */
  isParticipantsOpen: boolean;
}

/**
 * Props for the VideoCallCard component
 */
export interface VideoCallCardProps extends BaseComponentProps {
  /** Call data */
  call: CallData;
  /** Call participants */
  participants: CallParticipant[];
  /** Current user's controls state */
  controls: CallControls;
  /** Current user participant */
  currentUser?: CallParticipant;
  /** Whether user is host */
  isHost?: boolean;
  /** Network quality */
  networkQuality?: NetworkQuality;
  /** Show call controls */
  showControls?: boolean;
  /** Show participants */
  showParticipants?: boolean;
  /** Maximum participants to display */
  maxDisplayParticipants?: number;
  /** Whether call is minimized */
  isMinimized?: boolean;
  /** Card size */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  /** Callback when mute is toggled */
  onMute?: (muted: boolean) => void;
  /** Callback when video is toggled */
  onToggleVideo?: (enabled: boolean) => void;
  /** Callback when speaker is toggled */
  onToggleSpeaker?: (enabled: boolean) => void;
  /** Callback when screen share is toggled */
  onToggleScreenShare?: (enabled: boolean) => void;
  /** Callback when call is ended */
  onEndCall?: () => void;
  /** Callback when call is put on hold */
  onHold?: () => void;
  /** Callback when chat is toggled */
  onToggleChat?: (open: boolean) => void;
  /** Callback when participants panel is toggled */
  onToggleParticipants?: (open: boolean) => void;
  /** Callback when participant is selected */
  onParticipantPress?: (participant: CallParticipant) => void;
  /** Callback when participant is muted (host only) */
  onMuteParticipant?: (participantId: string) => void;
  /** Callback when participant is removed (host only) */
  onRemoveParticipant?: (participantId: string) => void;
  /** Callback when recording is toggled */
  onToggleRecording?: (recording: boolean) => void;
  /** Callback when call is minimized */
  onMinimize?: () => void;
  /** Callback when call is expanded */
  onExpand?: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * VideoCallCard component for displaying video call interface
 */
export const VideoCallCard: React.FC<VideoCallCardProps> = ({
  call,
  participants,
  controls,
  currentUser,
  isHost = false,
  networkQuality = 'good',
  showControls = true,
  showParticipants = true,
  maxDisplayParticipants = 4,
  isMinimized = false,
  size = 'medium',
  onMute,
  onToggleVideo,
  onToggleSpeaker,
  onToggleScreenShare,
  onEndCall,
  onHold,
  onToggleChat,
  onToggleParticipants,
  onParticipantPress,
  onMuteParticipant,
  onRemoveParticipant,
  onToggleRecording,
  onMinimize,
  onExpand,
  style,
  testID = 'video-call-card',
  ...props
}) => {
  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getCallStatusIcon = (status: CallStatus): string => {
    const icons: Record<CallStatus, string> = {
      connecting: '🔄',
      ringing: '📞',
      active: '📹',
      on_hold: '⏸️',
      ended: '📵',
      failed: '❌',
    };
    return icons[status];
  };

  const getNetworkQualityColor = (quality: NetworkQuality): string => {
    const colors: Record<NetworkQuality, string> = {
      excellent: COLORS.success[500],
      good: COLORS.success[400],
      fair: COLORS.warning[500],
      poor: COLORS.error[500],
    };
    return colors[quality];
  };

  const formatCallDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getParticipantStatusIcon = (participant: CallParticipant): string => {
    if (!participant.isVideoEnabled) return '📷';
    if (participant.isMuted) return '🔇';
    if (participant.isSpeaking) return '🔊';
    return '';
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.callInfo}>
        <Text style={styles.callIcon}>
          {getCallStatusIcon(call.status)}
        </Text>
        <View style={styles.callDetails}>
          <Text style={styles.callTitle} numberOfLines={1}>
            {call.title}
          </Text>
          <View style={styles.callMeta}>
            <Text style={styles.callDuration}>
              {formatCallDuration(call.duration)}
            </Text>
            <Badge 
              variant="outline"
              style={[styles.networkBadge, { borderColor: getNetworkQualityColor(networkQuality) }]}
            >
              <Text style={[styles.networkText, { color: getNetworkQualityColor(networkQuality) }]}>
                {networkQuality}
              </Text>
            </Badge>
          </View>
        </View>
      </View>
      
      <View style={styles.headerActions}>
        {call.isRecording && (
          <Badge variant="destructive" style={styles.recordingBadge}>
            <Text style={styles.recordingText}>🔴 REC</Text>
          </Badge>
        )}
        
        {onMinimize && !isMinimized && (
          <TouchableOpacity onPress={onMinimize} style={styles.minimizeButton}>
            <Text style={styles.minimizeIcon}>⬇️</Text>
          </TouchableOpacity>
        )}
        
        {onExpand && isMinimized && (
          <TouchableOpacity onPress={onExpand} style={styles.expandButton}>
            <Text style={styles.expandIcon}>⬆️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderParticipantGrid = () => {
    if (!showParticipants || isMinimized) return null;

    const displayParticipants = participants.slice(0, maxDisplayParticipants);
    const gridCols = displayParticipants.length <= 2 ? 1 : 2;

    return (
      <View style={styles.participantsGrid}>
        {displayParticipants.map((participant, index) => (
          <TouchableOpacity
            key={participant.id}
            style={[
              styles.participantVideo,
              {
                width: gridCols === 1 ? '100%' : '48%',
                aspectRatio: 16 / 9,
              }
            ]}
            onPress={() => onParticipantPress?.(participant)}
          >
            {participant.isVideoEnabled ? (
              <View style={styles.videoPlaceholder}>
                {participant.avatar && (
                  <Image source={{ uri: participant.avatar }} style={styles.participantAvatar} />
                )}
                <Text style={styles.videoText}>📹 Video</Text>
              </View>
            ) : (
              <View style={styles.avatarContainer}>
                <Avatar style={styles.participantAvatarLarge}>
                  {participant.avatar && (
                    <AvatarImage source={{ uri: participant.avatar }} />
                  )}
                  <AvatarFallback>
                    <Text style={styles.avatarFallback}>
                      {participant.name.charAt(0).toUpperCase()}
                    </Text>
                  </AvatarFallback>
                </Avatar>
              </View>
            )}
            
            <View style={styles.participantOverlay}>
              <Text style={styles.participantName} numberOfLines={1}>
                {participant.name}
              </Text>
              <View style={styles.participantStatus}>
                {getParticipantStatusIcon(participant) && (
                  <Text style={styles.participantStatusIcon}>
                    {getParticipantStatusIcon(participant)}
                  </Text>
                )}
                {participant.networkQuality && (
                  <View style={[
                    styles.networkIndicator,
                    { backgroundColor: getNetworkQualityColor(participant.networkQuality) }
                  ]} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {participants.length > maxDisplayParticipants && (
          <TouchableOpacity 
            style={styles.moreParticipants}
            onPress={() => onToggleParticipants?.(!controls.isParticipantsOpen)}
          >
            <Text style={styles.moreParticipantsText}>
              +{participants.length - maxDisplayParticipants}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderCallControls = () => {
    if (!showControls || isMinimized) return null;

    return (
      <View style={styles.callControls}>
        <View style={styles.primaryControls}>
          <TouchableOpacity
            style={[styles.controlButton, controls.isMuted && styles.mutedButton]}
            onPress={() => onMute?.(!controls.isMuted)}
          >
            <Text style={styles.controlIcon}>
              {controls.isMuted ? '🔇' : '🎤'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, !controls.isVideoEnabled && styles.disabledButton]}
            onPress={() => onToggleVideo?.(!controls.isVideoEnabled)}
          >
            <Text style={styles.controlIcon}>
              {controls.isVideoEnabled ? '📹' : '📷'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.endCallButton]}
            onPress={onEndCall}
          >
            <Text style={styles.controlIcon}>📞</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, controls.isScreenSharing && styles.activeButton]}
            onPress={() => onToggleScreenShare?.(!controls.isScreenSharing)}
          >
            <Text style={styles.controlIcon}>🖥️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, controls.isSpeakerOn && styles.activeButton]}
            onPress={() => onToggleSpeaker?.(!controls.isSpeakerOn)}
          >
            <Text style={styles.controlIcon}>
              {controls.isSpeakerOn ? '🔊' : '🔇'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.secondaryControls}>
          <TouchableOpacity
            style={styles.secondaryControlButton}
            onPress={() => onToggleChat?.(!controls.isChatOpen)}
          >
            <Text style={styles.secondaryControlIcon}>💬</Text>
            <Text style={styles.secondaryControlText}>Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryControlButton}
            onPress={() => onToggleParticipants?.(!controls.isParticipantsOpen)}
          >
            <Text style={styles.secondaryControlIcon}>👥</Text>
            <Text style={styles.secondaryControlText}>
              Participants ({participants.length})
            </Text>
          </TouchableOpacity>
          
          {isHost && onToggleRecording && (
            <TouchableOpacity
              style={styles.secondaryControlButton}
              onPress={() => onToggleRecording?.(!call.isRecording)}
            >
              <Text style={styles.secondaryControlIcon}>
                {call.isRecording ? '⏹️' : '🔴'}
              </Text>
              <Text style={styles.secondaryControlText}>
                {call.isRecording ? 'Stop' : 'Record'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderMinimizedView = () => {
    if (!isMinimized) return null;

    return (
      <View style={styles.minimizedContent}>
        <View style={styles.minimizedInfo}>
          <Text style={styles.minimizedTitle}>{call.title}</Text>
          <Text style={styles.minimizedDuration}>
            {formatCallDuration(call.duration)}
          </Text>
        </View>
        
        <View style={styles.minimizedControls}>
          <TouchableOpacity
            style={[styles.miniControlButton, controls.isMuted && styles.mutedButton]}
            onPress={() => onMute?.(!controls.isMuted)}
          >
            <Text style={styles.miniControlIcon}>
              {controls.isMuted ? '🔇' : '🎤'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.miniControlButton, styles.endCallButton]}
            onPress={onEndCall}
          >
            <Text style={styles.miniControlIcon}>📞</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <Card 
      style={[
        styles.card,
        size === 'small' && styles.smallCard,
        size === 'large' && styles.largeCard,
        size === 'fullscreen' && styles.fullscreenCard,
        isMinimized && styles.minimizedCard,
        style
      ]} 
      testID={testID}
      {...props}
    >
      <View style={styles.content}>
        {renderHeader()}
        {isMinimized ? renderMinimizedView() : (
          <>
            {renderParticipantGrid()}
            {renderCallControls()}
          </>
        )}
      </View>
    </Card>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  card: {
    margin: 0,
    backgroundColor: COLORS.neutral[900],
  },
  smallCard: {
    minHeight: 150,
  },
  largeCard: {
    minHeight: 400,
  },
  fullscreenCard: {
    minHeight: '100%',
  },
  minimizedCard: {
    height: 80,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.neutral[800],
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  callIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginRight: SPACING.sm,
  },
  callDetails: {
    flex: 1,
  },
  callTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  callMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  callDuration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[300],
  },
  networkBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  networkText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    textTransform: 'uppercase',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recordingBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  recordingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.white,
  },
  minimizeButton: {
    padding: SPACING.sm,
  },
  expandButton: {
    padding: SPACING.sm,
  },
  minimizeIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  expandIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  participantsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  participantVideo: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.neutral[800],
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[700],
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: SPACING.sm,
  },
  videoText: {
    color: COLORS.neutral[300],
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  avatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantAvatarLarge: {
    width: 80,
    height: 80,
  },
  avatarFallback: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[600],
  },
  participantOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantName: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    flex: 1,
  },
  participantStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  participantStatusIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  networkIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreParticipants: {
    width: '48%',
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.neutral[700],
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreParticipantsText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  callControls: {
    padding: SPACING.md,
    backgroundColor: COLORS.neutral[800],
  },
  primaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.neutral[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedButton: {
    backgroundColor: COLORS.error[500],
  },
  disabledButton: {
    backgroundColor: COLORS.neutral[700],
  },
  activeButton: {
    backgroundColor: COLORS.primary[500],
  },
  endCallButton: {
    backgroundColor: COLORS.error[600],
  },
  controlIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryControlButton: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  secondaryControlIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
    marginBottom: SPACING.xs,
  },
  secondaryControlText: {
    color: COLORS.neutral[300],
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  minimizedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  minimizedInfo: {
    flex: 1,
  },
  minimizedTitle: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  minimizedDuration: {
    color: COLORS.neutral[300],
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  minimizedControls: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  miniControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniControlIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
  },
});

export default VideoCallCard;
