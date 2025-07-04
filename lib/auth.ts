import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, type User } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:demo',
}

// Initialize Firebase only if we have a valid config
let app: any = null
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
} catch (error) {
  console.warn('Firebase initialization failed. Using demo mode.', error)
}
export const auth = app ? getAuth(app) : null

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export const signInWithGoogle = async () => {
  if (!auth) {
    throw new Error('Firebase auth not initialized. Please configure your environment variables.')
  }
  try {
    const result = await signInWithPopup(auth!, googleProvider)
    return result.user
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

export const signOut = async () => {
  if (!auth) {
    console.warn('Firebase auth not initialized')
    return
  }
  try {
    await firebaseSignOut(auth!)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.warn('Firebase auth not initialized')
    return () => {} // Return empty unsubscribe function
  }
  return onAuthStateChanged(auth!, callback)
}

export { User } 