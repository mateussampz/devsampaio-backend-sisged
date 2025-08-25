import  cors from "cors";
import * as admin from "firebase-admin";
import * as joi from "joi";
import * as functions from "firebase-functions/v1";

const corsHandler = cors();

const bodySchema: joi.Schema = joi.object({
  instructor: joi.string().required(),
  startDate: joi.string().required(),
  endDate: joi.string().required(),
  shift: joi.string().required(),
}).unknown(false);

export const filterInstructors = functions.runWith({timeoutSeconds: 540, memory: "8GB"}).https.onRequest(
    (request: any, response: any) => {
      corsHandler(request, response, async () => {
        const body: any = request.body;

        const {instructor, startDate, endDate, shift} = body;

        const startStateISO = `${startDate}T00:00:00.000Z`;
        const startNewDate = new Date(startStateISO);

        const endStateISO = `${endDate}T23:59:59.999Z`;
        const endNewDate = new Date(endStateISO);

        const bodyValidation: any = bodySchema.validate(body);

        if (bodyValidation.error) {
          return response.status(400).send({message: bodyValidation.error.details[0].message});
        }

        const snapshot = await admin.firestore()
            .collection("classes")
            .where("instructor", "==", instructor)
            .where("date", ">=", startNewDate)
            .where("date", "<=", endNewDate)
            .where("shift", "==", shift)
            .get();

        if (snapshot.empty) {
          return response.status(404).send({message: "Instructors not found"});
        }

        const instructors = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        }));

        return response.send({message: "OK", instructors});
      });
    }
);