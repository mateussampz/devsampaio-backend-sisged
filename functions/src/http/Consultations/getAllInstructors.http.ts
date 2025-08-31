import cors from "cors";
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

const corsHandler = cors({origin: true});

export const getAllInstructors = functions.runWith({timeoutSeconds: 540, memory: "8GB"}).https.onRequest(
    (request: any, response: any) => {
      corsHandler(request, response, async () => {

        const snapshot: any = await admin.firestore()
            .collection("profiles")
            .get();

        if (snapshot.empty) {
          return response.status(404).send({message: "Instructors not found"});
        }

        const instructors = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
          name: doc.data().name,
          typeUser: doc.data().typeUser,
        }));

        return response.send({
          message: "OK",
          instructors,
        });
      });
    }
);
