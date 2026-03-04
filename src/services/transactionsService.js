import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../lib/firebase"

function userTransactionsRef(uid) {
  return collection(db, "users", uid, "transactions")
}

export function watchTransactions(uid, callback) {
  const q = query(userTransactionsRef(uid), orderBy("date", "desc"))
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
    callback(transactions)
  })
}

export function createTransaction(uid, data) {
  return addDoc(userTransactionsRef(uid), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export function updateTransaction(uid, transactionId, data) {
  const ref = doc(db, "users", uid, "transactions", transactionId)
  return updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export function deleteTransaction(uid, transactionId) {
  const ref = doc(db, "users", uid, "transactions", transactionId)
  return deleteDoc(ref)
}
