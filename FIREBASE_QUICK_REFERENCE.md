# Firebase v9+ Quick Reference

Quick reference for Firebase v9+ modular syntax used in this project.

## Import Patterns

### Firestore
```javascript
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
```

### Authentication
```javascript
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
```

### Storage
```javascript
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
```

## Common Operations

### Create/Update Document
```javascript
// Use serverTimestamp for automatic timestamps
await setDoc(doc(db, 'users', userId), {
  uid: userId,
  email: userEmail,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});
```

### Read Document
```javascript
const docSnap = await getDoc(doc(db, 'users', userId));
if (docSnap.exists()) {
  const userData = docSnap.data();
}
```

### Query Collection
```javascript
const q = query(
  collection(db, 'students'),
  where('grade', '==', 10),
  orderBy('name'),
  limit(50)
);
const querySnapshot = await getDocs(q);
```

### Real-time Updates
```javascript
const unsubscribe = onSnapshot(
  query(collection(db, 'notifications')),
  (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        console.log('New:', change.doc.data());
      }
    });
  }
);
```

## Key Points

✅ **DO**: Use functional imports
```javascript
import { serverTimestamp } from 'firebase/firestore';
createdAt: serverTimestamp()
```

❌ **DON'T**: Use namespace syntax
```javascript
// Old way - don't use this
firebase.firestore.FieldValue.serverTimestamp()
```

✅ **DO**: Use doc() and collection() helpers
```javascript
doc(db, 'users', userId)
collection(db, 'users')
```

❌ **DON'T**: Use chained methods
```javascript
// Old way - don't use this
db.collection('users').doc(userId)
```

## See Also

- [FIREBASE_V9_MODULAR_SYNTAX.md](FIREBASE_V9_MODULAR_SYNTAX.md) - Detailed guide
- [FIREBASE_INTEGRATION.md](FIREBASE_INTEGRATION.md) - Integration overview
- [Official Firebase Docs](https://firebase.google.com/docs/web/modular-upgrade)
