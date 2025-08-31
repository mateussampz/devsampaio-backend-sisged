import cors from "cors";
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as joi from "joi";
import dayjs from "dayjs";
import { Timestamp } from "firebase-admin/firestore";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const corsHandler = cors();

const bodySchema: joi.Schema = joi.object({
  instructor: joi.string().required(),
  date: joi.string().required(),
  instructorClass: joi.string().required(),
  shift: joi.string().required(),
  classId: joi.string().required()
}).unknown(false);

export const updateClasses = functions.runWith({timeoutSeconds: 540, memory: "8GB"}).https.onRequest(
    (request: any, response: any) => {
      corsHandler(request, response, async () => {
        const user: any = request.jwt;
        const body: any = request.body;
        const {classId}: any = request.params;

        const ADMIN_UID: string = process.env.ADMIN_UID || functions.config().env.ADMIN_UID || "";
        if (user.uid !== ADMIN_UID) {
          return response.status(403).send({message: "Forbidden"});
        }

        const bodyValidation = bodySchema.validate({...body, classId});

        if (bodyValidation.error) {
          return response.status(404).send({message: bodyValidation.error.details[0]});
        }

        const {instructor, date, instructorClass, shift}: any = body;
        const utcDate = dayjs.tz(date, "America/Sao_Paulo").utc().toDate();
        
        // Get user
        const userDoc: any = admin.firestore().collection("classes").doc(classId);
        const userSnapshot = await userDoc.get();
        if (!userSnapshot.exists) {
          return response.status(404).send({message: "classes not found"});
        }

        await userDoc.update({
          instructor,
          date: Timestamp.fromMillis(utcDate.getTime()),
          instructorClass,
          shift,
        });

        return response.send({message: "OK"});
      });
    }
);
