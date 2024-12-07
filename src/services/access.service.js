const {
  BadRequestError,
  NotFoundError,
  AuthFailureError,
  ConflictRequestError,
} = require("../core/error.reponse");
const { COLLECTION_NAME_ORDER } = require("../models/order.model");
const { otpModel } = require("../models/otp.model");
const { COLLECTION_NAME_PRODUCT_ORDER } = require("../models/product_order.model");
const { userModel } = require("../models/user.model");
const { hashData, selectFilesData, compareData, selectMainFilesData } = require("../utils");
const OtpService = require("./otp.service");
const TokenService = require("./token.service");

class AccessService {
  static updateStatusUser = async ({ query }) => {
    const { email } = query
    const user = await userModel.findOne({ email }).lean()
    if (!user) throw new BadRequestError('Email not found!')
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    const userUpdated = await userModel.findByIdAndUpdate(user._id, {
      status: newStatus
    }, {
      new: true
    })
    return selectFilesData({ fileds: ['_id', 'email', 'status'], object: userUpdated })
  }

  static getAllUsers = async ({ query }) => {
    const { status } = query

    let pipeline = [
      {
        $lookup: {
          from: COLLECTION_NAME_ORDER,
          localField: '_id',
          foreignField: 'user_id',
          as: 'orders',
          pipeline: [
            {
              $match: {
                payment_status: true
              }
            }, {
              $lookup: {
                from: COLLECTION_NAME_PRODUCT_ORDER,
                localField: '_id',
                foreignField: 'order_id',
                as: 'products_order'
              }
            }, {
              $addFields: {
                sum_order: { $sum: '$products_order.quantity' }
              }
            }
          ]
        }
      }, {
        $addFields: {
          total_orders: { $sum: '$orders.sum_order' }
        }
      }, {
        $project: {
          orders: 0
        }
      }
    ]

    if (status) {
      pipeline = [
        {
          $match: {
            status: status
          }
        },
        ...pipeline
      ]
    }

    const users = await userModel.aggregate(pipeline)

    return users
  }

  static setFcmToken = async ({ query, body }) => {
    const { user_id } = query
    const { fcm_token } = body
    const userUpdated = await userModel.findByIdAndUpdate(user_id, { fcm_token }, { new: true })
    if (!userUpdated) throw new ConflictRequestError('Conflict set fcm token!')
    return userUpdated.fcm_token
  }

  static login = async ({ email, password }) => {
    const userHoder = await userModel.findOne({ email: email }).lean();
    if (!userHoder) throw new AuthFailureError("Email is incorrect!");
    const comparePassword = await compareData({
      data: password,
      hashData: userHoder.password,
    });
    if (!comparePassword) throw new AuthFailureError("Password is not match!");
    if (userHoder.status === "inactive") {
      await OtpService.createAndSendOtp({ userId: userHoder._id });
    }
    const accessToken = await TokenService.generateToken(
      { _id: userHoder._id },
      process.env.PRIVATE_KEY,
      "1h"
    );
    const refreshToken = await TokenService.generateToken(
      { _id: userHoder._id },
      process.env.PUBLIC_KEY,
      "30 days"
    );
    return {
      user: selectFilesData({
        fileds: ["email", "status", "_id"],
        object: userHoder,
      }),
      tokens: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  };

  static signUp = async ({ email, password }) => {
    const hoderEmail = await userModel.findOne({ email: email }).lean();
    if (hoderEmail) throw new ConflictRequestError("Email already exists!");
    const passwordHashed = await hashData(password);
    const newUser = await userModel.create({
      email: email,
      password: passwordHashed,
    });
    if (!newUser)
      throw new ConflictRequestError("Error, unable to register account");
    return {
      newUser: selectFilesData({
        fileds: ["email", "status"],
        object: newUser,
      }),
      newOtp: await OtpService.createAndSendOtp({ userId: newUser._id }),
    };
  };

  static sendOtp = async ({ body }) => {
    const { email } = body;
    const hoderUser = await userModel.findOne({ email }).lean();
    if (!hoderUser) throw new NotFoundError("Email is not found!");
    const newOtp = await OtpService.createAndSendOtp({ userId: hoderUser._id });
    if (!newOtp) throw new ConflictRequestError("Error create otp!");
    return true;
  };

  static verifyAccountOtp = async ({ body }) => {
    const { email, otp } = body;
    const hoderUser = await userModel.findOne({ email: email }).lean();
    if (!hoderUser) throw new NotFoundError("Email is not found!");
    const userId = hoderUser._id;
    const isVerify = await OtpService.verifyOtp({ userId, otp });
    if (isVerify) {
      const userUpdated = await userModel.findByIdAndUpdate(
        { _id: userId },
        { status: "active" },
        { new: true }
      );
      await otpModel.findOneAndDelete({ userId });
      return selectFilesData({
        fileds: ["email", "status", "_id"],
        object: userUpdated,
      });
    }
  };

  static forgotPassword = async ({ email }) => {
    const user = await userModel.findOne({ email }).lean();
    if (!user) throw new NotFoundError("Email not found!");
    const newOtp = await OtpService.createAndSendOtp({ userId: user._id });
    if (!newOtp) throw new ConflictRequestError("Error creating OTP!");
    return true;
  };

  static resetPassword = async ({ email, newPassword }) => {
    const user = await userModel.findOne({ email }).lean();
    if (!user) throw new NotFoundError("Email not found!");

    // Hash new password and update user
    const hashedPassword = await hashData(newPassword);
    const userUpdated = await userModel.findByIdAndUpdate(
      { _id: user._id },
      { password: hashedPassword },
      { new: true }
    );
    return selectFilesData({
      fileds: ["email", "status", "_id"],
      object: userUpdated,
    });
  };
}

module.exports = AccessService;
