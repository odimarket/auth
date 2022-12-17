const Joi = require('joi');

const schema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string()
    .required()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
  phone: Joi.string().required(),
  password: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
  role: Joi.string().required(),
  product_code: Joi.string().required(),
  client: Joi.string().required(),
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
