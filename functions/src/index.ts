import * as functions from "firebase-functions/v1";
import authMiddleware from "./auth-middleware";
import express from "express";
import * as config from "./app-config";
import cors from "cors";
import Bugsnag from "@bugsnag/js";
import bugsnagPluginExpress from "@bugsnag/plugin-express";


import { authenticationJwt } from "./http/authJwt/authJwt.http";
import { getAllUsers } from "./http/admin/getAllUsers.http";
import { createUser } from "./http/admin/createUser.http";
import { updateUser } from "./http/admin/updateUser.http";
import { getAllInstructors } from "./http/Consultations/getAllInstructors.http";
import { createClasses } from "./http/admin/createNewClasses.http";
import { filterInstructors } from "./http/Consultations/filterInstructors.http";
import { deleteUser } from "./http/admin/deleteUser.http";


config.init();

Bugsnag.start({
  apiKey: functions.config().env.BUGSNAG_API_KEY || process.env.BUGSNAG_API_KEY || "",
  plugins: [bugsnagPluginExpress],
});

const app = express();

const bugsnagMiddleware: any = Bugsnag.getPlugin("express");
app.use(bugsnagMiddleware.requestHandler);
app.use(cors({origin: true}));
app.use(bugsnagMiddleware.errorHandler);

app.get("/", (req: any, res: any) => {
  Bugsnag.notify(new Error("Test error"), function(event: any) {
    event.context = "API Test";
    event.severity = "info";
    event.unhandled = false;
    event.errors[0].errorClass = "Notification";
    // event.setUser(userID, userEmail, userName);
    event.addMetadata("Details", {
      Description: "The main API endpoint was hit. Someone is testing the API.",
    });
  });

  return res.status(200).send({message: "You should not be here."});
});

// Login
app.post("/auth/login", (request: any, response: any) => authenticationJwt(request, response));

// Admin
app.get("/admin/users", authMiddleware.checkToken, (request: any, response: any) => getAllUsers(request, response));
app.post("/admin/users", authMiddleware.checkToken, (request: any, response: any) => createUser(request, response));
app.put("/admin/users/:uid", authMiddleware.checkToken, (request: any, response: any) => updateUser(request, response));
app.post("/admin/classes", authMiddleware.checkToken, (request: any, response: any) => createClasses(request, response));
app.delete("/admin/users/:userId", authMiddleware.checkToken, (request: any, response: any) => deleteUser(request, response));

// Consultations
app.get("/consultations/instructors", authMiddleware.checkToken, (request: any, response: any) => getAllInstructors(request, response));
app.post("/consultations/instructors", authMiddleware.checkToken, (request: any, response: any) => filterInstructors(request, response));

exports.app = functions.runWith({timeoutSeconds: 540, memory: "8GB"}).https.onRequest(app);

