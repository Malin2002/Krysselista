
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Message } from '@/types/message';


// Send melding til en mottaker
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  text: string
): Promise<void> => {
  if (!senderId || !receiverId || !text.trim()) {
    throw new Error('Mangler informasjon for å sende melding');
  }

  try {
    // Legger til meldingen i databasen
    await addDoc(collection(db, 'messages'), { 
      senderId,
      receiverId,
      text: text.trim(),
      timestamp: serverTimestamp(),
      readBy: []
    });

  } catch (error) {
    console.error('Feil ved sending av melding:', error);
    throw new Error('Kunne ikke sende melding');
  }
};

// Send melding til flere mottakere
export const sendMessageToMany = async (
  senderId: string,
  receiverIds: string [],
  text: string
): Promise<void> => {
  if (!senderId || !receiverIds.length || !text.trim()) {
    throw new Error('Mangler informasjon for å sende melding');
  }

  try {
    const messagePromises = receiverIds
      .filter(id => id) // Filtrer ugyldige ID-er
      .map(receiverId => 
    addDoc(collection(db, 'messages'), {
          senderId,
          receiverId,
          text: text.trim(),
          timestamp: serverTimestamp(),
          readBy: []
        })
      );
    
    await Promise.all(messagePromises);
  } catch (error ) {
    console.error ('Feil ved sending av meldinger :', error);
    throw new Error('Kunne ikke sende meldinger');
  }
};

// Get meldinger mellom to brukere
export const getConversationMessages = (
  senderId: string ,
  receiverId: string,
  messageCallback: (messages: Message[])=> void
): (() => void) => {
  const stopMessageUpdates = onSnapshot(collection(db, 'messages'), (messagesSnapshot) => {
    const allMessages = messagesSnapshot.docs.map(doc => ({
      id : doc.id,
      ...doc.data ()
    } )) as Message[] ;

    // Filtrer meldinger mellom to brukere
    const conversationMessages = allMessages.filter((message ) => {
      const isFrom1To2 = message.senderId === senderId && message.receiverId === receiverId;
      const isFrom2To1 = message.senderId === receiverId && message.receiverId === senderId ;
      return isFrom1To2 || isFrom2To1 ;
    });
    
    // Sorter etter tid,  eldste først
    const sortedMessages = conversationMessages.sort((a, b)=> {
      const timeA = a.timestamp?.toDate?.() || new Date(0);
      const timeB = b.timestamp?.toDate?.() || new Date(0);
      return timeA.getTime() - timeB.getTime();
    });
    
    messageCallback(sortedMessages); // kaller tilbake funksjonen med sorterte meldinger
  });
  
  return stopMessageUpdates;
};

// Get alle samtaler for en bruker
export const getUserConversations = (
  userId: string ,
  messageCallback: (conversationsList: any[] ) => void
): (() => void) => {
  const stopMessageUpdates = onSnapshot(collection(db, 'messages'), (messagesSnapshot) => {
    const allMessages =messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    
    const myMessages = allMessages.filter(( message) => 
      message.senderId === userId || message.receiverId === userId
    );
    
    const conversationMap: { [key: string]: any } =  {};
    
    myMessages.forEach((message) => {
      const chatPartnerId = message.senderId === userId 
        ? message.receiverId 
        : message.senderId;
      
      if ( !chatPartnerId) return;
      
      const conversationKey = [userId, chatPartnerId].sort().join('_');
      
      if (!conversationMap[conversationKey]) {
        conversationMap[conversationKey] = {
          id: conversationKey,
          otherPersonId: chatPartnerId,
          messages: [] ,
          lastMessage: null,
          lastMessageTime: null
        };
      }
      
      conversationMap[conversationKey].messages.push(message);
     
      const messageTime = message.timestamp?.toDate?.() || new Date(0);
      if (!conversationMap[conversationKey].lastMessageTime || 
          messageTime > conversationMap[conversationKey]. lastMessageTime) {
        conversationMap[conversationKey].lastMessage = message.text;
        conversationMap[ conversationKey].lastMessageTime = messageTime ;
      }
    });

    // Sorter eldste melding først
    const conversationsList = Object.values ( conversationMap ).sort ((a: any, b: any) => {
      const timeA = a.lastMessageTime || new Date(0);
      const timeB = b.lastMessageTime || new Date(0);
      return timeB.getTime() - timeA.getTime() ;
    });
    
    messageCallback (conversationsList);
  });

  return stopMessageUpdates;
};

