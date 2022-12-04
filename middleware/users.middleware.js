const Joi = require('joi');

const schema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string()
    .required()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
  phone: Joi.string().required(),
  password: Joi.string().required(),
  product_id: Joi.string().required(),
  client_id: Joi.string().required(),
  group_id: Joi.string().required(),
  role_id: Joi.string().required(),
});

exports.isInputValidated = async (req, res, next) => {
  // try {
  const result = schema.validate(req.body);
  // console.log(result)
  if ('error' in result) {
    res.status(400).json({
      error: 1,
      data: result,
      msg: 'Validation error(s)',
    });
  } else {
    next();
  }
  // } catch (error) {
  //     res.status(400).json({
  //         error: 1,
  //         data: result,
  //         msg: "Validation error(s)"
  //     });
  // }
};
