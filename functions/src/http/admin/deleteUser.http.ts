import cors from "cors";
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import Jwt from "../../interfaces/jwt.interface";

const corsHandler: any = cors({origin: true});

export const deleteUser: any = functions.runWith({timeoutSeconds: 540, memory: "8GB"}).https.onRequest(
    (request: any, response: any) => {
      corsHandler(request, response, async () => {
        const userId: string = request.params.userId;
        const userRef: any = admin.firestore().collection("profiles").doc(userId);
        const userSnapshot: any = await userRef.get();

        if (!userSnapshot.exists) {
          return response.status(404).send({message: "User not found"});
        }

        await userRef.delete();

        return response.send({message: "OK"});
      });
    }
);