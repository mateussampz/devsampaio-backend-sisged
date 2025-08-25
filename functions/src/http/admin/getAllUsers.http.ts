import cors from "cors";
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

const corsHandler = cors({origin: true});

export const getAllUsers = functions.runWith({timeoutSeconds: 540, memory: "8GB"}).https.onRequest(
    (request: any, response: any) => {
      corsHandler(request, response, async () => {
        const user: any = request.jwt;

        const ADMIN_UID: string = process.env.ADMIN_UID || functions.config().env.ADMIN_UID || "";
        if (user.uid !== ADMIN_UID) {
          return response.status(403).send({message: "Forbidden"});
        }

        const snapshot: any = await admin.firestore()
            .collection("profiles")
            .get();

        if (snapshot.empty) {
          return response.status(404).send({message: "Users not found"});
        }

        const users = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        }));

        return response.send({
          message: "OK",
          users,
        });
      });
    }
);
