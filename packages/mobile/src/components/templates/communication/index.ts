/**
 * Communication Templates Index - AI-Optimized React Native Component Library
 * 
 * This file exports all communication template components (full screens) with comprehensive
 * documentation and examples for AI agents to easily discover and use.
 * 
 * @category Communication Templates
 * @author AI Component System
 * @version 1.0.0
 */

// === COMMUNICATION TEMPLATES ===

export { default as ChatListScreen } from './ChatListScreen';
export type { 
  ChatListScreenProps, 
  ChatListScreenConfig, 
  ChatConversation, 
  ChatFilter, 
  ChatFilterType 
} from './ChatListScreen';

export { default as ChatScreen } from './ChatScreen';
export type { 
  ChatScreenProps, 
  ChatScreenConfig, 
  ChatConversationInfo, 
  MessageDraft 
} from './ChatScreen';

export { default as ContactsScreen } from './ContactsScreen';
export type { 
  ContactsScreenProps, 
  ContactsScreenConfig, 
  Contact, 
  ContactGroup, 
  ContactFilter, 
  ContactFilterType 
} from './ContactsScreen';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { cn } from '../../../lib/utils';
export type { 
  BaseComponentProps
} from '../../../lib/types';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * This section provides comprehensive guidance for AI agents on how to use
 * these communication templates effectively.
 * 
 * ## Quick Template Selection Guide
 * 
 * ### For Chat/Messaging Apps:
 * - Use `ChatListScreen` for conversation lists and chat management
 * - Use `ChatScreen` for individual chat conversations
 * - Includes real-time messaging, media sharing, and group chat features
 * - Built-in typing indicators and read receipts
 * 
 * ### For Contact Management:
 * - Use `ContactsScreen` for contact lists and social connections
 * - Includes search, filtering, and contact organization
 * - Built-in contact actions (call, message, video call)
 * - Support for favorites, categories, and bulk operations
 * 
 * ## Complete Communication Flow Implementation
 * 
 * ### Chat Application:
 * ```tsx
 * // Chat list screen - main messaging hub
 * <ChatListScreen
 *   conversations={userConversations}
 *   onConversationPress={(chat) => navigation.navigate('Chat', { chatId: chat.id })}
 *   onNewChat={() => navigation.navigate('NewChat')}
 *   onNewGroup={() => navigation.navigate('NewGroup')}
 *   onSearch={(query) => handleSearchChats(query)}
 *   onArchiveChat={(chatId) => handleArchiveChat(chatId)}
 *   config={{
 *     showSearch: true,
 *     showFilters: true,
 *     enableSwipeActions: true,
 *     showNewChatButton: true,
 *     enableGroupCreation: true
 *   }}
 * />
 * 
 * // Individual chat screen - messaging interface
 * <ChatScreen
 *   conversation={selectedConversation}
 *   messages={chatMessages}
 *   currentUser={currentUser}
 *   onSendMessage={(message) => handleSendMessage(message)}
 *   onSendMedia={(media) => handleSendMedia(media)}
 *   onMessageReaction={(messageId, reaction) => handleReaction(messageId, reaction)}
 *   onReplyToMessage={(message) => handleReplyToMessage(message)}
 *   onTyping={(isTyping) => handleTyping(isTyping)}
 *   config={{
 *     showTypingIndicators: true,
 *     showOnlineStatus: true,
 *     enableReplies: true,
 *     enableReactions: true,
 *     enableAttachments: true,
 *     enableVoiceMessages: true
 *   }}
 * />
 * ```
 * 
 * ### Contact Management:
 * ```tsx
 * // Contacts screen - social connections
 * <ContactsScreen
 *   contacts={userContacts}
 *   favoriteContacts={favoriteContacts}
 *   recentContacts={recentContacts}
 *   onContactPress={(contact) => navigation.navigate('Profile', { userId: contact.id })}
 *   onCallContact={(contact) => handleCallContact(contact)}
 *   onMessageContact={(contact) => navigation.navigate('Chat', { userId: contact.id })}
 *   onVideoCallContact={(contact) => handleVideoCall(contact)}
 *   onAddContact={() => navigation.navigate('AddContact')}
 *   onImportContacts={() => handleImportContacts()}
 *   config={{
 *     displayStyle: 'alphabetical',
 *     showSearch: true,
 *     showFilters: true,
 *     showFavorites: true,
 *     enableContactActions: true,
 *     enableBulkSelection: true
 *   }}
 * />
 * ```
 * 
 * ## Navigation Integration
 * 
 * ### React Navigation Stack:
 * ```tsx
 * const CommunicationStack = createStackNavigator();
 * 
 * function CommunicationNavigator() {
 *   return (
 *     <CommunicationStack.Navigator screenOptions={{ headerShown: false }}>
 *       <CommunicationStack.Screen name="ChatList" component={ChatListScreen} />
 *       <CommunicationStack.Screen name="Chat" component={ChatScreen} />
 *       <CommunicationStack.Screen name="Contacts" component={ContactsScreen} />
 *     </CommunicationStack.Navigator>
 *   );
 * }
 * ```
 * 
 * ### Tab Navigation Integration:
 * ```tsx
 * const MainTabs = createBottomTabNavigator();
 * 
 * function MainNavigator() {
 *   return (
 *     <MainTabs.Navigator>
 *       <MainTabs.Screen 
 *         name="Chats" 
 *         component={ChatListScreen}
 *         options={{
 *           tabBarBadge: unreadCount > 0 ? unreadCount : undefined
 *         }}
 *       />
 *       <MainTabs.Screen name="Contacts" component={ContactsScreen} />
 *     </MainTabs.Navigator>
 *   );
 * }
 * ```
 * 
 * ## Real-time Integration
 * 
 * ### WebSocket/Socket.IO Integration:
 * ```tsx
 * // Chat with real-time updates
 * function ChatContainer({ route }) {
 *   const { chatId } = route.params;
 *   const { messages, sendMessage, typing } = useChat(chatId);
 *   const { socket } = useSocket();
 * 
 *   useEffect(() => {
 *     socket.on('message', handleNewMessage);
 *     socket.on('typing', handleTyping);
 *     socket.on('read', handleReadReceipt);
 * 
 *     return () => {
 *       socket.off('message');
 *       socket.off('typing');
 *       socket.off('read');
 *     };
 *   }, []);
 * 
 *   return (
 *     <ChatScreen
 *       conversation={conversation}
 *       messages={messages}
 *       onSendMessage={sendMessage}
 *       onTyping={(isTyping) => socket.emit('typing', { chatId, isTyping })}
 *     />
 *   );
 * }
 * 
 * // Chat list with real-time conversation updates
 * function ChatListContainer() {
 *   const { conversations, updateConversation } = useConversations();
 *   const { socket } = useSocket();
 * 
 *   useEffect(() => {
 *     socket.on('conversationUpdate', updateConversation);
 *     socket.on('newMessage', handleNewMessage);
 * 
 *     return () => {
 *       socket.off('conversationUpdate');
 *       socket.off('newMessage');
 *     };
 *   }, []);
 * 
 *   return (
 *     <ChatListScreen
 *       conversations={conversations}
 *       onConversationPress={(chat) => navigation.navigate('Chat', { chatId: chat.id })}
 *     />
 *   );
 * }
 * ```
 * 
 * ## State Management Integration
 * 
 * ### With Redux:
 * ```tsx
 * // Chat management with Redux
 * function ChatScreenContainer({ route }) {
 *   const dispatch = useDispatch();
 *   const { messages, loading, conversation } = useSelector(state => state.chat);
 *   const { currentUser } = useSelector(state => state.auth);
 * 
 *   return (
 *     <ChatScreen
 *       conversation={conversation}
 *       messages={messages}
 *       currentUser={currentUser}
 *       loading={loading}
 *       onSendMessage={(message) => dispatch(sendMessage({ conversationId: route.params.chatId, message }))}
 *       onMessageReaction={(messageId, reaction) => dispatch(addReaction({ messageId, reaction }))}
 *     />
 *   );
 * }
 * 
 * // Contacts management with Redux
 * function ContactsContainer() {
 *   const dispatch = useDispatch();
 *   const { contacts, loading, filters } = useSelector(state => state.contacts);
 * 
 *   return (
 *     <ContactsScreen
 *       contacts={contacts}
 *       loading={loading}
 *       filters={filters}
 *       onContactPress={(contact) => dispatch(selectContact(contact))}
 *       onFavoriteContact={(contactId) => dispatch(toggleFavorite(contactId))}
 *       onAddContact={() => dispatch(openAddContactModal())}
 *     />
 *   );
 * }
 * ```
 * 
 * ### With Context API:
 * ```tsx
 * // Using Chat Context
 * function ChatScreenWrapper() {
 *   const { currentChat, messages, sendMessage, typing } = useChat();
 *   const { currentUser } = useAuth();
 * 
 *   return (
 *     <ChatScreen
 *       conversation={currentChat}
 *       messages={messages}
 *       currentUser={currentUser}
 *       onSendMessage={sendMessage}
 *       onTyping={typing}
 *     />
 *   );
 * }
 * 
 * // Using Contacts Context
 * function ContactsWrapper() {
 *   const { contacts, favoriteContacts, addContact, callContact } = useContacts();
 *   const { makeCall } = useCall();
 * 
 *   return (
 *     <ContactsScreen
 *       contacts={contacts}
 *       favoriteContacts={favoriteContacts}
 *       onCallContact={(contact) => makeCall(contact.phoneNumbers[0]?.number)}
 *       onAddContact={addContact}
 *     />
 *   );
 * }
 * ```
 * 
 * ## Advanced Configuration Examples
 * 
 * ### Customized Chat List:
 * ```tsx
 * <ChatListScreen
 *   conversations={conversations}
 *   config={{
 *     showSearch: true,
 *     showFilters: true,
 *     showOnlineStatus: true,
 *     showTypingIndicators: true,
 *     enableSwipeActions: true,
 *     showNewChatButton: true,
 *     enableGroupCreation: true,
 *     enableArchiving: true,
 *     enablePinning: true,
 *     enableMuting: true,
 *     autoRefreshInterval: 30000,
 *     availableFilters: ['all', 'unread', 'groups', 'direct', 'archived']
 *   }}
 *   filters={[
 *     { type: 'all', label: 'All', count: 25, active: true },
 *     { type: 'unread', label: 'Unread', count: 5, active: false },
 *     { type: 'groups', label: 'Groups', count: 8, active: false }
 *   ]}
 * />
 * ```
 * 
 * ### Feature-rich Chat Screen:
 * ```tsx
 * <ChatScreen
 *   conversation={conversation}
 *   messages={messages}
 *   currentUser={currentUser}
 *   config={{
 *     showTypingIndicators: true,
 *     showOnlineStatus: true,
 *     showReactions: true,
 *     showReadReceipts: true,
 *     enableReplies: true,
 *     enableEditing: true,
 *     enableDeletion: true,
 *     enableAttachments: true,
 *     enableVoiceMessages: true,
 *     enableEmojiPicker: true,
 *     enableTranslation: true,
 *     autoScrollToNew: true,
 *     bubbleStyle: 'modern'
 *   }}
 *   draft={messageDraft}
 *   onDraftChange={setMessageDraft}
 * />
 * ```
 * 
 * ### Advanced Contacts Management:
 * ```tsx
 * <ContactsScreen
 *   contacts={contacts}
 *   contactGroups={contactGroups}
 *   favoriteContacts={favoriteContacts}
 *   config={{
 *     displayStyle: 'alphabetical',
 *     showSearch: true,
 *     showFilters: true,
 *     showAlphabetIndex: true,
 *     showFavorites: true,
 *     showOnlineStatus: true,
 *     showCategories: true,
 *     enableContactActions: true,
 *     enableBulkSelection: true,
 *     enableContactSharing: true,
 *     enableContactImport: true,
 *     availableFilters: ['all', 'favorites', 'recent', 'friends', 'family', 'work', 'online']
 *   }}
 *   filters={[
 *     { type: 'all', label: 'All', count: contacts.length, active: true },
 *     { type: 'favorites', label: 'Favorites', count: favoriteContacts.length, active: false },
 *     { type: 'online', label: 'Online', count: onlineContacts.length, active: false }
 *   ]}
 * />
 * ```
 * 
 * ## Integration with External Services
 * 
 * ### Push Notifications:
 * ```tsx
 * // Handle push notifications for new messages
 * useEffect(() => {
 *   const handlePushNotification = (notification) => {
 *     if (notification.type === 'message') {
 *       // Update chat list or navigate to chat
 *       navigation.navigate('Chat', { chatId: notification.chatId });
 *     }
 *   };
 * 
 *   PushNotificationService.addEventListener('notification', handlePushNotification);
 * 
 *   return () => {
 *     PushNotificationService.removeEventListener('notification', handlePushNotification);
 *   };
 * }, []);
 * ```
 * 
 * ### Device Contacts Integration:
 * ```tsx
 * // Import contacts from device
 * const handleImportContacts = async () => {
 *   try {
 *     const deviceContacts = await ContactsService.getAll();
 *     const formattedContacts = deviceContacts.map(formatContact);
 *     await syncContacts(formattedContacts);
 *   } catch (error) {
 *     Alert.alert('Error', 'Failed to import contacts');
 *   }
 * };
 * ```
 * 
 * ### Video/Voice Call Integration:
 * ```tsx
 * // Integrate with calling services
 * const handleVideoCall = async (contact) => {
 *   try {
 *     await VideoCallService.startCall({
 *       recipientId: contact.id,
 *       type: 'video'
 *     });
 *   } catch (error) {
 *     Alert.alert('Error', 'Failed to start video call');
 *   }
 * };
 * ```
 */

