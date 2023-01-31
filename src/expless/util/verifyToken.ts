import { auth } from "firebase-admin";

async function verifyToken(idToken: string): Promise<string> {
  const decodedToken =  await auth().verifyIdToken(idToken);
  return decodedToken.uid
}

export default verifyToken;