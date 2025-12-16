import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, router } from 'expo-router';
import { sendMessage, getConversationMessages } from '@/api/messageApi';
import { getUser } from '@/api/userApi';
import { useAuth } from '@/providers/authProvider';


//screen med samtaletråden mellom to brukere


export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { user: loggedInUser } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherPersonName, setOtherPersonName] = useState('');

  
  // Hent navnet på den andre personen 
  useEffect(() => {
    const getName = async () => {
      if (!conversationId) return;
      
      try {
        const userData = await getUser(conversationId);
        if (userData) {
          setOtherPersonName(userData.name || 'Ukjent');
        }
      } catch (error ) {
        console.error ('Feil ved henting av navn:', error);
       }
    };
    
    getName();
  }, [conversationId]);

  // Henter meldinger i samtalen 
  useEffect(() => {
    if (!loggedInUser?.uid || !conversationId) {
      setMessages([]);
      return;
    }

    const stopMessageUpdates = getConversationMessages(loggedInUser.uid, conversationId, ( messages ) => {
      setMessages(messages);
  });

    return stopMessageUpdates;
  }, [loggedInUser, conversationId]);

  // Send melding 
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    if (!loggedInUser || !loggedInUser.uid) {
      console.error('Bruker ikke logget inn');
      return;
    }

    if (!conversationId) {
      console.error('Mottaker-ID mangler');
      return;
    }

    try {

      await sendMessage(loggedInUser.uid, conversationId, newMessage);
      setNewMessage('');
    } catch (error ) {
      console.error ('Feil ved sending:', error);
    }
  };
 //om meldingen er sendt av den innloggede brukeren
  const isMyMessage = ( message: any ) => {
    if (!message || !loggedInUser || !loggedInUser.uid) return false;
     return message.senderId === loggedInUser.uid;
  };
// hvilket tidspunkt sendt
  const messageTime = ( timestamp: any ) => {
    if (!timestamp) return '';
     const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
        <ThemedText style={styles.backButton}>← Tilbake</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>{otherPersonName}</ThemedText>
        <View style={{ width: 80 }} />
      </View>

      {/* Meldinger */}
      <FlatList
        data={messages}
        keyExtractor={(item: any) => item.id }
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        renderItem ={ ({ item }: { item: any }) => {
          const message = item as any;
          const myMessage = isMyMessage( message );
          
          return (
            <View style={[
              styles.messageContainer,
              myMessage ? styles. myMessageContainer : styles.otherMessageContainer
            ]}>
              <View style={[
                styles.messageBubble,
                myMessage ? styles.myMessageBubble : styles.otherMessageBubble
              ]}>
                <ThemedText style={styles.messageText}>{message.text}</ThemedText>
                <ThemedText style={styles.messageTime}>
                  {messageTime( message.timestamp )}
               </ThemedText>
              </View>
             </View>
        );
        }}
       />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder= "Skriv melding..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          blurOnSubmit={true}
          returnKeyType="send"
          onSubmitEditing={() => {
            
            if (newMessage.trim()) {
              handleSendMessage();
            }
          }}
        />
       
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}>
          <ThemedText style={styles.sendButtonText}>Send</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2EDFB',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#6B856E',
  },
  backButton: {
    fontSize: 16,
    color: '#6B856E',
  },
  headerTitle: {
    fontSize: 18,
    color: '#6B856E',
  },
  //liste over meldinger
  messagesList: {
    flex: 1,
  },
  //stil for innholdet i meldingene
  messagesContent: {
    padding: 20,
  },
  messageContainer: {
    marginBottom: 12,
  },
  //stil for meldingen som sendes av den innloggede brukeren
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  //stil for meldingen som sendes av den andre brukeren
  otherMessageContainer: {
    alignItems: 'flex-start',
  },

  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#6B856E',
  },
  //fra den innloggede brukeren
  myMessageBubble: {
    borderBottomRightRadius: 4,
    backgroundColor: '#BCD6BF',
  },
  //til den innloggede brukeren
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
    backgroundColor: '#FFFFFF',
  },

  messageText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#6B856E',
  },

  messageTime: {
    fontSize: 10,
    opacity: 0.7,
    color: '#6B856E',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#6B856E',
  },

  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#6B856E',
    borderRadius: 8,
    color: '#6B856E',
    backgroundColor: '#E2EDFB',
  },

  sendButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6B856E',
  },
  sendButtonText: {
    fontWeight: '600',
    color: '#6B856E',
  },
}) ;

