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

function userBudgetsRef(uid) {
  return collection(db, "users", uid, "budgets")
}

export function watchBudgets(uid, callback) {
  const q = query(userBudgetsRef(uid), orderBy("createdAt", "desc"))
  return onSnapshot(q, (snapshot) => {
    const budgets = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
    callback(budgets)
  })
}

export function createBudget(uid, data) {
  return addDoc(userBudgetsRef(uid), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export function updateBudget(uid, budgetId, data) {
  const ref = doc(db, "users", uid, "budgets", budgetId)
  return updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export function deleteBudget(uid, budgetId) {
  const ref = doc(db, "users", uid, "budgets", budgetId)
  return deleteDoc(ref)
}