/**
 * === STYLING SYSTEM ===
 * 
 * All templates use the centralized design system:
 * 
 * - `COLORS` - Comprehensive color palette with semantic meanings
 * - `SPACING` - Consistent spacing scale (xs, sm, md, lg, xl, etc.)
 * - `TYPOGRAPHY` - Font sizes, weights, and line heights
 * 
 * Templates accept custom styles via the `style` prop and can be
 * easily themed by modifying the constants file.
 * 
 * ### Custom Styling Example:
 * ```tsx
 * <ChatListScreen
 *   style={{ backgroundColor: '#f8fafc' }}
 *   config={{
 *     headerComponent: <CustomChatHeader />,
 *     footerComponent: <CustomChatFooter />
 *   }}
 * />
 * ```
 */

/**
 * === PERFORMANCE CONSIDERATIONS ===
 * 
 * These templates are optimized for performance:
 * 
 * ### Memory Management:
 * ```tsx
 * // Use pagination for large chat lists
 * <ChatListScreen
 *   conversations={conversations}
 *   onLoadMore={loadMoreConversations}
 *   config={{ itemsPerPage: 20 }}
 * />
 * 
 * // Optimize message rendering with virtualization
 * <ChatScreen
 *   messages={messages}
 *   config={{ messagesPerPage: 50 }}
 *   onLoadMore={loadMoreMessages}
 * />
 * ```
 * 
 * ### Real-time Optimization:
 * ```tsx
 * // Throttle typing indicators
 * const throttledTyping = useCallback(
 *   throttle((isTyping) => socket.emit('typing', isTyping), 1000),
 *   [socket]
 * );
 * 
 * // Debounce search queries
 * const debouncedSearch = useCallback(
 *   debounce((query) => performSearch(query), 300),
 *   []
 * );
 * ```
 */

/**
 * === ACCESSIBILITY FEATURES ===
 * 
 * All templates include comprehensive accessibility support:
 * 
 * - Screen reader compatibility with proper labels
 * - Keyboard navigation support
 * - High contrast mode support
 * - Voice control integration
 * - Touch target optimization
 * 
 * ### Accessibility Example:
 * ```tsx
 * <ChatScreen
 *   testID="main-chat"
 *   accessibilityLabel="Chat conversation with John Doe"
 *   accessibilityHint="Send messages, view chat history, and manage conversation"
 * />
 * ```
 */
