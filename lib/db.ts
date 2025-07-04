import { initializeApp, getApps } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp,
  DocumentData 
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)

export interface ChatMessage {
  id?: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: any
  sessionId?: string
}

export interface UserProfile {
  id?: string
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  lastActive: any
  createdAt: any
  preferences?: {
    voiceEnabled?: boolean
    autoSpeak?: boolean
    theme?: string
  }
}

// Chat message operations
export const saveChatMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...message,
      timestamp: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving message:', error)
    throw error
  }
}

export const getChatHistory = async (userId: string, limitCount: number = 50) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const messages: ChatMessage[] = []
    
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as ChatMessage)
    })
    
    return messages.reverse() // Return in chronological order
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return []
  }
}

// User profile operations
export const createUserProfile = async (user: Omit<UserProfile, 'id' | 'createdAt' | 'lastActive'>) => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      ...user,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

export const getUserProfile = async (uid: string) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('uid', '==', uid),
      limit(1)
    )
    
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
} 