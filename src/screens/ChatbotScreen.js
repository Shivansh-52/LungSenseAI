// src/screens/ChatbotScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Clipboard,
  Animated,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  sendMessageToGemini,
  getContextualQuickPrompts,
  saveChatHistory,
  loadChatHistory,
  clearChatHistory,
} from '../services/chatService';

const ChatbotScreen = ({ navigation, route }) => {
  const { user, isAuthenticated } = useAuth();
  const routeParams = route?.params || {};
  const initialExamContext = routeParams.examinationContext || null;

  const [activeExamContext, setActiveExamContext] = useState(initialExamContext);
  const [historyList, setHistoryList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState([]);

  const flatListRef = useRef(null);

  // Load exam history & cached messages on mount
  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      // 1. Load patient examinations for context if authenticated
      if (isAuthenticated) {
        try {
          const res = await api.getExaminations(1, 10);
          const exams = res.items || res.examinations || (Array.isArray(res) ? res : []);
          if (isMounted) {
            setHistoryList(exams);
          }
        } catch (e) {
          console.warn('Could not fetch examination history for chat context:', e);
        }
      }

      // 2. Load previous chat messages if any
      const savedMessages = await loadChatHistory();
      if (isMounted) {
        if (savedMessages && savedMessages.length > 0) {
          setMessages(savedMessages);
        } else {
          // Default greeting
          const userName = user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || '';
          const greetingName = userName ? `, ${userName}` : '';
          const initialGreeting = {
            id: 'welcome-1',
            role: 'assistant',
            text: `Hello${greetingName}! 👋 I am **LungSense AI Assistant**, your respiratory health and COPD companion.\n\nI can help you understand your lung sound examinations (crackles, wheezes, normal), explain COPD risk scores, suggest breathing exercises, and answer questions about pulmonary health.\n\nHow can I help you today?`,
            timestamp: new Date().toISOString(),
          };
          setMessages([initialGreeting]);
        }
      }
    };

    initializeChat();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  // Update exam context if route parameter changes (e.g. navigated from ExaminationDetailScreen)
  useEffect(() => {
    if (routeParams.examinationContext) {
      setActiveExamContext(routeParams.examinationContext);

      // Add a contextual bot greeting mentioning the specific test
      const exam = routeParams.examinationContext;
      const soundName = exam.prediction?.class_name || exam.predicted_class || 'Sound Check';
      const isNormal = soundName.toLowerCase().includes('normal');
      const hasCOPD = exam.disease_prediction && !exam.disease_prediction.prediction?.toLowerCase().includes('no copd');

      let contextIntro = `I've pulled up your **${soundName}** examination`;
      if (exam.created_at) {
        contextIntro += ` from ${new Date(exam.created_at).toLocaleDateString()}`;
      }
      contextIntro += `.\n\n• **Acoustic Pattern:** ${soundName} (${isNormal ? 'Clear/Normal' : 'Unusual sound pattern flagged'})\n`;
      if (exam.disease_prediction?.prediction) {
        contextIntro += `• **COPD Check:** ${exam.disease_prediction.prediction} (${Math.round((exam.disease_prediction.copd_probability || 0) * 100)}% risk score)\n`;
      }
      contextIntro += `\nFeel free to ask me to explain what this means, what steps to take, or how to discuss it with your physician.`;

      const examNoteMsg = {
        id: `exam-ctx-${Date.now()}`,
        role: 'assistant',
        text: contextIntro,
        timestamp: new Date().toISOString(),
        isContextNotice: true,
      };

      setMessages((prev) => [...prev, examNoteMsg]);
    }
  }, [routeParams.examinationContext]);

  // Compute smart prompt chips whenever context or history changes
  useEffect(() => {
    const latest = historyList.length > 0 ? historyList[0] : null;
    const prompts = getContextualQuickPrompts({
      activeExamContext,
      latestExam: latest,
    });
    setQuickPrompts(prompts);
  }, [activeExamContext, historyList]);

  // Handle sending message
  const handleSend = async (textToSend) => {
    const content = (textToSend || inputText).trim();
    if (!content || loading) return;

    setInputText('');

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: content,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await sendMessageToGemini({
        messages: updatedMessages,
        user,
        historyList,
        activeExamContext,
      });

      const botMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: response.text,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (err) {
      console.warn('Chat send error:', err);
      const errorMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Unable to reach LungSense AI**\n\n${err.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setLoading(false);
    }
  };

  // Clear conversation
  const handleClearChat = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear your chat history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearChatHistory();
            const userName = user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || '';
            const greetingName = userName ? `, ${userName}` : '';
            setMessages([
              {
                id: 'welcome-reset',
                role: 'assistant',
                text: `Conversation cleared. How can I assist you with your respiratory health today${greetingName}?`,
                timestamp: new Date().toISOString(),
              },
            ]);
            setActiveExamContext(null);
          },
        },
      ]
    );
  };

  // Copy message text to clipboard
  const handleCopy = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Message copied to clipboard.');
  };

  // Format timestamp
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return '';
    }
  };

  // Render formatted markdown text cleanly with bolding and bullet points
  const renderMessageContent = (text, isUser) => {
    // If it's a user message, render as plain styled text
    if (isUser) {
      return <Text style={styles.userMessageText}>{text}</Text>;
    }

    // Split text into paragraphs and lines for clean mobile formatting
    const lines = text.split('\n');
    return (
      <View style={styles.markdownContainer}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <View key={idx} style={{ height: 6 }} />;
          }

          // Bullet points
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            const bulletText = trimmed.replace(/^[\*\-•]\s*/, '');
            return (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{renderInlineBolding(bulletText)}</Text>
              </View>
            );
          }

          // Numbered list (e.g. 1. , 2. )
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.numberedPrefix}>{numMatch[1]}.</Text>
                <Text style={styles.bulletText}>{renderInlineBolding(numMatch[2])}</Text>
              </View>
            );
          }

          // Heading (### or ##)
          if (trimmed.startsWith('#')) {
            const headingText = trimmed.replace(/^#+\s*/, '');
            return (
              <Text key={idx} style={styles.headingText}>
                {headingText}
              </Text>
            );
          }

          // Regular paragraph
          return (
            <Text key={idx} style={styles.assistantMessageText}>
              {renderInlineBolding(trimmed)}
            </Text>
          );
        })}
      </View>
    );
  };

  // Helper to split text by **bold** tags and render appropriately
  const renderInlineBolding = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={i} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={i}>{part}</Text>;
    });
  };

  // Render individual message item
  const renderMessageItem = ({ item }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.assistantMessageRow,
        ]}
      >
        {!isUser && (
          <View style={styles.botAvatar}>
            <Icon name="sparkles" size={16} color="#fff" />
          </View>
        )}

        <View
          style={[
            styles.bubbleContainer,
            isUser ? styles.userBubble : styles.assistantBubble,
            item.isContextNotice ? styles.contextNoticeBubble : null,
            item.isError ? styles.errorBubble : null,
          ]}
        >
          {item.isContextNotice && (
            <View style={styles.contextNoticeTag}>
              <Icon name="document-text-outline" size={13} color={Colors.primary} />
              <Text style={styles.contextNoticeTagText}>Examination Context Loaded</Text>
            </View>
          )}

          {renderMessageContent(item.text, isUser)}

          <View style={styles.metaRow}>
            <Text style={[styles.timestampText, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
              {formatTime(item.timestamp)}
            </Text>

            {!isUser && !item.isError && (
              <TouchableOpacity
                onPress={() => handleCopy(item.text)}
                style={styles.copyBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="copy-outline" size={13} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {canGoBack && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View style={styles.headerAvatarContainer}>
            <View style={styles.headerAvatar}>
              <Icon name="pulse" size={20} color="#fff" />
            </View>
            <View style={styles.onlineBadge} />
          </View>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>LungSense AI</Text>
            <Text style={styles.headerSubtitle}>COPD & Acoustic Specialist</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleClearChat} style={styles.iconButton}>
          <Icon name="trash-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ACTIVE CONTEXT BANNER */}
      {activeExamContext && (
        <View style={styles.contextBanner}>
          <View style={styles.contextBannerLeft}>
            <Icon name="medical" size={16} color={Colors.primary} />
            <Text style={styles.contextBannerText} numberOfLines={1}>
              Discussing: {activeExamContext.prediction?.class_name || activeExamContext.predicted_class || 'Lung Sound'}
              {activeExamContext.disease_prediction?.prediction
                ? ` • ${activeExamContext.disease_prediction.prediction}`
                : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setActiveExamContext(null)} style={styles.contextCloseBtn}>
            <Icon name="close" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* KEYBOARD AVOIDING CONTENT */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* MESSAGE LIST */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            loading ? (
              <View style={styles.typingIndicatorRow}>
                <View style={styles.botAvatar}>
                  <Icon name="sparkles" size={16} color="#fff" />
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.typingText}>LungSense AI is thinking...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* QUICK PROMPT CHIPS */}
        {!loading && quickPrompts.length > 0 && (
          <View style={styles.quickPromptsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptsScroll}
            >
              {quickPrompts.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.promptChip}
                  onPress={() => handleSend(prompt)}
                  activeOpacity={0.7}
                >
                  <Icon name="help-circle-outline" size={14} color={Colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.promptChipText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* INPUT BAR */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about COPD, lung sounds, symptoms..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim().length > 0 && !loading ? styles.sendButtonActive : styles.sendButtonDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={inputText.trim().length === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="arrow-up" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatarContainer: {
    position: 'relative',
    marginRight: 10,
    marginLeft: 4,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  iconButton: {
    padding: 8,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCE4FF',
  },
  contextBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contextBannerText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  contextCloseBtn: {
    padding: 4,
  },
  keyboardContainer: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  bubbleContainer: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.cardBackground,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  contextNoticeBubble: {
    borderColor: '#B3D7FF',
    backgroundColor: '#F5F9FF',
  },
  contextNoticeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0EFFF',
  },
  contextNoticeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  errorBubble: {
    borderColor: Colors.warning,
    backgroundColor: '#FFF1F0',
  },
  userMessageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 21,
  },
  assistantMessageText: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  markdownContainer: {
    width: '100%',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  bulletDot: {
    fontSize: 16,
    color: Colors.primary,
    marginRight: 6,
    lineHeight: 21,
  },
  numberedPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 6,
    lineHeight: 21,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  headingText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestampText: {
    fontSize: 11,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  assistantTimestamp: {
    color: Colors.textSecondary,
  },
  copyBtn: {
    marginLeft: 8,
    padding: 2,
  },
  typingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  quickPromptsContainer: {
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  quickPromptsScroll: {
    paddingHorizontal: 16,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  promptChipText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});

export default ChatbotScreen;
