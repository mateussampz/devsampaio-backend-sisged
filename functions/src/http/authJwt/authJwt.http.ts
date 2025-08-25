import cors from "cors";
import * as functions from "firebase-functions/v1";
import * as jwt from "jsonwebtoken";
import authMiddleware from "../../auth-middleware";
import Jwt from "../../interfaces/jwt.interface";
import * as joi from "joi";

const corsHandler = cors({origin: true});

const jwtSchema: joi.ObjectSchema<Jwt> = joi.object({
  uid: joi.string().required(),
  email: joi.string().email().required(),
}).unknown(false);

export const authenticationJwt = functions.runWith({timeoutSeconds: 540, memory: "8GB"}).https.onRequest(
    (request: any, response: any) => {
      corsHandler(request, response, async () => {
        const body: any = request.body;

        const jwtValidation: any = jwtSchema.validate(body);

        if (jwtValidation.error) {
          return response.status(400).send({message: jwtValidation.error.details[0].message});
        }

        const newAccessToken: string = jwt.sign(body, authMiddleware.MySecretWord, {expiresIn: "24h"});

        return response.send({
          message: "OK",
          accessToken: newAccessToken,
          profile: {...body},
        });
      });
    }
);
