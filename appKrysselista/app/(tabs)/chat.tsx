import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Modal, TextInput, Alert, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { sendMessageToMany, getUserConversations } from '@/api/messageApi';
import { getAllUsers, getUser } from '@/api/userApi';
import { getChild } from '@/api/childApi';
import { useAuth } from '@/providers/authProvider';


export default function ChatScreen() {
  const { user: loggedInUser } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [messageText, setMessageText] = useState('');
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [images, setImages] = useState<{ [key: string]: string }>({});

  // Hent brukerdata for samtaler
  useEffect(() => {
    if (!loggedInUser?.uid || conversations.length === 0) return;

    const fetchConversationUsers = async () => {
      try {
        const userIds = Array.from(new Set(conversations.map((c: any) => c.otherPersonId).filter(Boolean)));
        const userDataArray = await Promise.all(userIds.map(id => getUser(id)));
        
        const namesMap: { [key: string]: string } = {};
        const imagesMap: { [key: string]: string } = {};
        const childIdsToFetch: string[] = [];
        const userIdToChildIdsMap: { [key: string]: string[] } = {};
        
        userDataArray.forEach((userData, i) => {
          if (!userData) return;
          const userId = userIds[i];
          const name = (userData as any).name || 'Ukjent';
          const role = (userData as any).role;
          
          namesMap[userId] = role === 'ansatt' ? `${name} / ansatt` : `${name} / foresatt`;
          
          if (role === 'ansatt' && (userData as any).imageUrl) {
            imagesMap[userId] = (userData as any).imageUrl;
          } else if (role === 'foresatt') {
            const children = (userData as any).children;
            const childIds = Array.isArray(children) ? children : (children ? [children] : []);
            if (childIds.length > 0) {
              userIdToChildIdsMap[userId] = childIds;
              childIds.forEach(id => !childIdsToFetch.includes(id) && childIdsToFetch.push(id));
            }
          }
        });
        
        if (childIdsToFetch.length > 0) {
          const childrenData = await Promise.all(childIdsToFetch.map(id => getChild(id)));
          userDataArray.forEach((userData, i) => {
            if (!userData || (userData as any).role !== 'foresatt') return;
            const userId = userIds[i];
            const childIds = userIdToChildIdsMap[userId];
            if (childIds?.length > 0) {
              const firstChild = childrenData[childIdsToFetch.indexOf(childIds[0])];
              if (firstChild && (firstChild as any).imageUrl) {
                imagesMap[userId] = (firstChild as any).imageUrl;
              }
            }
          });
        }
        
        setUserNames(prev => ({ ...prev, ...namesMap }));
        setImages(prev => ({ ...prev, ...imagesMap }));
      } catch (error) {
        console.error('Feil med henting av brukere:', error);
      }
    };

    fetchConversationUsers();
  }, [loggedInUser, conversations]);

  // Hent samtaler
  useEffect(() => {
    if (!loggedInUser?.uid) {
      setConversations([]);
      return;
    }

    const stopMessageUpdates = getUserConversations(loggedInUser.uid, (conversationsList) => {
      setConversations(conversationsList);
    });

    return stopMessageUpdates;
  }, [loggedInUser]);

  // Hent alle brukere når modal åpnes
  useEffect(() => {
    if (!showModal || !loggedInUser?.uid) return;

    const fetchAllUsers = async () => {
      try {
        const allUsers = await getAllUsers(loggedInUser.uid);
        setUsers(allUsers);
        const userDataArray = await Promise.all(allUsers.map(u => getUser(u.id)));
        
        const namesMap: { [key: string]: string } = {};
        userDataArray.forEach((userData, i) => {
          if (!userData) return;
          const name = (userData as any).name || 'Ukjent';
          const role = (userData as any).role;
          namesMap[allUsers[i].id] = role === 'ansatt' ? `${name} / ansatt` : `${name} / foresatt`;
        });
        
        setUserNames(prev => ({ ...prev, ...namesMap }));
      } catch (error) {
        console.error('Feil ved henting av brukere:', error);
      }
    };

    fetchAllUsers();
  }, [showModal, loggedInUser]);



  const sendMessage = async () => {
    if (!messageText.trim() || selectedUsers.length === 0 || !loggedInUser?.uid) {
      Alert.alert('Feil', 'Velg mottaker og skriv melding');
      return;
    }

    try {
      await sendMessageToMany(loggedInUser.uid, selectedUsers, messageText);
      setMessageText('');
      setSelectedUsers([]);
      setShowModal(false);
    } catch (error) {
      Alert.alert('Feil', 'Kunne ikke sende melding');
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => prev.includes(userId) 
      ? prev.filter(id => id !== userId)
      : [...prev, userId]
    );
  };

  const deleteConversation = (conversationId: string) => {
    Alert.alert('Slett samtale', 'Vil du slette samtalen?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Slett',
        style: 'destructive',
        onPress: () => setConversations(prev => prev.filter((c: any) => c.id !== conversationId))
      },
    ]);
  };

  const renderRightActions = (conversation: any) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => deleteConversation(conversation.id)}>
      <ThemedText style={styles.deleteActionText}>Slett</ThemedText>
    </TouchableOpacity>
  );
 
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Meldinger</ThemedText>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowModal(true)}>
          <ThemedText style={styles.plusIcon}>+</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => {
          const conversation = item as any;
          const otherPersonId = conversation.otherPersonId;
          const otherPersonName = userNames[otherPersonId] || 'Ukjent';
          const imageUrl = images[otherPersonId];
          
          return (
            <Swipeable
              renderRightActions={() => renderRightActions(conversation)}
              rightThreshold={40}>
              <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => router.push(`/conversation/${otherPersonId}`)}>
                <View style={styles.conversationHeader}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.profileImageCircle} />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <ThemedText style={styles.profileInitialsText}>
                        {(otherPersonName.split(' ')[0] || 'U')[0].toUpperCase()}
                      </ThemedText>
                    </View>
                  )}
                  <View style={styles.conversationTextContainer}>
                    <ThemedText style={styles.conversationName}>{otherPersonName}</ThemedText>
                    <ThemedText style={styles.conversationPreview} numberOfLines={1}>
                      {conversation.lastMessage || 'Ingen meldinger'}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
          );
        }}
        ListEmptyComponent = {
          <ThemedView style={styles.emptyState}>
            <ThemedText>Ingen samtaler ennå. Send en melding for å starte!</ThemedText>
          </ThemedView>
        }
      />

      <Modal
        visible={showModal}
        animationType="slide"
        transparent ={true}
        onRequestClose={() => setShowModal(false)}>
        <ThemedView style={styles.modalContainer}>
          <ThemedView style= {styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>Ny melding</ThemedText>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <ThemedText style={styles.closeButton}>Lukk</ThemedText>
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.sectionTitle}>Velg mottakere:</ThemedText>
            <FlatList
              data={users}
              keyExtractor={(item: any) => item.id}
              style={styles.userList}
              renderItem={({ item }: { item: any }) => {
                const user = item as any;
                const displayName = userNames[user.id] || user.name || 'Ukjent';
                return (
                  <TouchableOpacity
                    style={[
                    styles.userSelectItem,
                    selectedUsers.includes(user.id) && styles.userSelectItemSelected
                    ]}
                    onPress = {() => toggleUser( user.id )}>
                    <ThemedText style={styles.userSelectText}>{displayName}</ThemedText>
                    {selectedUsers.includes(user.id) && (
                      <ThemedText style={styles.checkmark}>✓</ThemedText>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <ThemedText style={styles.sectionTitle}>Melding:</ThemedText>
            <TextInput
              style={styles.messageInput}
              placeholder="Skriv en melding..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              blurOnSubmit={true}
              returnKeyType="done"
              onSubmitEditing={() => {}}
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}>
              <ThemedText style={styles.sendButtonText}>
                Send til {selectedUsers.length} mottaker(e)
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E2EDFB',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },

  title: {
    fontSize: 24,
    color: '#6B856E',
  },
  iconButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B856E',
  },
  conversationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#6B856E',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#BCD6BF',
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#BCD6BF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitialsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B856E',
  },
  conversationTextContainer: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#6B856E',
  },
  conversationPreview: {
    fontSize: 14,
    opacity: 0.7,
    color: '#6B856E',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    backgroundColor: '#ff4444',
    borderBottomWidth: 1,
    borderBottomColor: '#6B856E',
  },
  deleteActionText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6B856E',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#6B856E',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B856E',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
    color: '#6B856E',
  },
  userList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  userSelectItem: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#6B856E',
  },
  userSelectText: {
    color: '#6B856E',
  },
  userSelectItemSelected: {
    backgroundColor: '#F5F5F5',
  },
  checkmark: {
    fontWeight: 'bold',
    color: '#6B856E',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#6B856E',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
    color: '#6B856E',
  },
  sendButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6B856E',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#6B856E',
    fontWeight: '600',
  },

}) ;