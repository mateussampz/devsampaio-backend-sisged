import  cors from "cors";
import * as admin from "firebase-admin";
import * as joi from "joi";
import * as functions from "firebase-functions/v1";

const corsHandler = cors();

const bodySchema: joi.Schema = joi.object({
  displayName: joi.string().required(),
  name: joi.string().required(),
  email: joi.string().required(),
  password: joi.string().required(),
  typeUser: joi.string().required(),
}).unknown(false);

export const createUser = functions.runWith({timeoutSeconds: 540, memory: "8GB"}).https.onRequest(
    (request: any, response: any) => {
      corsHandler(request, response, async () => {
        const user: any = request.jwt;
        const body: any = request.body;

        const ADMIN_UID: string = process.env.ADMIN_UID || functions.config().env.ADMIN_UID || "";
        if (user.uid !== ADMIN_UID) {
          return response.status(403).send({message: "Forbidden"});
        }

        const {displayName,name , typeUser, email, password } = body;

        const bodyValidation: any = bodySchema.validate(body);

        if (bodyValidation.error) {
          return response.status(400).send({message: bodyValidation.error.details[0].message});
        }

        const userSave: any = await admin.auth().createUser({email, password});

        // Create default profile

        await admin.firestore()
            .collection("profiles")
            .doc(userSave.uid)
            .set({
              displayName,
              name,
              email,
              typeUser,
            });

        return response.send({message: "OK", newUserId: userSave.uid});
      });
    }
);
