import { RequestHandler } from "express";

import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response-util";
import parsePagination from "../../utils/parse-pagination";
import UserAddressModel, {
  InsertUserAddressDTO,
  SelectUserAddressDTO,
} from "./user.address.model";
import {
  createUserAddressService,
  deleteUserAddressService,
  findUserAddressByIdService,
  findUserAddressesByUserIdService,
  updateUserAddressService,
} from "./user.address.services";

// *==========*==========*==========POST==========*==========*==========*
export const createUserAddress: RequestHandler = async (req, res) => {
  try {
    const userAddressData: InsertUserAddressDTO = req.body;

    const newUserAddress = await createUserAddressService(userAddressData);

    createSuccessResponse(
      res,
      newUserAddress,
      "UserAddress created successfully",
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getUserAddresss: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = "1", limit = "10" } =
      req.query as unknown as Partial<SelectUserAddressDTO> & {
        page?: string;
        limit?: string;
      };

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { userAddresses, totalItems } =
      await findUserAddressesByUserIdService(userId, limit, offset);

    createSuccessResponse(
      res,
      createPaginatedResponse(
        userAddresses,
        currentPage,
        itemsPerPage,
        totalItems,
      ),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getUserAddressById: RequestHandler = async (req, res) => {
  try {
    const { userAddressId } = req.params;

    const userAddress = await findUserAddressByIdService(userAddressId);

    if (!userAddress) {
      return createErrorResponse(res, "UserAddress not found", 404);
    }

    createSuccessResponse(res, userAddress);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*
export const updateUserAddressById: RequestHandler = async (req, res) => {
  try {
    const { userAddressId } = req.params;
    const userAddressData: Partial<InsertUserAddressDTO> = req.body;

    const existingUserAddress = await findUserAddressByIdService(userAddressId);

    if (!existingUserAddress) {
      return createErrorResponse(res, "UserAddress not found", 404);
    }

    const updatedUserAddress = await updateUserAddressService(
      userAddressId,
      userAddressData,
    );

    createSuccessResponse(res, updatedUserAddress);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteUserAddressById: RequestHandler = async (req, res) => {
  try {
    const { userAddressId } = req.params;
    const deletedUserAddress = await deleteUserAddressService(userAddressId);

    if (!deletedUserAddress) {
      return createErrorResponse(
        res,
        "Something cause userAddress not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted userAddress with id ${deletedUserAddress.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
