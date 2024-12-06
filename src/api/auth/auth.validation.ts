import Joi from "joi";

export const signUpSchema = Joi.object().keys({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(5),
});

export const signInSchema = Joi.object()
  .keys({
    username: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().required().min(5),
  })
  .xor("username", "email");
