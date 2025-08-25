import  cors from "cors";
import * as admin from "firebase-admin";
import * as joi from "joi";
import * as functions from "firebase-functions/v1";

const corsHandler = cors();

const bodySchema: joi.Schema = joi.object({
  instructor: joi.string().required(),
  dateTime: joi.string().required(),
  instructorClass: joi.string().required(),
  shift: joi.string().required(),
}).unknown(false);

export const createClasses = functions.runWith({timeoutSeconds: 540, memory: "8GB"}).https.onRequest(
    (request: any, response: any) => {
      corsHandler(request, response, async () => {
        const user: any = request.jwt;
        const body: any = request.body;

        const ADMIN_UID: string = process.env.ADMIN_UID || functions.config().env.ADMIN_UID || "";
        if (user.uid !== ADMIN_UID) {
          return response.status(403).send({message: "Forbidden"});
        }

        const {instructor, dateTime, instructorClass, shift} = body;
        console.log(dateTime)
        const date = new Date(dateTime);

        const bodyValidation: any = bodySchema.validate(body);

        if (bodyValidation.error) {
          return response.status(400).send({message: bodyValidation.error.details[0].message});
        }

        await admin.firestore()
            .collection("classes")
            .add({
              instructor,
              date,
              instructorClass,
              shift,
            });

        return response.send({message: "OK"});
      });
    }
);

