// import express from "express";
// import {
//   createUser,
//   deleteUserById,
//   getUserById,
//   getUserProfile,
//   getUsers,
//   updateUserById,
//   updateUserProfile,
// } from "./user-profile.handlers";
// import { createUserSchema } from "./user-profile.schema";
// import { authMiddleware } from "../../middleware/auth-middleware";
// import roleValidationMiddleware from "../../middleware/role-validation-middleware";
// import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";

// const router = express.Router();

// router
//   .route("/")
//   .post(
//     authMiddleware({ authType: "required" }),
//     roleValidationMiddleware(["ADMIN"]),
//     schemaValidatorMiddleware(createUserSchema),
//     createUser,
//   )
//   .get(authMiddleware({ authType: "required" }), getUsers);
// router
//   .route("/profile")
//   .get(authMiddleware({ authType: "required" }), getUserProfile)
//   .patch(authMiddleware({ authType: "required" }), updateUserProfile);
// router
//   .route("/:userId")
//   .get(getUserById)
//   .patch(
//     authMiddleware({ authType: "required" }),
//     // roleValidationMiddleware(["ADMIN"]),
//     updateUserById,
//   )
//   .delete(
//     authMiddleware({ authType: "required" }),
//     roleValidationMiddleware(["ADMIN"]),
//     deleteUserById,
//   );

// export default router;
