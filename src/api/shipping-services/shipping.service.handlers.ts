import { RequestHandler } from "express";

import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response-util";
import parsePagination from "../../utils/parse-pagination";
import ShippingServiceModel, {
  InsertShippingServiceDTO,
  SelectShippingServiceDTO,
} from "./shipping.service.model";
import {
  createShippingServiceService,
  deleteShippingServiceService,
  findShippingServiceByColumnService,
  findShippingServiceByIdService,
  findShippingServicesByFiltersService,
  findShippingServicesLikeColumnService,
  updateShippingServiceService,
} from "./shipping.service.services";

// *==========*==========*==========POST==========*==========*==========*
export const createShippingService: RequestHandler = async (req, res) => {
  try {
    const shippingServiceData: InsertShippingServiceDTO = req.body;

    const shippingService = await findShippingServiceByColumnService(
      shippingServiceData.name,
    );

    if (shippingService) {
      return createErrorResponse(res, "ShippingService already exist", 400);
    }

    const newShippingService =
      await createShippingServiceService(shippingServiceData);

    createSuccessResponse(
      res,
      newShippingService,
      "ShippingService created successfully",
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getShippingServices: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } =
      req.query as unknown as Partial<SelectShippingServiceDTO> & {
        page?: string;
        limit?: string;
      };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { shippingServices, totalItems } =
      await findShippingServicesByFiltersService(limit, offset);

    createSuccessResponse(
      res,
      createPaginatedResponse(
        shippingServices,
        currentPage,
        itemsPerPage,
        totalItems,
      ),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getShippingServicesLikeColumn: RequestHandler = async (
  req,
  res,
) => {
  try {
    const {
      page = "1",
      limit = "10",
      name = "",
    } = req.query as unknown as Partial<SelectShippingServiceDTO> & {
      page?: string;
      limit?: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
    const { shippingServices, totalItems } =
      await findShippingServicesLikeColumnService(
        limit,
        offset,
        ShippingServiceModel.name,
        name,
      );

    createSuccessResponse(
      res,
      createPaginatedResponse(
        shippingServices,
        currentPage,
        itemsPerPage,
        totalItems,
      ),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getShippingServiceById: RequestHandler = async (req, res) => {
  try {
    const { shippingServiceId } = req.params;

    const shippingService =
      await findShippingServiceByIdService(shippingServiceId);

    if (!shippingService) {
      return createErrorResponse(res, "ShippingService not found", 404);
    }

    createSuccessResponse(res, shippingService);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*
export const updateShippingServiceById: RequestHandler = async (req, res) => {
  try {
    const { shippingServiceId } = req.params;
    const shippingServiceData: Partial<InsertShippingServiceDTO> = req.body;

    const existingShippingService =
      await findShippingServiceByIdService(shippingServiceId);

    if (!existingShippingService) {
      return createErrorResponse(res, "ShippingService not found", 404);
    }

    const updatedShippingService = await updateShippingServiceService(
      shippingServiceId,
      shippingServiceData,
    );

    createSuccessResponse(res, updatedShippingService);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteShippingServiceById: RequestHandler = async (req, res) => {
  try {
    const { shippingServiceId } = req.params;
    const deletedShippingService =
      await deleteShippingServiceService(shippingServiceId);

    if (!deletedShippingService) {
      return createErrorResponse(
        res,
        "Something cause shippingService not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted shippingService with id ${deletedShippingService.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
