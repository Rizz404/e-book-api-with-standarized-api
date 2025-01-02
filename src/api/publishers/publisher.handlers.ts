import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import PublisherModel, {
  InsertPublisherDTO,
  SelectPublisherDTO,
} from "./publisher.model";
import {
  createPublisherService,
  deletePublisherService,
  findPublisherByColumnService,
  findPublisherByIdService,
  findPublishersByFiltersService,
  findPublishersLikeColumnService,
  updatePublisherService,
} from "./publisher.services";

// *==========*==========*==========POST==========*==========*==========*
export const createPublisher: RequestHandler = async (req, res) => {
  try {
    const publisherData: Pick<
      InsertPublisherDTO,
      "name" | "email" | "description" | "picture" | "website"
    > = req.body;

    const pictureAsFile = req.file;

    // * Cek apakah penulis dengan nama yang sama sudah ada
    const existingPublisher = await findPublisherByColumnService(
      publisherData.name,
    );
    if (existingPublisher) {
      return createErrorResponse(res, "Publisher already exists", 400);
    }

    // * Periksa apakah picture diberikan sebagai file atau string
    const picture =
      pictureAsFile?.cloudinary?.secure_url || publisherData.picture;

    if (pictureAsFile && publisherData.picture) {
      return createErrorResponse(
        res,
        "You cannot provide both file and picture URL",
        400,
      );
    }

    const newPublisher = await createPublisherService({
      ...publisherData,
      picture,
    });

    createSuccessResponse(
      res,
      newPublisher,
      "Publisher created successfully",
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getPublishers: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } =
      req.query as unknown as Partial<SelectPublisherDTO> & {
        page?: string;
        limit?: string;
      };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { publishers, totalItems } = await findPublishersByFiltersService(
      limit,
      offset,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(
        publishers,
        currentPage,
        itemsPerPage,
        totalItems,
      ),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getPublishersLikeColumn: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      name = "",
    } = req.query as unknown as Partial<SelectPublisherDTO> & {
      page?: string;
      limit?: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
    const { publishers, totalItems } = await findPublishersLikeColumnService(
      limit,
      offset,
      PublisherModel.name,
      name,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(
        publishers,
        currentPage,
        itemsPerPage,
        totalItems,
      ),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getPublisherById: RequestHandler = async (req, res) => {
  try {
    const { publisherId } = req.params;

    const publisher = await findPublisherByIdService(publisherId);

    if (!publisher) {
      return createErrorResponse(res, "Publisher not found", 404);
    }

    createSuccessResponse(res, publisher);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*
export const updatePublisherById: RequestHandler = async (req, res) => {
  try {
    const { publisherId } = req.params;
    const publisherData: Partial<InsertPublisherDTO> = req.body;

    const existingPublisher = await findPublisherByIdService(publisherId);

    if (!existingPublisher) {
      return createErrorResponse(res, "Publisher not found", 404);
    }

    const updatedPublisher = await updatePublisherService(
      publisherId,
      publisherData,
    );

    createSuccessResponse(res, updatedPublisher);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deletePublisherById: RequestHandler = async (req, res) => {
  try {
    const { publisherId } = req.params;
    const deletedPublisher = await deletePublisherService(publisherId);

    if (!deletedPublisher) {
      return createErrorResponse(
        res,
        "Something cause publisher not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted publisher with id ${deletedPublisher.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
