import cors from "cors";
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as joi from "joi";

const corsHandler = cors();

const bodySchema: joi.Schema = joi.object({
  uid: joi.string().required(),
  displayName: joi.string().required(),
  name: joi.string().required(),
  email: joi.string().required(),
  userClass: joi.string().required(),
  shift: joi.string().required(),
}).unknown(false);

export const updateUser = functions.runWith({timeoutSeconds: 540, memory: "8GB"}).https.onRequest(
    (request: any, response: any) => {
      corsHandler(request, response, async () => {
        const user: any = request.jwt;
        const body: any = request.body;
        const {uid}: any = request.params;

        const ADMIN_UID: string = process.env.ADMIN_UID || functions.config().env.ADMIN_UID || "";
        if (user.uid !== ADMIN_UID) {
          return response.status(403).send({message: "Forbidden"});
        }

        const bodyValidation = bodySchema.validate({...body, uid});

        if (bodyValidation.error) {
          return response.status(404).send({message: bodyValidation.error.details[0]});
        }

        const {displayName, name,  email, userClass, shift}: any = body;

        // Get user
        const userDoc: any = admin.firestore().collection("profiles").doc(uid);
        const userSnapshot = await userDoc.get();
        if (!userSnapshot.exists) {
          return response.status(404).send({message: "User not found"});
        }

        const userData: any = userSnapshot.data();

        await userDoc.update({
          displayName,
          name,
          email,
          userClass,
          shift,
        });

        if (userData.email !== email) {
          await admin.auth().updateUser(uid, {email}).catch((error: any) => {
            console.error("Error updating user:", error);
            return response.status(500).send({message: "Error updating user on Firebase Auth"});
          });
        }

        return response.send({message: "OK"});
      });
    }
);
