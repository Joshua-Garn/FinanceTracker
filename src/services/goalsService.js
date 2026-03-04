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

function userGoalsRef(uid) {
  return collection(db, "users", uid, "goals")
}

export function watchGoals(uid, callback) {
  const q = query(userGoalsRef(uid), orderBy("createdAt", "desc"))
  return onSnapshot(q, (snapshot) => {
    const goals = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
    callback(goals)
  })
}

export function createGoal(uid, data) {
  return addDoc(userGoalsRef(uid), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export function updateGoal(uid, goalId, data) {
  const ref = doc(db, "users", uid, "goals", goalId)
  return updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export function deleteGoal(uid, goalId) {
  const ref = doc(db, "users", uid, "goals", goalId)
  return deleteDoc(ref)
}
