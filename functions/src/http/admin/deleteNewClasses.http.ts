import cors from "cors";
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

const corsHandler: any = cors({origin: true});

export const deleteClasses: any = functions.runWith({timeoutSeconds: 540, memory: "8GB"}).https.onRequest(
    (request: any, response: any) => {
      corsHandler(request, response, async () => {
        const classId: string = request.params.classId;
        const userRef: any = admin.firestore().collection("classes").doc(classId);
        const userSnapshot: any = await userRef.get();

        if (!userSnapshot.exists) {
          return response.status(404).send({message: "classes not found"});
        }

        await userRef.delete();

        return response.send({message: "OK"});
      });
    }
);